// import { Router } from "express";
// import {
//   listNft,
//   getListings,
//   getListingInfo,
//   buyNft,
//   delistNft,
//   getEscrowBalance,
//   getSellerSales,
//   getBuyerPurchases,
//   requestWithdrawal,
//   getWithdrawalHistory,
//   getStats,
//   getConfig,
// } from "../controller/marketplace.controller";

// const router = Router();

// /**
//  * @swagger
//  * /marketplace/config:
//  *   get:
//  *     summary: Get marketplace configuration
//  *     tags: [Marketplace]
//  *     responses:
//  *       200:
//  *         description: Marketplace configuration retrieved
//  */
// router.get("/config", getConfig);

// /**
//  * @swagger
//  * /marketplace/stats:
//  *   get:
//  *     summary: Get marketplace statistics
//  *     tags: [Marketplace]
//  *     responses:
//  *       200:
//  *         description: Marketplace stats retrieved
//  */
// router.get("/stats", getStats);

// /**
//  * @swagger
//  * /marketplace/list:
//  *   post:
//  *     summary: List NFT for sale
//  *     description: Creates a new marketplace listing for an NFT. Validates wallet address format and price limits.
//  *     tags: [Marketplace]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - nftId
//  *               - sellerId
//  *               - sellerWalletAddress
//  *               - price
//  *               - title
//  *             properties:
//  *               nftId:
//  *                 type: string
//  *                 format: uuid
//  *                 description: NFT ID from database
//  *               sellerId:
//  *                 type: string
//  *                 format: uuid
//  *                 description: Seller's wallet ID (from userWallets table)
//  *               sellerWalletAddress:
//  *                 type: string
//  *                 description: Valid Solana wallet address (base58 format, 44 characters)
//  *                 example: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
//  *               price:
//  *                 type: number
//  *                 minimum: 1
//  *                 description: Price in NWT tokens (must be positive)
//  *                 example: 100
//  *               title:
//  *                 type: string
//  *                 description: Listing title
//  *                 example: "Rare Comic NFT #1"
//  *               description:
//  *                 type: string
//  *                 description: Optional listing description
//  *               royaltyPercentage:
//  *                 type: number
//  *                 minimum: 0
//  *                 maximum: 100
//  *                 description: Creator royalty percentage (optional)
//  *                 example: 5
//  *     responses:
//  *       201:
//  *         description: NFT listed successfully
//  *       400:
//  *         description: Invalid input (missing fields, invalid price, invalid wallet address)
//  */
// router.post("/list", listNft);

// /**
//  * @swagger
//  * /marketplace/listings:
//  *   get:
//  *     summary: Get active listings with filtering
//  *     tags: [Marketplace]
//  *     parameters:
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *         description: Number of results
//  *       - in: query
//  *         name: offset
//  *         schema:
//  *           type: integer
//  *         description: Pagination offset
//  *       - in: query
//  *         name: minPrice
//  *         schema:
//  *           type: number
//  *         description: Minimum price in NWT
//  *       - in: query
//  *         name: maxPrice
//  *         schema:
//  *           type: number
//  *         description: Maximum price in NWT
//  *       - in: query
//  *         name: sellerId
//  *         schema:
//  *           type: string
//  *         description: Filter by seller
//  *       - in: query
//  *         name: sortBy
//  *         schema:
//  *           type: string
//  *           enum: [price_asc, price_desc, newest, oldest]
//  *         description: Sort order
//  *     responses:
//  *       200:
//  *         description: Listings retrieved
//  */
// router.get("/listings", getListings);

// /**
//  * @swagger
//  * /marketplace/listings/{listingId}:
//  *   get:
//  *     summary: Get listing details
//  *     tags: [Marketplace]
//  *     parameters:
//  *       - in: path
//  *         name: listingId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Listing details retrieved
//  *       404:
//  *         description: Listing not found
//  */
// router.get("/listings/:listingId", getListingInfo);

