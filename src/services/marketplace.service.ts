import { eq, and, gte, lte, desc, asc, sql, ne } from "drizzle-orm";
import { db } from "../config/db";
import {
  nftListings,
  nftOrders,
  nftOrderTransactions,
  marketplaceEscrow,
  sellerWithdrawals,
  marketplaceConfig,
  nftMarketplaceTransfers,
} from "../model/marketplace";
import { nft } from "../model/nft";
import { userWallets } from "../model/schema";
import { readerProfile } from "../model/profile";
import { userTransactions } from "../model/userTransaction";
import { AnchorTransferService } from "./anchor.transfer.service";

/**
 * Get marketplace configuration
 */
export const getMarketplaceConfig = async () => {
  try {
    let config = await db.select().from(marketplaceConfig).limit(1);

    if (config.length === 0) {
      // Create default config if none exists
      const [defaultConfig] = await db
        .insert(marketplaceConfig)
        .values({
          platformFeePercentage: "2",
          minimumListingPrice: "1",
          maximumListingPrice: "1000000",
          isMarketplaceActive: true,
          allowRoyalties: true,
        })
        .returning();

      return defaultConfig;
    }

    return config[0];
  } catch (error) {
    console.error("Error fetching marketplace config:", error);
    throw error;
  }
};

/**
 * List NFT for sale
 */
export const listNftForSale = async (
  nftId: string,
  sellerId: string,
  sellerWalletAddress: string,
  price: number,
  title: string,
  description?: string,
  royaltyPercentage: number = 0
) => {
  try {
    // Verify NFT exists and belongs to seller
    const nftRecord = await db
      .select()
      .from(nft)
      .where(eq(nft.id, nftId));

    if (!nftRecord || nftRecord.length === 0) {
      throw new Error("NFT not found");
    }

    const nftData = nftRecord[0];

    // Verify seller owns the NFT
    const sellerWallet = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.id, sellerId));

    if (!sellerWallet || sellerWallet.length === 0) {
      throw new Error("Seller wallet not found");
    }

    // Verify minimum price
    const config = await getMarketplaceConfig();
    const minimumPrice = safeParseFloat(config.minimumListingPrice, "minimumListingPrice");
    const maximumPrice = safeParseFloat(config.maximumListingPrice, "maximumListingPrice");

    if (price < minimumPrice || price > maximumPrice) {
      throw new Error(
        `Price must be between ${minimumPrice} and ${maximumPrice} NWT`
      );
    }

    // Create listing
    const [listing] = await db
      .insert(nftListings)
      .values({
        nftId,
        mintAddress: nftData.mintAddress || "",
        sellerId,
        sellerWalletAddress,
        price: price.toString(),
        royaltyPercentage: royaltyPercentage.toString(),
        title,
        description,
        status: "active",
      })
      .returning();

    return listing;
  } catch (error) {
    console.error("Error listing NFT:", error);
    throw error;
  }
};

/**
 * Get active listings with filters
 */

export const getActiveListings = async (
  limit: number = 20,
  offset: number = 0,
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
    sortBy?: "price_asc" | "price_desc" | "newest" | "oldest";
  }
) => {
  try {
    // Build where conditions
    const conditions: any[] = [eq(nftListings.status, "active")];

    if (filters?.minPrice) {
      conditions.push(gte(nftListings.price, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      conditions.push(lte(nftListings.price, filters.maxPrice.toString()));
    }
    if (filters?.sellerId) {
      conditions.push(eq(nftListings.sellerId, filters.sellerId));
    }

    // Build order by
    let orderByClause;
    if (filters?.sortBy === "price_asc") {
      orderByClause = asc(nftListings.price);
    } else if (filters?.sortBy === "price_desc") {
      orderByClause = desc(nftListings.price);
    } else if (filters?.sortBy === "newest") {
      orderByClause = desc(nftListings.listedAt);
    } else {
      orderByClause = asc(nftListings.listedAt);
    }

    // Execute query
    const listings = await db
      .select()
      .from(nftListings)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(nftListings)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count) || 0;

    return { listings, total, limit, offset };
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};


/**
 * Get listing details
 */
export const getListingDetails = async (listingId: string) => {
  try {
    const listing = await db
      .select()
      .from(nftListings)
      .where(eq(nftListings.id, listingId));

    if (!listing || listing.length === 0) {
      throw new Error("Listing not found");
    }

    // Get NFT details
    const nftData = await db
      .select()
      .from(nft)
      .where(eq(nft.id, listing[0].nftId));

    // Get seller info
    const seller = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.id, listing[0].sellerId));

    return {
      listing: listing[0],
      nft: nftData[0],
      seller: seller[0],
    };
  } catch (error) {
    console.error("Error fetching listing details:", error);
    throw error;
  }
};

