import { Request, Response } from "express";
import {
  listNftForSale,
  getActiveListings,
  getListingDetails,
  purchaseNft,
  completePurchase,
  cancelListing,
  getSellerEscrowBalance,
  getSellerSalesHistory,
  getBuyerPurchaseHistory,
  requestSellerWithdrawal,
  getSellerWithdrawalHistory,
  getMarketplaceStats,
  getMarketplaceConfig,
} from "../services/marketplace.service";
import {
  createUserSpendTransaction,
  updateUserWalletBalance,
} from "./transaction.controller";
import { PublicKey } from "@solana/web3.js";

/**
 * List NFT for sale
 * POST /api/marketplace/list
 */
export const listNft = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      nftId,
      sellerId,
      sellerWalletAddress,
      price,
      title,
      description,
      royaltyPercentage,
    } = req.body;

    // Validate required fields
    if (!nftId || !sellerId || !sellerWalletAddress || !price || !title) {
      res.status(400).json({
        error: "Missing required fields: nftId, sellerId, sellerWalletAddress, price, title",
      });
      return;
    }

    // Validate price
    if (typeof price !== "number" || price <= 0) {
      res.status(400).json({ error: "Price must be a positive number" });
      return;
    }

    // Validate wallet address
    try {
      new PublicKey(sellerWalletAddress);
    } catch {
      res.status(400).json({ error: "Invalid wallet address format" });
      return;
    }

    const listing = await listNftForSale(
      nftId,
      sellerId,
      sellerWalletAddress,
      price,
      title,
      description,
      royaltyPercentage || 0
    );

    res.status(201).json({
      success: true,
      data: listing,
      message: "NFT listed successfully",
    });
  } catch (error: any) {
    console.error("Error listing NFT:", error);
    res.status(400).json({
      error: error.message || "Failed to list NFT",
    });
  }
};

/**
 * Get active listings with filtering
 * GET /api/marketplace/listings
 */
export const getListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      limit = 20,
      offset = 0,
      minPrice,
      maxPrice,
      sellerId,
      sortBy,
    } = req.query;

    const listings = await getActiveListings(
      parseInt(limit as string),
      parseInt(offset as string),
      {
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sellerId: sellerId as string,
        sortBy: (sortBy as any) || "newest",
      }
    );

    res.json({
      success: true,
      data: listings,
    });
  } catch (error: any) {
    console.error("Error fetching listings:", error);
    res.status(500).json({
      error: "Failed to fetch listings",
    });
  }
};

/**
 * Get listing details
 * GET /api/marketplace/listings/:listingId
 */
export const getListingInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { listingId } = req.params;

    if (!listingId) {
      res.status(400).json({ error: "Listing ID is required" });
      return;
    }

    const details = await getListingDetails(listingId);

    res.json({
      success: true,
      data: details,
    });
  } catch (error: any) {
    console.error("Error fetching listing details:", error);
    res.status(error.message.includes("not found") ? 404 : 500).json({
      error: error.message || "Failed to fetch listing details",
    });
  }
};

/**
 * Purchase NFT (create order and initiate payment)
 * POST /api/marketplace/purchase
 */
export const buyNft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { listingId, buyerId, buyerWalletAddress, sellerWalletAddress } =
      req.body;

    // Validate required fields
    if (!listingId || !buyerId || !buyerWalletAddress || !sellerWalletAddress) {
      res.status(400).json({
        error: "Missing required fields: listingId, buyerId, buyerWalletAddress, sellerWalletAddress",
      });
      return;
    }

    // Create purchase order
    const purchaseResult = await purchaseNft(
      listingId,
      buyerId,
      buyerWalletAddress,
      sellerWalletAddress
    );

    const { transaction, amounts } = purchaseResult;

    // Create spend transaction for NWT deduction
    const spendResult = await createUserSpendTransaction(
      buyerId,
      parseFloat(amounts.purchasePrice),
      "marketplace_purchase",
      listingId,
      purchaseResult.order.sellerId,
      `NFT Purchase`
    );

    if (!spendResult.success) {
      res.status(500).json({
        error: "Failed to create payment transaction",
        details: spendResult.error,
      });
      return;
    }

    // Deduct NWT from buyer's wallet
    const balanceResult = await updateUserWalletBalance(
      buyerId,
      amounts.purchasePrice,
      "subtract"
    );

    if (!balanceResult.success) {
      res.status(500).json({
        error: "Failed to deduct NWT from wallet",
        details: balanceResult.error,
      });
      return;
    }

    // Complete the purchase
    await completePurchase(
      purchaseResult.order.id,
      spendResult.transaction?.id || transaction.id
    );

    res.status(201).json({
      success: true,
      data: {
        orderId: purchaseResult.order.id,
        transactionId: spendResult.transaction?.id || transaction.id,
        amounts,
        status: "completed",
      },
      message: "NFT purchased successfully",
    });
  } catch (error: any) {
    console.error("Error purchasing NFT:", error);
    res.status(400).json({
      error: error.message || "Failed to purchase NFT",
    });
  }
};

