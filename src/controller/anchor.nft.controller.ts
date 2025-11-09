import { Request, Response } from "express";
import { PublicKey } from "@solana/web3.js";
import { AnchorMintingService, MintNftRequest } from "../services/anchor.minting.service";
import { AnchorTransferService, TransferNftRequest } from "../services/anchor.transfer.service";
import { getAnchorService } from "../services/anchor.program";
import { PinataService } from "../services/pinata.service";
import multer from "multer";
import * as fs from "fs";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = "uploads/nft-images";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
      )
    );
  }
};

export const uploadMiddleware = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

/**
 * Mint NFT with image upload
 * POST /anchor-nft/mint
 */
export const mintNftWithImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Image file is required" });
      return;
    }

    const {
      userProfileId,
      userWalletAddress,
      nftName,
      description,
      author,
      series,
      issue,
      genre,
      pages,
      publishDate,
      attributes,
    } = req.body;

    // Validate required fields
    if (!userProfileId || !userWalletAddress || !nftName) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({
        error: "userProfileId, userWalletAddress, and nftName are required",
      });
      return;
    }

    // Upload image to Pinata IPFS
    let imageUri: string;
    try {
      imageUri = await PinataService.uploadImageFile(
        req.file.path,
        `${nftName}-${Date.now()}`
      );
    } catch (ipfsError) {
      console.error("IPFS upload error:", ipfsError);
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        error: "Failed to upload image to IPFS",
        details: (ipfsError as any).message,
      });
      return;
    }

    // Create metadata and upload to Pinata
    const metadata = {
      name: nftName,
      description: description || "",
      author: author || "",
      series: series || "",
      issue: parseInt(issue) || 1,
      genre: genre || "",
      pages: parseInt(pages) || 1,
      publishDate: publishDate || new Date().toISOString(),
      image: imageUri,
      attributes: attributes ? JSON.parse(attributes) : [],
    };

    let metadataUri: string;
    try {
      metadataUri = await PinataService.uploadMetadataJson(metadata);
    } catch (ipfsError) {
      console.error("Metadata IPFS upload error:", ipfsError);
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        error: "Failed to upload metadata to IPFS",
        details: (ipfsError as any).message,
      });
      return;
    }

    // Mint NFT on chain
    const mintRequest: MintNftRequest = {
      userProfileId,
      userWalletAddress,
      nftName,
      nftUri: metadataUri,
      description,
      author,
      series,
      issue: parseInt(issue),
      genre,
      pages: parseInt(pages),
      publishDate,
      attributes: metadata.attributes,
    };

    try {
      const result = await AnchorMintingService.mintNft(mintRequest);

      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(200).json({
        success: true,
        data: {
          mintAddress: result.mintAddress,
          nftInfoPda: result.nftInfoPda,
          signature: result.signature,
          imageUri: imageUri,
          metadataUri: metadataUri,
          nft: result.nftData,
        },
        message: result.message,
      });
    } catch (chainError) {
      console.error("Minting error:", chainError);
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({
        error: "Failed to mint NFT",
        details: (chainError as any).message,
      });
    }
  } catch (error) {
    console.error("Mint endpoint error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      error: "Internal server error",
      details: (error as any).message,
    });
  }
};

/**
 * Mint NFT with external image URL (no file upload)
 * POST /anchor-nft/mint-url
 */