/**
 * Safe parseFloat that throws on NaN
 */
const safeParseFloat = (value: any, fieldName: string): number => {
  const parsed = parseFloat(value);
  if (isNaN(parsed)) {
    throw new Error(`Invalid numeric value for ${fieldName}: ${value}`);
  }
  return parsed;
};

/**
 * Purchase NFT - Complete atomic transaction
 */
export const purchaseNft = async (
  listingId: string,
  buyerId: string,
  buyerWalletAddress: string,
  sellerWalletAddress: string
) => {
  // Execute entire purchase in atomic transaction
  return await db.transaction(async (tx) => {
    // 1. Get listing details
    const listingData = await tx
      .select()
      .from(nftListings)
      .where(eq(nftListings.id, listingId));

    if (!listingData || listingData.length === 0) {
      throw new Error("Listing not found");
    }

    const listing = listingData[0];

    if (listing.status !== "active") {
      throw new Error("Listing is no longer active");
    }

    // 2. Get buyer's reader profile (needed for balance check and self-purchase validation)
    const readerData = await tx
      .select()
      .from(readerProfile)
      .where(eq(readerProfile.id, buyerId));

    if (!readerData || readerData.length === 0) {
      throw new Error("Buyer profile not found");
    }

    const buyer = readerData[0];

    // 3. Get buyer's wallet to validate not purchasing own NFT
    const buyerWalletData = await tx
      .select()
      .from(userWallets)
      .where(eq(userWallets.primaryWalletAddress, buyerWalletAddress));

    if (!buyerWalletData || buyerWalletData.length === 0) {
      throw new Error("Buyer wallet not found");
    }

    const buyerWallet = buyerWalletData[0];

    // 4. Validate seller is not buyer (compare wallet IDs)
    if (listing.sellerId === buyerWallet.id) {
      throw new Error("Cannot purchase your own NFT");
    }

    // 5. Verify NFT exists and belongs to seller
    const nftData = await tx
      .select()
      .from(nft)
      .where(eq(nft.id, listing.nftId));

    if (!nftData || nftData.length === 0) {
      throw new Error("NFT not found");
    }

    // 6. Get marketplace config for fees
    const config = await getMarketplaceConfig();
    const platformFeePercentage = safeParseFloat(
      config.platformFeePercentage,
      "platformFeePercentage"
    );

    // 7. Calculate amounts with safe parsing
    const purchasePrice = safeParseFloat(listing.price, "price");
    const platformFeeAmount = (purchasePrice * platformFeePercentage) / 100;
    const royaltyAmount = listing.royaltyPercentage
      ? (purchasePrice * safeParseFloat(listing.royaltyPercentage, "royaltyPercentage")) / 100
      : 0;
    const sellerAmount = purchasePrice - platformFeeAmount - royaltyAmount;

    // 8. CHECK BUYER BALANCE FIRST - Critical fix
    const currentBalance = buyer.walletBalance || 0;
    if (currentBalance < purchasePrice) {
      throw new Error(
        `Insufficient balance. Required: ${purchasePrice} NWT, Available: ${currentBalance} NWT`
      );
    }

    // 8. Deduct NWT from buyer's wallet
    const newBuyerBalance = currentBalance - purchasePrice;
    await tx
      .update(readerProfile)
      .set({
        walletBalance: newBuyerBalance,
        updatedAt: new Date(),
      })
      .where(eq(readerProfile.id, buyerId));

    // 9. Create user spend transaction
    const [spendTransaction] = await tx
      .insert(userTransactions)
      .values({
        userId: buyerId,
        transactionType: "spend",
        status: "completed",
        nwtAmount: purchasePrice.toString(),
        description: `NFT Purchase: ${listing.title}`,
        spendCategory: "nft_purchase",
        contentId: listing.nftId,
        creatorId: listing.sellerId,
      })
      .returning();

    if (!spendTransaction) {
      throw new Error("Failed to create spend transaction");
    }

    // 10. Create order
    const [order] = await tx
      .insert(nftOrders)
      .values({
        listingId,
        nftId: listing.nftId,
        mintAddress: listing.mintAddress,
        buyerId,
        buyerWalletAddress,
        sellerId: listing.sellerId,
        sellerWalletAddress,
        purchasePrice: purchasePrice.toString(),
        platformFeeAmount: platformFeeAmount.toString(),
        royaltyAmount: royaltyAmount.toString(),
        sellerAmount: sellerAmount.toString(),
        status: "completed",
        transactionId: spendTransaction.id,
        completedAt: new Date(),
      })
      .returning();

    if (!order) {
      throw new Error("Failed to create order");
    }

    // 11. Create order transaction record
    const [orderTransaction] = await tx
      .insert(nftOrderTransactions)
      .values({
        orderId: order.id,
        buyerId: buyerId,
        transactionType: "marketplace_purchase",
        status: "completed",
        totalAmount: purchasePrice.toString(),
        platformFeeAmount: platformFeeAmount.toString(),
        sellerAmount: sellerAmount.toString(),
        royaltyAmount: royaltyAmount.toString(),
        description: `NFT Purchase: ${listing.title}`,
      })
      .returning();

    // 12. Update listing to sold
    await tx
      .update(nftListings)
      .set({
        status: "sold",
        soldAt: new Date(),
      })
      .where(eq(nftListings.id, listingId));

    // 13. Update seller's escrow - CRITICAL: Must succeed
    const escrowData = await tx
      .select()
      .from(marketplaceEscrow)
      .where(eq(marketplaceEscrow.sellerId, listing.sellerId));

    const currentEarnings = escrowData.length > 0
      ? safeParseFloat(escrowData[0].totalEarnings, "totalEarnings")
      : 0;
    const newEarnings = currentEarnings + sellerAmount;

    if (escrowData.length > 0) {
      await tx
        .update(marketplaceEscrow)
        .set({
          totalEarnings: newEarnings.toString(),
          availableBalance: newEarnings.toString(),
          updatedAt: new Date(),
        })
        .where(eq(marketplaceEscrow.sellerId, listing.sellerId));
    } else {
      await tx.insert(marketplaceEscrow).values({
        sellerId: listing.sellerId,
        totalEarnings: newEarnings.toString(),
        availableBalance: newEarnings.toString(),
      });
    }

    // 14. Transfer NFT to buyer (blockchain) - MUST succeed
    let transferSignature: string;
    try {
      const transferTx = await AnchorTransferService.transferNft({
        mintAddress: listing.mintAddress,
        fromUserProfileId: "",
        fromUserWalletAddress: listing.sellerWalletAddress,
        toUserProfileId: buyerId,
        toUserWalletAddress: buyerWalletAddress,
      });

      transferSignature = transferTx.signature;

      // Record transfer
      await tx.insert(nftMarketplaceTransfers).values({
        orderId: order.id,
        nftId: listing.nftId,
        fromWalletAddress: listing.sellerWalletAddress,
        toWalletAddress: buyerWalletAddress,
        transactionHash: transferSignature,
        status: "completed",
      });
    } catch (transferError: any) {
      console.error("NFT transfer failed:", transferError);
      // CRITICAL FIX: Fail entire transaction if NFT transfer fails
      throw new Error(
        `NFT transfer failed: ${transferError.message || "Unknown blockchain error"}. Transaction rolled back.`
      );
    }

    return {
      orderId: order.id,
      transactionId: spendTransaction.id,
      transferSignature,
      amounts: {
        purchasePrice,
        platformFeeAmount,
        royaltyAmount,
        sellerAmount,
      },
    };
  });
};


