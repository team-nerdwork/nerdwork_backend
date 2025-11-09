import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import { initializeAnchorService } from "../services/anchor.program";
import { PinataService } from "../services/pinata.service";
import { IDL } from "../idl/nft_minting";
import * as fs from "fs";

/**
 * Anchor Configuration for NFT Minting Program
 */
export class AnchorConfig {
  private static initialized = false;

  /**
   * Get Solana connection
   */
  static getConnection(): Connection {
    const network = process.env.SOLANA_NETWORK || "devnet";
    const rpcUrl =
      process.env.SOLANA_RPC_URL || clusterApiUrl(network as any);
    return new Connection(rpcUrl, "confirmed");
  }

  /**
   * Get private key from environment
   */
  static getPrivateKey(): number[] {
    const privateKeyEnv = process.env.ANCHOR_PRIVATE_KEY;

    if (!privateKeyEnv) {
      throw new Error(
        "ANCHOR_PRIVATE_KEY environment variable is required"
      );
    }

    // Try to parse as JSON array first
    try {
      console.log(JSON.parse(privateKeyEnv))
      return JSON.parse(privateKeyEnv);
    } catch {
      // If not JSON, try to read from file path
      if (fs.existsSync(privateKeyEnv)) {
        try {
          return JSON.parse(fs.readFileSync(privateKeyEnv, "utf-8"));
        } catch (error) {
          throw new Error(
            `Failed to parse private key from file: ${privateKeyEnv}`
          );
        }
      }
      throw new Error(
        "ANCHOR_PRIVATE_KEY must be a valid JSON array or file path"
      );
    }
  }

  /**
   * Initialize Anchor Program Service
   */
  static async initializeAnchor(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const connection = this.getConnection();
      const privateKey = this.getPrivateKey();
      console.log(privateKey)

      initializeAnchorService(connection, privateKey, IDL);

      console.log("✓ Anchor NFT Program initialized successfully");
      console.log(`✓ Network: ${process.env.SOLANA_NETWORK || "devnet"}`);
      console.log(
        `✓ Program ID: 8P1rQdfyNp68WWEd9PuZhCeGv9vvV3cUbyGj9qBkkk7N`
      );

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize Anchor NFT Program:", error);
      throw error;
    }
  }

  /**
   * Initialize Pinata IPFS Service
   */
  static initializePinata(): void {
    const pinataJwt = process.env.PINATA_JWT;
    const pinataGateway = process.env.PINATA_GATEWAY;

    if (!pinataJwt || !pinataGateway) {
      console.warn(
        "⚠ Pinata not configured (PINATA_JWT and PINATA_GATEWAY required for IPFS uploads)"
      );
      return;
    }

    try {
      PinataService.initialize(pinataJwt, pinataGateway);
      console.log("✓ Pinata IPFS service initialized successfully");
      console.log(`✓ Gateway: ${pinataGateway}`);
    } catch (error) {
      console.error("Failed to initialize Pinata:", error);
      throw error;
    }
  }

  /**
   * Initialize all services
   */
  static async initializeAll(): Promise<void> {
    await this.initializeAnchor();
    this.initializePinata();
  }
}