// /**
//  * @swagger
//  * /marketplace/purchase:
//  *   post:
//  *     summary: Purchase NFT from marketplace
//  *     tags: [Marketplace]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - listingId
//  *               - buyerId
//  *               - buyerWalletAddress
//  *               - sellerWalletAddress
//  *             properties:
//  *               listingId:
//  *                 type: string
//  *               buyerId:
//  *                 type: string
//  *                 description: Buyer user ID
//  *               buyerWalletAddress:
//  *                 type: string
//  *                 description: Buyer Solana wallet
//  *               sellerWalletAddress:
//  *                 type: string
//  *                 description: Seller Solana wallet
//  *     responses:
//  *       201:
//  *         description: NFT purchased successfully
//  *       400:
//  *         description: Invalid input or transaction failed
//  */
// router.post("/purchase", buyNft);

// /**
//  * @swagger
//  * /marketplace/listings/{listingId}:
//  *   delete:
//  *     summary: Cancel listing
//  *     tags: [Marketplace]
//  *     parameters:
//  *       - in: path
//  *         name: listingId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - sellerId
//  *             properties:
//  *               sellerId:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Listing cancelled
//  *       403:
//  *         description: Unauthorized
//  */
// router.delete("/listings/:listingId", delistNft);

// /**
//  * @swagger
//  * /marketplace/escrow/{sellerId}:
//  *   get:
//  *     summary: Get seller's escrow balance
//  *     tags: [Marketplace]
//  *     parameters:
//  *       - in: path
//  *         name: sellerId
//  *         required: true
//  *         schema:
//  *           type: string
//  *     responses:
//  *       200:
//  *         description: Escrow balance retrieved
//  */
// router.get("/escrow/:sellerId", getEscrowBalance);

// /**
//  * @swagger
//  * /marketplace/seller/{sellerId}/sales:
//  *   get:
//  *     summary: Get seller's sales history
//  *     tags: [Marketplace]
//  *     parameters:
//  *       - in: path
//  *         name: sellerId
//  *         required: true
//  *         schema:
//  *           type: string
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *       - in: query
//  *         name: offset
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Sales history retrieved
//  */
// router.get("/seller/:sellerId/sales", getSellerSales);

// /**
//  * @swagger
//  * /marketplace/buyer/{buyerId}/purchases:
//  *   get:
//  *     summary: Get buyer's purchase history
//  *     tags: [Marketplace]
//  *     parameters:
//  *       - in: path
//  *         name: buyerId
//  *         required: true
//  *         schema:
//  *           type: string
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *       - in: query
//  *         name: offset
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Purchase history retrieved
//  */
// router.get("/buyer/:buyerId/purchases", getBuyerPurchases);

// /**
//  * @swagger
//  * /marketplace/withdraw:
//  *   post:
//  *     summary: Request seller withdrawal
//  *     tags: [Marketplace]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - sellerId
//  *               - amount
//  *             properties:
//  *               sellerId:
//  *                 type: string
//  *               amount:
//  *                 type: number
//  *                 description: Amount to withdraw (NWT)
//  *     responses:
//  *       201:
//  *         description: Withdrawal request created
//  *       400:
//  *         description: Invalid input
//  */
// router.post("/withdraw", requestWithdrawal);

// /**
//  * @swagger
//  * /marketplace/seller/{sellerId}/withdrawals:
//  *   get:
//  *     summary: Get seller's withdrawal history
//  *     tags: [Marketplace]
//  *     parameters:
//  *       - in: path
//  *         name: sellerId
//  *         required: true
//  *         schema:
//  *           type: string
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *       - in: query
//  *         name: offset
//  *         schema:
//  *           type: integer
//  *     responses:
//  *       200:
//  *         description: Withdrawal history retrieved
//  */
// router.get("/seller/:sellerId/withdrawals", getWithdrawalHistory);

// export default router;