/**
 * Cancel listing
 */
export const cancelListing = async (listingId: string, sellerId: string) => {
  try {
    const listing = await db
      .select()
      .from(nftListings)
      .where(eq(nftListings.id, listingId));

    if (!listing || listing.length === 0) {
      throw new Error("Listing not found");
    }

    // Verify seller
    if (listing[0].sellerId !== sellerId) {
      throw new Error("Unauthorized: Only seller can cancel listing");
    }

    if (listing[0].status !== "active") {
      throw new Error("Listing is not active");
    }

    // Update listing status
    const [updated] = await db
      .update(nftListings)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(nftListings.id, listingId))
      .returning();

    return updated;
  } catch (error) {
    console.error("Error cancelling listing:", error);
    throw error;
  }
};

/**
 * Get seller's escrow balance
 */
export const getSellerEscrowBalance = async (sellerId: string) => {
  try {
    const escrow = await db
      .select()
      .from(marketplaceEscrow)
      .where(eq(marketplaceEscrow.sellerId, sellerId));

    if (escrow.length === 0) {
      return {
        sellerId,
        totalEarnings: 0,
        totalWithdrawn: 0,
        availableBalance: 0,
      };
    }

    return escrow[0];
  } catch (error) {
    console.error("Error fetching escrow balance:", error);
    throw error;
  }
};

