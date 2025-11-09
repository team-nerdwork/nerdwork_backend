import { PinataSDK } from "pinata";
import * as fs from "fs";

export class PinataService {
  private static instance: PinataSDK | null = null;

  /**
   * Initialize Pinata service
   */
  static initialize(jwt: string, gateway: string): PinataSDK {
    if (!this.instance) {
      this.instance = new PinataSDK({
        pinataJwt: jwt,
        pinataGateway: gateway,
      });
    }
    return this.instance;
  }

  /**
   * Get Pinata instance
   */
  static getInstance(): PinataSDK {
    if (!this.instance) {
      throw new Error(
        "Pinata not initialized. Call initialize() first."
      );
    }
    return this.instance;
  }

  /**
   * Upload image file to Pinata IPFS
   */
  static async uploadImageFile(filePath: string, fileName?: string): Promise<string> {
    try {
      const pinata = this.getInstance();
      const fileBuffer = fs.readFileSync(filePath);
      const file = new File([fileBuffer], fileName || "image", {
        type: this.getMimeType(filePath),
      });

      const upload = await pinata.upload.public.file(file).name(fileName || "image");
      return `ipfs://${upload.cid}`;
    } catch (error) {
      console.error("Error uploading image to Pinata:", error);
      throw error;
    }
  }

  /**
   * Upload metadata JSON to Pinata IPFS
   */
  static async uploadMetadataJson(metadata: Record<string, any>): Promise<string> {
    try {
      const pinata = this.getInstance();
      const upload = await pinata.upload.public.json(metadata);
      return `ipfs://${upload.cid}`;
    } catch (error) {
      console.error("Error uploading metadata to Pinata:", error);
      throw error;
    }
  }

  /**
   * Upload NFT metadata and image together
   */
  static async uploadNftMetadata(
    imagePath: string,
    metadata: {
      name: string;
      description: string;
      author?: string;
      series?: string;
      issue?: number;
      genre?: string;
      pages?: number;
      publishDate?: string;
      attributes?: any[];
      [key: string]: any;
    }
  ): Promise<{ imageUri: string; metadataUri: string }> {
    try {
      // Upload image first
      const imageUri = await this.uploadImageFile(imagePath, metadata.name);

      // Create metadata JSON with image URI
      const metadataJson = {
        name: metadata.name,
        description: metadata.description,
        image: imageUri,
        attributes: metadata.attributes || [],
        author: metadata.author || "",
        series: metadata.series || "",
        issue: metadata.issue || 1,
        genre: metadata.genre || "",
        pages: metadata.pages || 1,
        publishDate: metadata.publishDate || new Date().toISOString(),
        properties: {
          category: "image",
          creators: metadata.creators || [],
        },
        ...metadata,
      };

      // Upload metadata
      const metadataUri = await this.uploadMetadataJson(metadataJson);

      return { imageUri, metadataUri };
    } catch (error) {
      console.error("Error uploading NFT metadata:", error);
      throw error;
    }
  }

  /**
   * Get IPFS gateway URL from CID
   */
  static getGatewayUrl(cid: string, gateway?: string): string {
    const pinata = this.getInstance();
    const gatewayUrl = gateway || pinata.gateways.public;
    return `https://${gatewayUrl}/ipfs/${cid}`;
  }

  /**
   * Get IPFS gateway URL from URI
   */
  static getIpfsUrl(uri: string, gateway?: string): string {
    if (uri.startsWith("ipfs://")) {
      const cid = uri.replace("ipfs://", "");
      return this.getGatewayUrl(cid, gateway);
    }
    return uri;
  }

  /**
   * Pin content from external URL
   */
  static async pinFromUrl(url: string, name: string): Promise<string> {
    try {
      const pinata = this.getInstance();
      const upload = await pinata.upload.public.url(url).name(name);
      return `ipfs://${upload.cid}`;
    } catch (error) {
      console.error("Error pinning from URL:", error);
      throw error;
    }
  }

  /**
   * Get MIME type from file path
   */
  private static getMimeType(filePath: string): string {
    const extension = filePath.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      mp4: "video/mp4",
      webm: "video/webm",
      pdf: "application/pdf",
      json: "application/json",
    };
    return mimeTypes[extension || ""] || "application/octet-stream";
  }
}