/**
 * Cancel listing
 * DELETE /api/marketplace/listings/:listingId
 */
export const delistNft = async (req: Request, res: Response): Promise<void> => {
  try {
    const { listingId } = req.params;
    const { sellerId } = req.body;

    if (!listingId || !sellerId) {
      res.status(400).json({
        error: "Missing required fields: listingId, sellerId",
      });
      return;
    }

    const updated = await cancelListing(listingId, sellerId);

    res.json({
      success: true,
      data: updated,
      message: "Listing cancelled successfully",
    });
  } catch (error: any) {
    console.error("Error cancelling listing:", error);
    res.status(error.message.includes("Unauthorized") ? 403 : 400).json({
      error: error.message || "Failed to cancel listing",
    });
  }
};

/**
 * Get seller's escrow balance
 * GET /api/marketplace/escrow/:sellerId
 */
export const getEscrowBalance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      res.status(400).json({ error: "Seller ID is required" });
      return;
    }

    const escrow = await getSellerEscrowBalance(sellerId);

    res.json({
      success: true,
      data: escrow,
    });
  } catch (error: any) {
    console.error("Error fetching escrow balance:", error);
    res.status(500).json({
      error: "Failed to fetch escrow balance",
    });
  }
};

/**
 * Get seller's sales history
 * GET /api/marketplace/seller/:sellerId/sales
 */
export const getSellerSales = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sellerId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!sellerId) {
      res.status(400).json({ error: "Seller ID is required" });
      return;
    }

    const sales = await getSellerSalesHistory(
      sellerId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: sales,
    });
  } catch (error: any) {
    console.error("Error fetching sales history:", error);
    res.status(500).json({
      error: "Failed to fetch sales history",
    });
  }
};

/**
 * Get buyer's purchase history
 * GET /api/marketplace/buyer/:buyerId/purchases
 */
export const getBuyerPurchases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { buyerId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!buyerId) {
      res.status(400).json({ error: "Buyer ID is required" });
      return;
    }

    const purchases = await getBuyerPurchaseHistory(
      buyerId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: purchases,
    });
  } catch (error: any) {
    console.error("Error fetching purchase history:", error);
    res.status(500).json({
      error: "Failed to fetch purchase history",
    });
  }
};

/**
 * Request seller withdrawal
 * POST /api/marketplace/withdraw
 */
export const requestWithdrawal = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sellerId, amount } = req.body;

    if (!sellerId || !amount) {
      res.status(400).json({
        error: "Missing required fields: sellerId, amount",
      });
      return;
    }

    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({
        error: "Amount must be a positive number",
      });
      return;
    }

    const withdrawal = await requestSellerWithdrawal(sellerId, amount);

    res.status(201).json({
      success: true,
      data: withdrawal,
      message: "Withdrawal request created successfully",
    });
  } catch (error: any) {
    console.error("Error creating withdrawal request:", error);
    res.status(400).json({
      error: error.message || "Failed to create withdrawal request",
    });
  }
};

/**
 * Get seller's withdrawal history
 * GET /api/marketplace/seller/:sellerId/withdrawals
 */
export const getWithdrawalHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sellerId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    if (!sellerId) {
      res.status(400).json({ error: "Seller ID is required" });
      return;
    }

    const withdrawals = await getSellerWithdrawalHistory(
      sellerId,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    res.json({
      success: true,
      data: withdrawals,
    });
  } catch (error: any) {
    console.error("Error fetching withdrawal history:", error);
    res.status(500).json({
      error: "Failed to fetch withdrawal history",
    });
  }
};

/**
 * Get marketplace statistics
 * GET /api/marketplace/stats
 */
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getMarketplaceStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error fetching marketplace stats:", error);
    res.status(500).json({
      error: "Failed to fetch marketplace statistics",
    });
  }
};

/**
 * Get marketplace configuration
 * GET /api/marketplace/config
 */
export const getConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await getMarketplaceConfig();

    res.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error("Error fetching marketplace config:", error);
    res.status(500).json({
      error: "Failed to fetch marketplace configuration",
    });
  }
};