export const mintNftWithUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userProfileId,
      userWalletAddress,
      nftName,
      imageUrl,
      description,
      author,
      series,
      issue,
      genre,
      pages,
      publishDate,
      attributes,
    } = req.body;

    // Validate required fields
    if (!userProfileId || !userWalletAddress || !nftName || !imageUrl) {
      res.status(400).json({
        error: "userProfileId, userWalletAddress, nftName, and imageUrl are required",
      });
      return;
    }

    // Pin image from URL to Pinata
    let imageUri: string;
    try {
      imageUri = await PinataService.pinFromUrl(imageUrl, `${nftName}-${Date.now()}`);
    } catch (ipfsError) {
      console.error("IPFS pin error:", ipfsError);
      res.status(500).json({
        error: "Failed to pin image to IPFS",
        details: (ipfsError as any).message,
      });
      return;
    }

    // Create and upload metadata
    const metadata = {
      name: nftName,
      description: description || "",
      author: author || "",
      series: series || "",
      issue: parseInt(issue) || 1,
      genre: genre || "",
      pages: parseInt(pages) || 1,
      publishDate: publishDate || new Date().toISOString(),
      image: imageUri,
      attributes: attributes ? JSON.parse(attributes) : [],
    };

    let metadataUri: string;
    try {
      metadataUri = await PinataService.uploadMetadataJson(metadata);
    } catch (ipfsError) {
      console.error("Metadata IPFS upload error:", ipfsError);
      res.status(500).json({
        error: "Failed to upload metadata to IPFS",
        details: (ipfsError as any).message,
      });
      return;
    }

    // Mint NFT on chain
    const mintRequest: MintNftRequest = {
      userProfileId,
      userWalletAddress,
      nftName,
      nftUri: metadataUri,
      description,
      author,
      series,
      issue: parseInt(issue),
      genre,
      pages: parseInt(pages),
      publishDate,
      attributes: metadata.attributes,
    };

    try {
      const result = await AnchorMintingService.mintNft(mintRequest);

      res.status(200).json({
        success: true,
        data: {
          mintAddress: result.mintAddress,
          nftInfoPda: result.nftInfoPda,
          signature: result.signature,
          imageUri: imageUri,
          metadataUri: metadataUri,
          nft: result.nftData,
        },
        message: result.message,
      });
    } catch (chainError) {
      console.error("Minting error:", chainError);
      res.status(500).json({
        error: "Failed to mint NFT",
        details: (chainError as any).message,
      });
    }
  } catch (error) {
    console.error("Mint endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: (error as any).message,
    });
  }
};

/**
 * Transfer NFT to user
 * POST /anchor-nft/transfer
 */
export const transferNft = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      mintAddress,
      fromUserProfileId,
      fromUserWalletAddress,
      toUserProfileId,
      toUserWalletAddress,
    } = req.body;

    // Validate required fields
    if (!mintAddress || !fromUserWalletAddress || !toUserWalletAddress) {
      res.status(400).json({
        error: "mintAddress, fromUserWalletAddress, and toUserWalletAddress are required",
      });
      return;
    }

    const transferRequest: TransferNftRequest = {
      mintAddress,
      fromUserProfileId,
      fromUserWalletAddress,
      toUserProfileId,
      toUserWalletAddress,
    };

    try {
      const result = await AnchorTransferService.transferNft(transferRequest);

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (chainError) {
      console.error("Transfer error:", chainError);
      res.status(500).json({
        error: "Failed to transfer NFT",
        details: (chainError as any).message,
      });
    }
  } catch (error) {
    console.error("Transfer endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: (error as any).message,
    });
  }
};

/**
 * Platform-initiated transfer (mint then transfer)
 * POST /anchor-nft/platform-transfer
 */
export const platformTransferNft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mintAddress, userWalletAddress, userProfileId } = req.body;

    if (!mintAddress || !userWalletAddress) {
      res.status(400).json({
        error: "mintAddress and userWalletAddress are required",
      });
      return;
    }

    try {
      const result = await AnchorTransferService.platformTransferNft(
        mintAddress,
        userWalletAddress,
        userProfileId
      );

      res.status(200).json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (chainError) {
      console.error("Platform transfer error:", chainError);
      res.status(500).json({
        error: "Failed to transfer NFT",
        details: (chainError as any).message,
      });
    }
  } catch (error) {
    console.error("Platform transfer endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: (error as any).message,
    });
  }
};

/**
 * Get user NFTs
 * GET /anchor-nft/user/:userWalletAddress
 */
