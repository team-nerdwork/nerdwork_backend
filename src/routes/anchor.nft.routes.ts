import { Router } from "express";
import {
  mintNftWithImage,
  mintNftWithUrl,
  transferNft,
  platformTransferNft,
  getUserNfts,
  getNftDetails,
  getPlatformStats,
  verifyOwnership,
  healthCheck,
  uploadMiddleware,
} from "../controller/anchor.nft.controller";

const router = Router();

/**
 * @swagger
 * /api/anchor-nft/health:
 *   get:
 *     summary: Health check for Anchor NFT service
 *     tags: [Anchor NFT]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       500:
 *         description: Service is unhealthy
 */
router.get("/health", healthCheck);

/**
 * @swagger
 * /anchor-nft/mint:
 *   post:
 *     summary: Mint NFT with image upload
 *     tags: [Anchor NFT]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Comic image file (JPEG, PNG, GIF, WebP)
 *       - in: formData
 *         name: userProfileId
 *         type: string
 *         required: true
 *         description: User profile UUID
 *       - in: formData
 *         name: userWalletAddress
 *         type: string
 *         required: true
 *         description: User wallet address (Solana public key)
 *       - in: formData
 *         name: nftName
 *         type: string
 *         required: true
 *         description: NFT name
 *       - in: formData
 *         name: description
 *         type: string
 *         description: NFT description
 *       - in: formData
 *         name: author
 *         type: string
 *         description: Comic author
 *       - in: formData
 *         name: series
 *         type: string
 *         description: Comic series name
 *       - in: formData
 *         name: issue
 *         type: number
 *         description: Issue number
 *       - in: formData
 *         name: genre
 *         type: string
 *         description: Comic genre
 *       - in: formData
 *         name: pages
 *         type: number
 *         description: Number of pages
 *       - in: formData
 *         name: publishDate
 *         type: string
 *         description: Publication date (ISO 8601)
 *       - in: formData
 *         name: attributes
 *         type: string
 *         description: JSON string of NFT attributes
 *       - in: formData
 *         name: price
 *         type: number
 *         description: NFT price (optional, defaults to 0)
 *       - in: formData
 *         name: itemSupply
 *         type: number
 *         description: Number of NFT copies to mint (defaults to 1, >1 makes it limited edition)
 *       - in: formData
 *         name: tags
 *         type: string
 *         description: JSON array of genre/category tags (e.g., ["fiction", "mystery", "romance"])
 *     responses:
 *       200:
 *         description: NFT minted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Minting failed
 */
router.post("/mint", uploadMiddleware.single("image"), mintNftWithImage);

/**
 * @swagger
 * /anchor-nft/mint-url:
 *   post:
 *     summary: Mint NFT with external image URL
 *     tags: [Anchor NFT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userProfileId
 *               - userWalletAddress
 *               - nftName
 *               - imageUrl
 *             properties:
 *               userProfileId:
 *                 type: string
 *                 description: User profile UUID
 *               userWalletAddress:
 *                 type: string
 *                 description: User wallet address (Solana public key)
 *               nftName:
 *                 type: string
 *                 description: NFT name
 *               imageUrl:
 *                 type: file
 *                 description: External image URL
 *               description:
 *                 type: string
 *               author:
 *                 type: string
 *               series:
 *                 type: string
 *               issue:
 *                 type: number
 *               genre:
 *                 type: string
 *               pages:
 *                 type: number
 *               publishDate:
 *                 type: string
 *               attributes:
 *                 type: string
 *                 description: JSON string of attributes
 *               price:
 *                 type: number
 *                 description: NFT price (optional, defaults to 0)
 *               itemSupply:
 *                 type: number
 *                 description: Number of NFT copies to mint (defaults to 1)
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of genre/category tags (e.g., ["fiction", "mystery", "romance"])
 *     responses:
 *       200:
 *         description: NFT minted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Minting failed
 */
router.post("/mint-url", mintNftWithUrl);

/**
 * @swagger
 * /anchor-nft/transfer:
 *   post:
 *     summary: Transfer NFT from one user to another
 *     tags: [Anchor NFT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mintAddress
 *               - fromUserWalletAddress
 *               - toUserWalletAddress
 *             properties:
 *               mintAddress:
 *                 type: string
 *                 description: Mint address of the NFT
 *               fromUserProfileId:
 *                 type: string
 *                 description: Profile ID of the sender
 *               fromUserWalletAddress:
 *                 type: string
 *                 description: Wallet address of the sender
 *               toUserProfileId:
 *                 type: string
 *                 description: Profile ID of the recipient
 *               toUserWalletAddress:
 *                 type: string
 *                 description: Wallet address of the recipient
 *     responses:
 *       200:
 *         description: NFT transferred successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Transfer failed
 */
router.post("/transfer", transferNft);

/**
 * @swagger
 * /anchor-nft/platform-transfer:
 *   post:
 *     summary: Platform-initiated transfer (mint then transfer to user)
 *     tags: [Anchor NFT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mintAddress
 *               - userWalletAddress
 *             properties:
 *               mintAddress:
 *                 type: string
 *                 description: Mint address of the NFT
 *               userWalletAddress:
 *                 type: string
 *                 description: User wallet address to transfer to
 *               userProfileId:
 *                 type: string
 *                 description: User profile UUID
 *     responses:
 *       200:
 *         description: NFT transferred successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Transfer failed
 */
router.post("/platform-transfer", platformTransferNft);

/**
 * @swagger
 * /anchor-nft/stats:
 *   get:
 *     summary: Get platform statistics
 *     tags: [Anchor NFT]
 *     responses:
 *       200:
 *         description: Platform stats retrieved
 *       500:
 *         description: Failed to fetch stats
 */
router.get("/stats", getPlatformStats);

/**
 * @swagger
 * /anchor-nft/verify-ownership/{mintAddress}/{userWalletAddress}:
 *   get:
 *     summary: Verify if a user owns an NFT
 *     tags: [Anchor NFT]
 *     parameters:
 *       - in: path
 *         name: mintAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Mint address of the NFT
 *       - in: path
 *         name: userWalletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: User wallet address
 *     responses:
 *       200:
 *         description: Ownership verified
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Verification failed
 */
router.get("/verify-ownership/:mintAddress/:userWalletAddress", verifyOwnership);

/**
 * @swagger
 * /anchor-nft/user/{userWalletAddress}:
 *   get:
 *     summary: Get all NFTs owned by a user
 *     tags: [Anchor NFT]
 *     parameters:
 *       - in: path
 *         name: userWalletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: User wallet address
 *     responses:
 *       200:
 *         description: User NFTs retrieved
 *       400:
 *         description: Invalid wallet address
 *       500:
 *         description: Failed to fetch NFTs
 */
router.get("/user/:userWalletAddress", getUserNfts);

/**
 * @swagger
 * /anchor-nft/{mintAddress}:
 *   get:
 *     summary: Get NFT details by mint address
 *     tags: [Anchor NFT]
 *     parameters:
 *       - in: path
 *         name: mintAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Mint address of the NFT
 *     responses:
 *       200:
 *         description: NFT details retrieved
 *       400:
 *         description: Invalid mint address
 *       500:
 *         description: Failed to fetch NFT details
 */
router.get("/:mintAddress", getNftDetails);

export default router;
