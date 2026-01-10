import {
  Keypair,
  PublicKey,
  Connection,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { IDL } from "../idl/nft_minting";
import * as fs from "fs";
import * as path from "path";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export class AnchorProgramService {
  private connection: Connection;
  private program: anchor.Program;
  private platformAuthority: Keypair;
  private platformPda: PublicKey;
  private platformBump: number;

  private readonly PROGRAM_ID = new PublicKey(
    "2L3owCSXA5ety87GMUL7Hf5LmgDDNGT7cpAdD1it1NHx"
  );

  constructor(
    connection: Connection,
    privateKey: string | any | { secretKey: string | any },
    programIdl: typeof IDL
  ) {
    this.connection = connection;

    // Initialize authority keypair from private key
    if (typeof privateKey === "string") {
      const secretKey = JSON.parse(fs.readFileSync(privateKey, "utf-8"));
      this.platformAuthority = Keypair.fromSecretKey(new Uint8Array(secretKey));
    } else {
      console.log(privateKey);
      this.platformAuthority = Keypair.fromSecretKey(
        new Uint8Array((privateKey as any).secretKey || privateKey)
      );
    }

    // Create provider
    const provider = new anchor.AnchorProvider(
      connection,
      new anchor.Wallet(this.platformAuthority),
      { commitment: "confirmed" }
    );

    // Create program instance
    anchor.Program.fetchIdl(
      "8P1rQdfyNp68WWEd9PuZhCeGv9vvV3cUbyGj9qBkkk7N",
      provider
    ).then((idl) => {
      // console.log(idl)
      this.program = new anchor.Program(idl, provider);
    });

    this.program = new anchor.Program(programIdl, provider);

    // Initialize PDA (will be set after derive)
    this.platformPda = new PublicKey(
      "2L3owCSXA5ety87GMUL7Hf5LmgDDNGT7cpAdD1it1NHx"
    );
    this.platformBump = 0;
  }

  /**
   * Derive platform PDA and bump
   */
  async derivePlatformPda(): Promise<{ pda: PublicKey; bump: number }> {
    const [pda, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform"), this.platformAuthority.publicKey.toBuffer()],
      this.PROGRAM_ID
    );

    this.platformPda = pda;
    this.platformBump = bump;

    return { pda, bump };
  }

  /**
   * Initialize the platform (only called once)
   */
  async initializePlatform(): Promise<string> {
    try {
      const tx = await this.program.methods
        .initializePlatform()
        .accounts({
          platform: this.platformPda,
          authority: this.platformAuthority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Platform initialized:", tx);
      return tx;
    } catch (error) {
      console.error("Platform initialization error:", error);
      throw error;
    }
  }

  /**
   * Mint NFT for a user
   */
  async mintNft(
    userId: string,
    userWalletAddress: PublicKey,
    nftName: string,
    nftUri: string
  ): Promise<{
    mintAddress: string;
    signature: string;
    nftInfoPda: string;
  }> {
    try {
      // Create mint keypair
      const mint = Keypair.generate();

      // Derive NFT info PDA
      const [nftInfoPda, nftInfoBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("nft_info"), mint.publicKey.toBuffer()],
        this.PROGRAM_ID
      );

      // Derive user's associated token account
      const userTokenAccount = this.deriveAssociatedTokenAccount(
        userWalletAddress,
        mint.publicKey
      );

      // Call mint_nft instruction
      const tx = await this.program.methods
        .mintNft(nftName, nftUri)
        .accounts({
          platform: this.platformPda,
          mint: mint.publicKey,
          nftInfo: nftInfoPda,
          userTokenAccount: userTokenAccount,
          user: userWalletAddress,
          payer: this.platformAuthority.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .signers([mint])
        .rpc();

      console.log(`NFT minted for user ${userId}:`, tx);

      return {
        mintAddress: mint.publicKey.toString(),
        signature: tx,
        nftInfoPda: nftInfoPda.toString(),
      };
    } catch (error) {
      console.error("NFT minting error:", error);
      throw error;
    }
  }

  /**
   * Transfer NFT from one user to another
   */
  async transferNft(
    fromUser: PublicKey,
    toUser: PublicKey,
    mintAddress: PublicKey,
    platformAuthorityRequired: boolean = true
  ): Promise<string> {
    try {
      // Derive NFT info PDA
      const [nftInfoPda, nftInfoBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("nft_info"), mintAddress.toBuffer()],
        this.PROGRAM_ID
      );

      // Derive token accounts
      const fromTokenAccount = this.deriveAssociatedTokenAccount(
        fromUser,
        mintAddress
      );
      const toTokenAccount = this.deriveAssociatedTokenAccount(
        toUser,
        mintAddress
      );

      // Build transaction
      const tx = await this.program.methods
        .transferNft()
        .accounts({
          platform: this.platformPda,
          nftInfo: nftInfoPda,
          mint: mintAddress,
          fromTokenAccount: fromTokenAccount,
          toTokenAccount: toTokenAccount,
          fromUser: fromUser,
          toUser: toUser,
          platformAuthority: this.platformAuthority.publicKey,
          payer: this.platformAuthority.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .rpc();

      console.log(`NFT transferred from ${fromUser} to ${toUser}:`, tx);
      return tx;
    } catch (error) {
      console.error("NFT transfer error:", error);
      throw error;
    }
  }

  /**
   * Get NFT info for a specific mint
   */
  async getNftInfo(mintAddress: PublicKey): Promise<{
    owner: PublicKey;
    name: string;
    uri: string;
  }> {
    try {
      const [nftInfoPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("nft_info"), mintAddress.toBuffer()],
        this.PROGRAM_ID
      );

      const nftInfo = await (this.program.account as any).nftInfo.fetch(
        nftInfoPda
      );

      return {
        owner: nftInfo.owner,
        name: nftInfo.name,
        uri: nftInfo.uri,
      };
    } catch (error) {
      console.error("Failed to fetch NFT info:", error);
      throw error;
    }
  }

  /**
   * Get platform info
   */
  async getPlatformInfo(): Promise<{
    authority: PublicKey;
    nftCount: number;
  }> {
    try {
      console.log(this.platformPda);
      const platformInfo = await (this.program.account as any).platform.fetch(
        this.platformPda
      );

      return {
        authority: platformInfo.authority,
        nftCount: platformInfo.nftCount.toNumber(),
      };
    } catch (error) {
      console.error("Failed to fetch platform info:", error);
      throw error;
    }
  }

  /**
   * Get all NFTs owned by a user
   */
  async getUserNfts(userAddress: PublicKey): Promise<
    Array<{
      mint: PublicKey;
      owner: PublicKey;
      name: string;
      uri: string;
      nftInfoPda: PublicKey;
    }>
  > {
    try {
      // Query all NftInfo accounts where owner matches the user
      const nftAccounts = await (this.program.account as any).nftInfo.all([
        {
          memcmp: {
            offset: 32, // owner is at offset 32 (after mint: 32 bytes)
            bytes: userAddress.toBase58(),
          },
        },
      ]);

      return nftAccounts.map((account) => ({
        mint: account.account.mint,
        owner: account.account.owner,
        name: account.account.name,
        uri: account.account.uri,
        nftInfoPda: account.publicKey,
      }));
    } catch (error) {
      console.error("Failed to fetch user NFTs:", error);
      throw error;
    }
  }

  /**
   * Get all NFTs for a user by checking their token accounts
   * This is a more reliable method using the connection
   */
  async getUserNftsByTokenAccounts(userAddress: PublicKey): Promise<
    Array<{
      mint: PublicKey;
      tokenAccount: PublicKey;
      amount: number;
    }>
  > {
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        userAddress,
        { programId: TOKEN_PROGRAM_ID }
      );

      const userNfts = tokenAccounts.value
        .filter((account) => {
          const tokenAmount = account.account.data.parsed.info.tokenAmount;
          // NFTs have decimals = 0 and amount = 1
          return (
            tokenAmount.decimals === 0 && parseInt(tokenAmount.amount) === 1
          );
        })
        .map((account) => ({
          mint: new PublicKey(account.account.data.parsed.info.mint),
          tokenAccount: account.pubkey,
          amount: 1,
        }));

      return userNfts;
    } catch (error) {
      console.error("Failed to fetch user NFTs by token accounts:", error);
      throw error;
    }
  }

  /**
   * Get all platform-minted NFTs
   */
  async getPlatformNfts(): Promise<
    Array<{
      mint: PublicKey;
      owner: PublicKey;
      name: string;
      uri: string;
      nftInfoPda: PublicKey;
    }>
  > {
    try {
      const nftAccounts = await (this.program.account as any).nftInfo.all();

      return nftAccounts.map((account) => ({
        mint: account.account.mint,
        owner: account.account.owner,
        name: account.account.name,
        uri: account.account.uri,
        nftInfoPda: account.publicKey,
      }));
    } catch (error) {
      console.error("Failed to fetch platform NFTs:", error);
      throw error;
    }
  }

  /**
   * Helper: Derive associated token account
   */
  private deriveAssociatedTokenAccount(
    owner: PublicKey,
    mint: PublicKey
  ): PublicKey {
    return PublicKey.findProgramAddressSync(
      [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];
  }

  /**
   * Get program instance
   */
  getProgram(): anchor.Program {
    return this.program;
  }

  /**
   * Get connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get platform authority public key
   */
  getPlatformAuthority(): PublicKey {
    return this.platformAuthority.publicKey;
  }

  /**
   * Get platform PDA
   */
  getPlatformPda(): PublicKey {
    return this.platformPda;
  }
}

// Export singleton instance
let anchorService: AnchorProgramService | null = null;

export function initializeAnchorService(
  connection: Connection,
  privateKey: string | number[],
  programIdl: typeof IDL
): AnchorProgramService {
  if (!anchorService) {
    anchorService = new AnchorProgramService(
      connection,
      privateKey,
      programIdl
    );
  }
  return anchorService;
}

export function getAnchorService(): AnchorProgramService {
  if (!anchorService) {
    throw new Error(
      "Anchor service not initialized. Call initializeAnchorService first."
    );
  }
  return anchorService;
}