export const getUserNfts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userWalletAddress } = req.params;

    if (!userWalletAddress) {
      res.status(400).json({ error: "userWalletAddress is required" });
      return;
    }

    try {
      const userAddress = new PublicKey(userWalletAddress);
      const anchorService = getAnchorService();

      // Get NFTs from blockchain
      const nfts = await anchorService.getUserNftsByTokenAccounts(userAddress);

      // Fetch detailed info for each NFT
      const nftDetails = await Promise.all(
        nfts.map(async (nft) => {
          try {
            const info = await anchorService.getNftInfo(nft.mint);
            return {
              mint: nft.mint.toString(),
              tokenAccount: nft.tokenAccount.toString(),
              owner: info.owner.toString(),
              name: info.name,
              uri: info.uri,
              metadataUrl: PinataService.getIpfsUrl(info.uri),
            };
          } catch {
            return {
              mint: nft.mint.toString(),
              tokenAccount: nft.tokenAccount.toString(),
              error: "Failed to fetch NFT details",
            };
          }
        })
      );

      res.status(200).json({
        success: true,
        data: {
          userWalletAddress,
          nftCount: nftDetails.length,
          nfts: nftDetails,
        },
      });
    } catch (chainError) {
      console.error("Fetch user NFTs error:", chainError);
      res.status(500).json({
        error: "Failed to fetch user NFTs",
        details: (chainError as any).message,
      });
    }
  } catch (error) {
    console.error("Get user NFTs endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: (error as any).message,
    });
  }
};

/**
 * Get NFT details
 * GET /anchor-nft/:mintAddress
 */
export const getNftDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mintAddress } = req.params;

    if (!mintAddress) {
      res.status(400).json({ error: "mintAddress is required" });
      return;
    }

    try {
      const details = await AnchorMintingService.getNftDetails(mintAddress);

      res.status(200).json({
        success: true,
        data: {
          ...details,
          metadataUrl: PinataService.getIpfsUrl(details.uri),
        },
      });
    } catch (chainError) {
      console.error("Fetch NFT details error:", chainError);
      res.status(500).json({
        error: "Failed to fetch NFT details",
        details: (chainError as any).message,
      });
    }
  } catch (error) {
    console.error("Get NFT details endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: (error as any).message,
    });
  }
};

/**
 * Get platform statistics
 * GET /anchor-nft/stats
 */
export const getPlatformStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await AnchorMintingService.getPlatformStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get platform stats error:", error);
    res.status(500).json({
      error: "Failed to fetch platform stats",
      details: (error as any).message,
    });
  }
};

/**
 * Verify NFT ownership
 * GET /anchor-nft/verify-ownership/:mintAddress/:userWalletAddress
 */
export const verifyOwnership = async (req: Request, res: Response): Promise<void> => {
  try {
    const { mintAddress, userWalletAddress } = req.params;

    if (!mintAddress || !userWalletAddress) {
      res.status(400).json({
        error: "mintAddress and userWalletAddress are required",
      });
      return;
    }

    try {
      const isOwner = await AnchorTransferService.verifyOwnership(
        mintAddress,
        userWalletAddress
      );

      res.status(200).json({
        success: true,
        data: {
          mintAddress,
          userWalletAddress,
          isOwner,
        },
      });
    } catch (chainError) {
      console.error("Verify ownership error:", chainError);
      res.status(500).json({
        error: "Failed to verify ownership",
        details: (chainError as any).message,
      });
    }
  } catch (error) {
    console.error("Verify ownership endpoint error:", error);
    res.status(500).json({
      error: "Internal server error",
      details: (error as any).message,
    });
  }
};

/**
 * Health check
 * GET /anchor-nft/health
 */
export const healthCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    const anchorService = getAnchorService();
    const platformInfo = await anchorService.getPlatformInfo();

    res.status(200).json({
      success: true,
      status: "healthy",
      platform: {
        authority: platformInfo.authority.toString(),
        totalNfts: platformInfo.nftCount,
      },
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: (error as any).message,
    });
  }
};
