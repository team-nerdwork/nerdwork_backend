import { Router } from "express";
import {
  buyNft,
  deleteNft,
  getAllAvailableNfts,
  getMyMintedNfts,
  getMyPurchasedNfts,
  getSingleCreatorNft,
  listNftForSale,
  mintNft,
} from "../controller/nft.controller";

const router = Router();

/**
 * @swagger
 * /nft:
 *   post:
 *     summary: Create and freeze a new NFT (Creator only)
 *     description: |
 *       Creates a new NFT collectible in draft state, uploads the image and metadata to IPFS (via Pinata),
 *       and automatically freezes the NFT. Once frozen, the NFT becomes eligible for listing on the marketplace.
 *
 *       This endpoint is restricted to authenticated creators.
 *
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - imageKey
 *               - supply
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rain Boy Limited Edition
 *               description:
 *                 type: string
 *                 example: A collectible of a young boy under the rain.
 *               imageKey:
 *                 type: string
 *                 description: S3 object key returned from the upload endpoint
 *                 example: creators/john/abc123.png
 *               supply:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10
 *               royaltyBps:
 *                 type: integer
 *                 description: Royalty in basis points (500 = 5%, 1000 = 10%)
 *                 example: 500
 *               tags:
 *                 type: string
 *                 description: JSON stringified array of tags
 *                 example: ["rain", "comic", "limited"]
 *               properties:
 *                 type: string
 *                 description: JSON stringified array of NFT attributes
 *                 example: [{"trait_type":"Weather","value":"Rainy"}]
 *
 *     responses:
 *       201:
 *         description: NFT minted and frozen successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: NFT minted and frozen successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only creators can mint NFTs
 *       500:
 *         description: Internal server error
 */
router.post("/", mintNft);

/**
 * @swagger
 * /nft/my:
 *   get:
 *     summary: Get all NFTs created by the authenticated creator
 *     description: |
 *       Returns all NFTs created by the authenticated creator, including draft,
 *       frozen, listed, and sold NFTs. This endpoint is restricted to creators only.
 *
 *       NFTs are ordered by creation date (newest first).
 *
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Successfully fetched creator NFTs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                         description: Signed S3/CloudFront URL
 *                       imageCID:
 *                         type: string
 *                         nullable: true
 *                       metadataCID:
 *                         type: string
 *                         nullable: true
 *                       tokenURI:
 *                         type: string
 *                         nullable: true
 *                       supply:
 *                         type: integer
 *                       remainingSupply:
 *                         type: integer
 *                       royaltyBps:
 *                         type: integer
 *                         description: Royalty in basis points (500 = 5%)
 *                       status:
 *                         type: string
 *                         example: frozen
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only creators can access this resource
 *       500:
 *         description: Internal server error
 */
router.get("/my", getMyMintedNfts);

/**
 * @swagger
 * /nft/my/{id}:
 *   get:
 *     summary: Get a single NFT created by the authenticated creator
 *     description: |
 *       Returns detailed information about a specific NFT created by the authenticated creator.
 *       This includes metadata, IPFS CIDs, royalty information, supply details,
 *       and lifecycle status (draft, frozen, listed, sold).
 *
 *       Only the creator who owns the NFT can access this endpoint.
 *
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the NFT
 *
 *     responses:
 *       200:
 *         description: Successfully fetched NFT details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                       description: Signed S3/CloudFront URL
 *                     imageCID:
 *                       type: string
 *                       nullable: true
 *                     metadataCID:
 *                       type: string
 *                       nullable: true
 *                     tokenURI:
 *                       type: string
 *                       nullable: true
 *                     metadata:
 *                       type: object
 *                       nullable: true
 *                     supply:
 *                       type: integer
 *                     remainingSupply:
 *                       type: integer
 *                     royaltyBps:
 *                       type: integer
 *                       description: Royalty in basis points (500 = 5%)
 *                     status:
 *                       type: string
 *                       example: frozen
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: NFT id is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only creators can access this resource
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal server error
 */
router.get("/my/:id", getSingleCreatorNft);

