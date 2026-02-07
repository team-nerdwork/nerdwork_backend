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

/**
 * @swagger
 * tags:
 *   - name: NFT Marketplace
 *     description: Comic NFT creation, trading, and portfolio management
 */

/**
 * @swagger
 * /nft/mint:
 *   post:
 *     summary: Create (Mint) a new Comic NFT
 *     description: Creates a unique NFT on the blockchain using an image URL string.
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 description: The URL string returned from the image upload logic
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               supply:
 *                 type: integer
 *               price:
 *                 type: string
 *               attributes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     name:
 *                       type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               userProfileId:
 *                 type: string
 *               userWalletAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: NFT Minted successfully
 *       500:
 *         description: Internal server error
 */
router.post("/mint", mintNftWithImage);

/**
 * @swagger
 * /nft/market/explore:
 *   get:
 *     summary: Get all active comic listings
 *     description: Returns a list of all comics currently available for purchase in the shop.
 *     tags: [NFT Marketplace]
 *     responses:
 *       200:
 *         description: List of active listings
 *       500:
 *         description: Internal server error
 */
router.get("/market/explore", getListings);

/**
 * @swagger
 * /nft/market/list:
 *   post:
 *     summary: List an NFT for sale
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nftId
 *               - price
 *             properties:
 *               nftId:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: NFT listed for sale
 *       400:
 *         description: Invalid input
 */
router.post("/market/list", listNft);

/**
 * @swagger
 * /nft/market/buy:
 *   post:
 *     summary: Purchase a comic NFT
 *     tags: [NFT Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               listingId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Purchase successful
 */
router.post("/market/buy", buyNft);

/**
 * @swagger
 * /nft/portfolio/{walletAddress}:
 *   get:
 *     summary: Get user's NFT collection
 *     tags: [NFT Marketplace]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of NFTs owned by the user
 */
router.get("/portfolio/:walletAddress", getUserNfts);

/**
 * @swagger
 * /nft/details/{mintAddress}:
 *   get:
 *     summary: Get NFT metadata details
 *     tags: [NFT Marketplace]
 *     parameters:
 *       - in: path
 *         name: mintAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Metadata retrieved
 */
router.get("/details/:mintAddress", getNftDetails);

export default router;
