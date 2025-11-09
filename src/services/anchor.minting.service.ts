import { PublicKey } from "@solana/web3.js";
import { getAnchorService } from "./anchor.program";
import { db } from "../config/db";
import { nft } from "../model/nft";
import { userWallets } from "../model/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";

export interface MintNftRequest {
  userProfileId: string;
  userWalletAddress: string;
  nftName: string;
  nftUri: string;
  description?: string;
  author?: string;
  series?: string;
  issue?: number;
  genre?: string;
  pages?: number;
  publishDate?: string;
  attributes?: Record<string, any>;
}

export interface MintNftResponse {
  success: boolean;
  mintAddress: string;
  nftInfoPda: string;
  signature: string;
  message: string;
  nftData?: {
    name: string;
    uri: string;
    owner: string;
  };
}

export class AnchorMintingService {
  /**
   * Mint an NFT for a user
   */
  static async mintNft(request: MintNftRequest): Promise<MintNftResponse> {
    const anchorService = getAnchorService();

    try {
      // Validate inputs
      if (!request.userProfileId || !request.userWalletAddress) {
        throw new Error(
          "userProfileId and userWalletAddress are required"
        );
      }

      if (!request.nftName || !request.nftUri) {
        throw new Error("nftName and nftUri are required");
      }

      // Validate wallet address
      let userWallet: PublicKey;
      try {
        userWallet = new PublicKey(request.userWalletAddress);
      } catch {
        throw new Error("Invalid wallet address format");
      }

      // Call anchor contract
      const mintResult = await anchorService.mintNft(
        request.userProfileId,
        userWallet,
        request.nftName,
        request.nftUri
      );

      // Store NFT metadata in database
      await this.saveNftMetadata(
        request.userProfileId,
        mintResult.mintAddress,
        request,
        mintResult.signature
      );

      return {
        success: true,
        mintAddress: mintResult.mintAddress,
        nftInfoPda: mintResult.nftInfoPda,
        signature: mintResult.signature,
        nftData: {
          name: request.nftName,
          uri: request.nftUri,
          owner: request.userWalletAddress,
        },
        message: "NFT minted successfully",
      };
    } catch (error) {
      console.error("Minting service error:", error);
      throw error;
    }
  }

  /**
   * Save NFT metadata to database
   */
  private static async saveNftMetadata(
    userProfileId: string,
    mintAddress: string,
    request: MintNftRequest,
    signature: string
  ): Promise<void> {
    try {
      // Get user wallet ID
      const userWallet = await db
        .select()
        .from(userWallets)
        .where(eq(userWallets.userProfileId, userProfileId))
        .limit(1);

      if (!userWallet || userWallet.length === 0) {
        console.warn(`User wallet not found for userProfileId: ${userProfileId}`);
        return;
      }

      // Prepare metadata
      const metadata = {
        name: request.nftName,
        description: request.description || "",
        author: request.author || "",
        series: request.series || "",
        issue: request.issue || 1,
        genre: request.genre || "",
        pages: request.pages || 1,
        publishDate: request.publishDate || new Date().toISOString(),
        uri: request.nftUri,
        mintAddress: mintAddress,
        signature: signature,
        attributes: request.attributes || {},
      };

      // Insert NFT record
      await db.insert(nft).values({
        owner: userWallet[0].id,
        colection: "anchor", // Mark as Anchor-based NFT
        price: 0,
        isLimitedEdition: false,
        amount: 1,
        metadata: metadata,
        status: "completed",
      });

      console.log(`NFT metadata saved for user ${userProfileId}`);
    } catch (error) {
      console.error("Error saving NFT metadata:", error);
      // Don't throw - NFT was minted successfully, just log the error
    }
  }

  /**
   * Get NFT details by mint address
   */
  static async getNftDetails(
    mintAddress: string
  ): Promise<{
    mint: string;
    owner: string;
    name: string;
    uri: string;
  }> {
    const anchorService = getAnchorService();

    try {
      const mintPubkey = new PublicKey(mintAddress);
      const nftInfo = await anchorService.getNftInfo(mintPubkey);

      return {
        mint: mintAddress,
        owner: nftInfo.owner.toString(),
        name: nftInfo.name,
        uri: nftInfo.uri,
      };
    } catch (error) {
      console.error("Error fetching NFT details:", error);
      throw error;
    }
  }

  /**
   * Get platform minting statistics
   */
  static async getPlatformStats(): Promise<{
    totalMinted: number;
    authority: string;
  }> {
    const anchorService = getAnchorService();

    try {
      const platformInfo = await anchorService.getPlatformInfo();

      return {
        totalMinted: platformInfo.nftCount,
        authority: platformInfo.authority.toString(),
      };
    } catch (error) {
      console.error("Error fetching platform stats:", error);
      throw error;
    }
  }
}