/**
 * @swagger
 * /nft/list:
 *   post:
 *     summary: List a frozen NFT for sale (Creator only)
 *     description: |
 *       Allows an authenticated creator to list one of their frozen NFTs on the marketplace.
 *
 *       Conditions:
 *       - The NFT must exist.
 *       - The creator must own the NFT.
 *       - The NFT must be in "frozen" state.
 *       - The NFT must not already be listed.
 *       - The NFT must have remaining supply.
 *
 *       Once listed, the NFT status changes to "listed".
 *
 *     tags: [NFT Marketplace]
 *     security:
 *       - bearerAuth: []
 *
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
 *                 format: uuid
 *                 description: The ID of the NFT to list
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Price per unit in NWT
 *                 example: 100
 *
 *     responses:
 *       201:
 *         description: NFT listed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: NFT listed successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Validation error or listing condition failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only creators can list NFTs
 *       500:
 *         description: Internal server error
 */
router.post("/list", listNftForSale);

/**
 * @swagger
 * /nft/buy:
 *   post:
 *     summary: Purchase a listed NFT (Reader only)
 *     description: |
 *       Allows an authenticated reader to purchase one or more units of a listed NFT
 *       using their in-app wallet balance (NWT).
 *
 *       Workflow:
 *       - Validates listing is active.
 *       - Validates NFT has sufficient remaining supply.
 *       - Checks reader wallet balance.
 *       - Deducts NWT from buyer.
 *       - Credits seller (after platform fee deduction).
 *       - Creates order record.
 *       - Updates NFT ownership and remaining supply.
 *       - Marks listing as sold if supply reaches zero.
 *
 *       This endpoint supports purchasing multiple quantities in a single transaction.
 *
 *     tags: [NFT Marketplace]
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - listingId
 *               - quantity
 *             properties:
 *               listingId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the marketplace listing
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of NFT units to purchase
 *                 example: 2
 *
 *     responses:
 *       200:
 *         description: NFT purchased successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: NFT purchased successfully
 *                 data:
 *                   type: object
 *                   description: Order details of the completed purchase
 *       400:
 *         description: Invalid request, insufficient balance, or supply unavailable
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only readers can buy NFTs
 *       500:
 *         description: Internal server error
 */
router.post("/buy", buyNft);

/**
 * @swagger
 * /nft/my-purchases:
 *   get:
 *     summary: Get all NFTs purchased by the authenticated reader
 *     description: |
 *       Returns all NFTs currently owned by the authenticated reader.
 *       This includes quantity owned for edition-based NFTs.
 *
 *       This endpoint is restricted to readers only and requires authentication.
 *
 *     tags: [NFT Marketplace]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Successfully fetched purchased NFTs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nftId:
 *                         type: string
 *                         format: uuid
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *                         description: Signed S3/CloudFront URL
 *                       tokenURI:
 *                         type: string
 *                         nullable: true
 *                         description: IPFS metadata URI
 *                       royaltyBps:
 *                         type: integer
 *                         description: Royalty in basis points (500 = 5%)
 *                         example: 500
 *                       quantityOwned:
 *                         type: integer
 *                         example: 3
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only readers can access this resource
 *       500:
 *         description: Internal server error
 */
router.get("/my-purchases", getMyPurchasedNfts);

/**
 * @swagger
 * /nft/{id}:
 *   delete:
 *     summary: Delete an NFT (Creator only)
 *     description: |
 *       Allows a creator to permanently delete one of their NFTs.
 *
 *       Deletion is only allowed if:
 *       - The NFT belongs to the authenticated creator.
 *       - The NFT is NOT currently listed.
 *       - The NFT has never been purchased.
 *       - The NFT has full remaining supply.
 *       - There are no ownership records.
 *       - There are no purchase orders associated with it.
 *
 *       If any of these conditions fail, the deletion will be rejected.
 *
 *     tags: [NFT]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the NFT to delete
 *
 *     responses:
 *       200:
 *         description: NFT deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: NFT deleted successfully
 *       400:
 *         description: Deletion condition failed (listed, sold, or has ownership/order records)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only creators can delete NFTs
 *       404:
 *         description: NFT not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteNft);

export default router;
