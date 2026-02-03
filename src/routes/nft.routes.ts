import { Router } from "express";
import {
  mintNftWithImage,
  getUserNfts,
  getNftDetails,
  transferNft,
} from "../controller/anchor.nft.controller";
import {
  listNft,
  getListings,
  buyNft,
  delistNft,
  getStats,
} from "../controller/marketplace.controller";
import { upload } from "../controller/nft.controller"; // Standard multer config

const router = Router();

/**
 * @swagger
 * tags:
 *   name: NFT Marketplace
 *   description: Comic NFT creation, trading, and portfolio management
 */

// ==========================================
// 1. CREATOR ACTIONS (Minting Comics)
// ==========================================

/**
 * @swagger
 * /nft/mint:
 * post:
 * summary: Create (Mint) a new Comic NFT
 * description: Uploads the comic cover to Irys (Arweave) and creates the NFT on Solana.
 * tags: [NFT Marketplace]
 * consumes:
 * - multipart/form-data
 */
router.post("/mint", upload.single("image"), mintNftWithImage);

// ==========================================
// 2. MARKETPLACE ACTIONS (Trading)
// ==========================================

/**
 * @swagger
 * /nft/market/explore:
 * get:
 * summary: Get all active comic listings
 * description: Used for the main "Shop" or "Explore" page to show what is for sale.
 * tags: [NFT Marketplace]
 */
router.get("/market/explore", getListings);

/**
 * @swagger
 * /nft/market/list:
 * post:
 * summary: List an NFT for sale
 * description: Moves an NFT from the user's wallet to the marketplace contract.
 * tags: [NFT Marketplace]
 */
router.post("/market/list", listNft);

/**
 * @swagger
 * /nft/market/buy:
 * post:
 * summary: Purchase a comic
 * description: Executes the swap of SOL/NWT for the Comic NFT.
 * tags: [NFT Marketplace]
 */
router.post("/market/buy", buyNft);

/**
 * @swagger
 * /nft/market/cancel/{id}:
 * delete:
 * summary: Remove listing from market
 * description: Returns the NFT from the marketplace back to the owner's wallet.
 * tags: [NFT Marketplace]
 */
router.delete("/market/cancel/:id", delistNft);

/**
 * @swagger
 * /nft/market/stats:
 * get:
 * summary: Get Market Analytics
 * description: Returns Floor Price, Total Volume, and Listing counts for the UI header.
 * tags: [NFT Marketplace]
 */
router.get("/market/stats", getStats);

// ==========================================
// 3. USER & PORTFOLIO ACTIONS
// ==========================================

/**
 * @swagger
 * /nft/portfolio/{walletAddress}:
 * get:
 * summary: Get User Inventory
 * description: Fetches all Comic NFTs owned by a specific wallet.
 * tags: [NFT Marketplace]
 */
router.get("/portfolio/:walletAddress", getUserNfts);

/**
 * @swagger
 * /nft/details/{mintAddress}:
 * get:
 * summary: Get Comic Details
 * description: Returns full metadata (attributes, series, issue number) for a specific NFT.
 * tags: [NFT Marketplace]
 */
router.get("/details/:mintAddress", getNftDetails);

/**
 * @swagger
 * /nft/transfer:
 * post:
 * summary: Transfer NFT (P2P)
 * description: Direct transfer from one user to another without using the marketplace.
 * tags: [NFT Marketplace]
 */
router.post("/transfer", transferNft);

export default router;
