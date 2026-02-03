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
import { upload } from "../controller/nft.controller";

const router = Router();

// We define the tag once here for the UI, but we'll use it in each route
/**
 * @swagger
 * tags:
 * - name: NFT Marketplace
 * description: Comic NFT creation, trading, and portfolio management
 */

/**
 * @swagger
 * /nft/mint:
 * post:
 * summary: Create (Mint) a new Comic NFT
 * tags: [NFT Marketplace]
 * responses:
 * 200:
 * description: Success
 */
router.post("/mint", upload.single("image"), mintNftWithImage);

/**
 * @swagger
 * /nft/market/explore:
 * get:
 * summary: Get all active comic listings
 * tags: [NFT Marketplace]
 * responses:
 * 200:
 * description: Success
 */
router.get("/market/explore", getListings);

/**
 * @swagger
 * /nft/market/list:
 * post:
 * summary: List an NFT for sale
 * tags: [NFT Marketplace]
 * responses:
 * 200:
 * description: Success
 */
router.post("/market/list", listNft);

/**
 * @swagger
 * /nft/market/buy:
 * post:
 * summary: Purchase a comic
 * tags: [NFT Marketplace]
 * responses:
 * 200:
 * description: Success
 */
router.post("/market/buy", buyNft);

/**
 * @swagger
 * /nft/market/cancel/{id}:
 * delete:
 * summary: Remove listing from market
 * tags: [NFT Marketplace]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Success
 */
router.delete("/market/cancel/:id", delistNft);

/**
 * @swagger
 * /nft/portfolio/{walletAddress}:
 * get:
 * summary: Get User Inventory
 * tags: [NFT Marketplace]
 * parameters:
 * - in: path
 * name: walletAddress
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Success
 */
router.get("/portfolio/:walletAddress", getUserNfts);

/**
 * @swagger
 * /nft/details/{mintAddress}:
 * get:
 * summary: Get Comic Details
 * tags: [NFT Marketplace]
 * parameters:
 * - in: path
 * name: mintAddress
 * required: true
 * schema:
 * type: string
 * responses:
 * 200:
 * description: Success
 */
router.get("/details/:mintAddress", getNftDetails);

export default router;
