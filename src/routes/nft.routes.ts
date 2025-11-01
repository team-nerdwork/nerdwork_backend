import { Router } from "express";
import {
  createApiCollection,
  getAssetData,
  mintApiNFT,
  upload,
} from "../controller/nft.controller";

const router = Router();

/**
 * @swagger
 * /nft/mint:
 *   post:
 *     summary: Mint a new comic NFT
 *     tags: [NFT]
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
 *         name: name
 *         type: string
 *         required: true
 *         description: NFT name
 *       - in: formData
 *         name: description
 *         type: string
 *         required: true
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
 *         type: string
 *         description: Issue number
 *       - in: formData
 *         name: genre
 *         type: string
 *         description: Comic genre
 *       - in: formData
 *         name: pages
 *         type: string
 *         description: Number of pages
 *       - in: formData
 *         name: collectionId
 *         type: string
 *         description: Collection public key
 *       - in: formData
 *         name: attributes
 *         type: string
 *         description: JSON string of NFT attributes
 *       - in: formData
 *         name: transferImmediately
 *         type: boolean
 *         description: Transfer NFT to user immediately
 *     responses:
 *       200:
 *         description: NFT minted successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Minting failed
 */
router.post("/mint", upload.single("image"), mintApiNFT);

/**
 * @swagger
 * /nft/collection/create:
 *   post:
 *     summary: Create a new NFT collection
 *     tags: [NFT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Collection name
 *               description:
 *                 type: string
 *                 description: Collection description
 *               image:
 *                 type: string
 *                 description: Collection image URL
 *               userProfileId:
 *                 type: string
 *                 description: User profile UUID
 *     responses:
 *       200:
 *         description: Collection created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Collection creation failed
 */
router.post("/collection/create", createApiCollection);

/**
 * @swagger
 * /nft/asset/{assetId}:
 *   post:
 *     summary: Get NFT asset details
 *     tags: [NFT]
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset public key
 *     responses:
 *       200:
 *         description: Asset details retrieved
 *       500:
 *         description: Failed to fetch asset
 */
router.post("/asset/:assetId", getAssetData);

/**
 * @swagger
 * /nft/asset/owner/{ownerAddress}:
 *   post:
 *     summary: Get NFTs by owner address
 *     tags: [NFT]
 *     parameters:
 *       - in: path
 *         name: ownerAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Owner wallet address
 *     responses:
 *       200:
 *         description: Owner assets retrieved
 *       500:
 *         description: Failed to fetch assets
 */
router.post("/asset/owner/:ownerAddress", getAssetData);

/**
 * @swagger
 * /nft/health:
 *   get:
 *     summary: Health check for NFT service
 *     tags: [NFT]
 *     responses:
 *       200:
 *         description: Service is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Comic NFT Minting API is running
 */
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Comic NFT Minting API is running" });
});

export default router;
