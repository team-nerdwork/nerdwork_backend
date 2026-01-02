import { PublicKey } from "@solana/web3.js";
import { getAnchorService } from "./anchor.program";
import { db } from "../config/db";
import { nft } from "../model/nft";
import { userWallets } from "../model/schema";
import { eq } from "drizzle-orm";

export interface TransferNftRequest {
  mintAddress: string;
  fromUserProfileId: string;
  fromUserWalletAddress: string;
  toUserProfileId?: string;
  toUserWalletAddress: string;
}

export interface TransferNftResponse {
  
  success: boolean;
  signature: string;
  mintAddress: string;
  fromAddress: string;
  toAddress: string;
  message: string;
}

export class AnchorTransferService {
  /**
   * Transfer NFT from one user to another
   */
  static async transferNft(
    request: TransferNftRequest
  ): Promise<TransferNftResponse> {
    const anchorService = getAnchorService();

    try {
      // Validate inputs
      if (!request.mintAddress || !request.fromUserWalletAddress || !request.toUserWalletAddress) {
        throw new Error(
          "mintAddress, fromUserWalletAddress, and toUserWalletAddress are required"
        );
      }

      // Validate wallet addresses
      let fromWallet: PublicKey;
      let toWallet: PublicKey;

      try {
        fromWallet = new PublicKey(request.fromUserWalletAddress);
        toWallet = new PublicKey(request.toUserWalletAddress);
      } catch {
        throw new Error("Invalid wallet address format");
      }

      // Validate mint address
      let mintAddress: PublicKey;
      try {
        mintAddress = new PublicKey(request.mintAddress);
      } catch {
        throw new Error("Invalid mint address format");
      }

      // Verify NFT ownership before transfer
      const nftInfo = await anchorService.getNftInfo(mintAddress);
      if (nftInfo.owner.toString() !== request.fromUserWalletAddress) {
        throw new Error(
          "NFT is not owned by the from_user. Cannot transfer."
        );
      }

      // Execute transfer on chain
      const signature = await anchorService.transferNft(
        fromWallet,
        toWallet,
        mintAddress
      );

      // Update database records
      await this.updateNftOwnership(
        request.mintAddress,
        request.fromUserProfileId,
        request.toUserProfileId,
        request.toUserWalletAddress
      );

      return {
        success: true,
        signature: signature,
        mintAddress: request.mintAddress,
        fromAddress: request.fromUserWalletAddress,
        toAddress: request.toUserWalletAddress,
        message: "NFT transferred successfully",
      };
    } catch (error) {
      console.error("Transfer service error:", error);
      throw error;
    }
  }

  /**
   * Update NFT ownership in database
   */
  private static async updateNftOwnership(
    mintAddress: string,
    fromUserProfileId: string,
    toUserProfileId: string | undefined,
    toWalletAddress: string
  ): Promise<void> {
    try {
      // Get the NFT record by mint address (stored in metadata)
      const nftRecords = await db
        .select()
        .from(nft)
        .where(eq(nft.colection, "anchor"));

      if (!nftRecords || nftRecords.length === 0) {
        console.warn("NFT record not found in database");
        return;
      }

      // Find the specific NFT by mint address in metadata
      const nftRecord = nftRecords.find(
        (record) =>
          record.metadata &&
          typeof record.metadata === "object" &&
          (record.metadata as any).mintAddress === mintAddress
      );

      if (!nftRecord) {
        console.warn(`NFT record not found for mint ${mintAddress}`);
        return;
      }

      // If toUserProfileId is provided, get their wallet ID
      if (toUserProfileId) {
        const toUserWallet = await db
          .select()
          .from(userWallets)
          .where(eq(userWallets.userProfileId, toUserProfileId))
          .limit(1);

        if (toUserWallet && toUserWallet.length > 0) {
          // Update NFT ownership to new user
          await db
            .update(nft)
            .set({
              owner: toUserWallet[0].id,
              metadata: {
                ...(nftRecord.metadata as object),
                previousOwner: fromUserProfileId,
                transferredAt: new Date().toISOString(),
                transferredTo: toWalletAddress,
              },
            })
            .where(eq(nft.id, nftRecord.id));
        }
      } else {
        // Just update the metadata with transfer info
        await db
          .update(nft)
          .set({
            metadata: {
              ...(nftRecord.metadata as object),
              lastTransferredAt: new Date().toISOString(),
              currentOwner: toWalletAddress,
            },
          })
          .where(eq(nft.id, nftRecord.id));
      }

      console.log(`NFT ownership updated for mint ${mintAddress}`);
    } catch (error) {
      console.error("Error updating NFT ownership:", error);
      // Don't throw - transfer was successful, just log the error
    }
  }

  /**
   * Platform-initiated transfer (company transfers to user)
   * This is the main use case - company mints and then transfers to user
   */
  static async platformTransferNft(
    mintAddress: string,
    userWalletAddress: string,
    userProfileId: string
  ): Promise<TransferNftResponse> {
    const anchorService = getAnchorService();

    try {
      const platformAuthority = anchorService.getPlatformAuthority();

      return this.transferNft({
        mintAddress: mintAddress,
        fromUserProfileId: "", // Platform is transferring
        fromUserWalletAddress: platformAuthority.toString(),
        toUserProfileId: userProfileId,
        toUserWalletAddress: userWalletAddress,
      });
    } catch (error) {
      console.error("Platform transfer error:", error);
      throw error;
    }
  }

  /**
   * Check if user owns an NFT
   */
  static async verifyOwnership(
    mintAddress: string,
    userWalletAddress: string
  ): Promise<boolean> {
    const anchorService = getAnchorService();

    try {
      const mintPubkey = new PublicKey(mintAddress);
      const nftInfo = await anchorService.getNftInfo(mintPubkey);

      return nftInfo.owner.toString() === userWalletAddress;
    } catch (error) {
      console.error("Error verifying ownership:", error);
      return false;
    }
  }

  /**
   * Get NFT transfer history from database
   */
  static async getNftTransferHistory(mintAddress: string): Promise<any[]> {
    try {
      const nftRecords = await db
        .select()
        .from(nft)
        .where(eq(nft.colection, "anchor"));

      const nftRecord = nftRecords.find(
        (record) =>
          record.metadata &&
          typeof record.metadata === "object" &&
          (record.metadata as any).mintAddress === mintAddress
      );

      if (!nftRecord || !nftRecord.metadata) {
        return [];
      }

      const metadata = nftRecord.metadata as any;
      const history = [];

      if (metadata.signature) {
        history.push({
          type: "minted",
          timestamp: metadata.publishDate || new Date().toISOString(),
          signature: metadata.signature,
        });
      }

      if (metadata.transferredAt) {
        history.push({
          type: "transferred",
          timestamp: metadata.transferredAt,
          from: metadata.previousOwner,
          to: metadata.transferredTo,
        });
      }

      return history;
    } catch (error) {
      console.error("Error fetching transfer history:", error);
      return [];
    }
  }
}