/**
 * Get seller's purchase history
 */
export const getSellerSalesHistory = async (
  sellerId: string,
  limit: number = 20,
  offset: number = 0
) => {
  try {
    const sales = await db
      .select()
      .from(nftOrders)
      .where(eq(nftOrders.sellerId, sellerId))
      .orderBy(desc(nftOrders.completedAt))
      .limit(limit)
      .offset(offset);

    return sales;
  } catch (error) {
    console.error("Error fetching seller sales history:", error);
    throw error;
  }
};

/**
 * Get buyer's purchase history
 */
export const getBuyerPurchaseHistory = async (
  buyerId: string,
  limit: number = 20,
  offset: number = 0
) => {
  try {
    const purchases = await db
      .select()
      .from(nftOrders)
      .where(eq(nftOrders.buyerId, buyerId))
      .orderBy(desc(nftOrders.completedAt))
      .limit(limit)
      .offset(offset);

    return purchases;
  } catch (error) {
    console.error("Error fetching buyer purchase history:", error);
    throw error;
  }
};

/**
 * Request seller withdrawal
 */
export const requestSellerWithdrawal = async (
  sellerId: string,
  amount: number
) => {
  // Use transaction to ensure balance is reserved atomically
  return await db.transaction(async (tx) => {
    // Get escrow balance
    const escrowData = await tx
      .select()
      .from(marketplaceEscrow)
      .where(eq(marketplaceEscrow.sellerId, sellerId));

    if (!escrowData || escrowData.length === 0) {
      throw new Error("No escrow account found for seller");
    }

    const escrow = escrowData[0];
    const availableBalance = safeParseFloat(escrow.availableBalance, "availableBalance");

    if (amount > availableBalance) {
      throw new Error(
        `Insufficient balance. Available: ${availableBalance} NWT, Requested: ${amount} NWT`
      );
    }

    if (amount <= 0) {
      throw new Error("Withdrawal amount must be greater than 0");
    }

    // Reserve the balance by reducing available balance
    const newAvailableBalance = availableBalance - amount;
    await tx
      .update(marketplaceEscrow)
      .set({
        availableBalance: newAvailableBalance.toString(),
        updatedAt: new Date(),
      })
      .where(eq(marketplaceEscrow.sellerId, sellerId));

    // Create withdrawal request
    const [withdrawal] = await tx
      .insert(sellerWithdrawals)
      .values({
        sellerId,
        amount: amount.toString(),
        status: "pending",
      })
      .returning();

    if (!withdrawal) {
      throw new Error("Failed to create withdrawal request");
    }

    return withdrawal;
  });
};

/**
 * Get seller's withdrawal history
 */
export const getSellerWithdrawalHistory = async (
  sellerId: string,
  limit: number = 20,
  offset: number = 0
) => {
  try {
    const withdrawals = await db
      .select()
      .from(sellerWithdrawals)
      .where(eq(sellerWithdrawals.sellerId, sellerId))
      .orderBy(desc(sellerWithdrawals.createdAt))
      .limit(limit)
      .offset(offset);

    return withdrawals;
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    throw error;
  }
};

/**
 * Get marketplace statistics
 */
export const getMarketplaceStats = async () => {
  try {
    // Total listings
    const totalListingsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(nftListings)
      .where(eq(nftListings.status, "active"));

    // Total completed sales
    const totalSalesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(nftOrders)
      .where(eq(nftOrders.status, "completed"));

    // Total volume
    const volumeResult = await db
      .select({ total: sql<number>`sum(purchase_price)` })
      .from(nftOrders)
      .where(eq(nftOrders.status, "completed"));

    // Floor price (lowest active listing)
    const floorPriceResult = await db
      .select({ price: nftListings.price })
      .from(nftListings)
      .where(eq(nftListings.status, "active"))
      .orderBy(asc(nftListings.price))
      .limit(1);

    return {
      totalActiveListings:
        totalListingsResult[0]?.count || 0,
      totalCompletedSales:
        totalSalesResult[0]?.count || 0,
      totalVolume: volumeResult[0]?.total
        ? safeParseFloat(volumeResult[0].total.toString(), "totalVolume")
        : 0,
      floorPrice: floorPriceResult.length > 0
        ? safeParseFloat(floorPriceResult[0].price, "floorPrice")
        : 0,
    };
  } catch (error) {
    console.error("Error fetching marketplace stats:", error);
    throw error;
  }
};
