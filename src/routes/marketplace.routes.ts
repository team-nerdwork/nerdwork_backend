import { Router } from "express";
import {
  getAllAvailableNfts,
  getSingleMarketplaceNft,
} from "../controller/nft.controller";

const router = Router();

/**
 * @swagger
 * /marketplace:
 *   get:
 *     summary: Get all available NFTs listed on the marketplace
 *     description: |
 *       Returns all NFTs that are currently listed and available for purchase.
 *
 *       Conditions:
 *       - Listing status must be "active"
 *       - NFT status must be "listed"
 *       - NFT must have remaining supply greater than zero
 *
 *       This endpoint is public and does not require authentication.
 *
 *     tags: [NFT Marketplace]
 *
 *     responses:
 *       200:
 *         description: Successfully fetched marketplace NFTs
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
 *                       listingId:
 *                         type: string
 *                         format: uuid
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
 *                       price:
 *                         type: string
 *                         description: Price per unit in NWT
 *                         example: "100.00"
 *                       remainingSupply:
 *                         type: integer
 *                         example: 5
 *                       royaltyBps:
 *                         type: integer
 *                         description: Royalty in basis points (500 = 5%)
 *                         example: 500
 *                       creatorName:
 *                         type: string
 *                         example: JohnDoe
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllAvailableNfts);

/**
 * @swagger
 * /marketplace/{listingId}:
 *   get:
 *     summary: Get detailed information about a listed NFT (Public)
 *     description: |
 *       Returns detailed information about a specific NFT listing on the marketplace.
 *
 *       Conditions:
 *       - The listing must exist.
 *       - The listing must be active.
 *       - The NFT must have remaining supply.
 *
 *       This endpoint is public and does not require authentication.
 *
 *     tags: [NFT Marketplace]
 *
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The unique ID of the marketplace listing
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
 *                     listingId:
 *                       type: string
 *                       format: uuid
 *                     nftId:
 *                       type: string
 *                       format: uuid
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     imageUrl:
 *                       type: string
 *                       description: Signed S3/CloudFront URL
 *                     price:
 *                       type: string
 *                       description: Price per unit in NWT
 *                       example: "100.00"
 *                     remainingSupply:
 *                       type: integer
 *                       example: 4
 *                     royaltyBps:
 *                       type: integer
 *                       description: Royalty in basis points (500 = 5%)
 *                       example: 500
 *                     creator:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         creatorName:
 *                           type: string
 *                           example: JohnDoe
 *       400:
 *         description: Invalid listing id
 *       404:
 *         description: NFT not found or not available
 *       500:
 *         description: Internal server error
 */
router.get("/:listingId", getSingleMarketplaceNft);

export default router;
