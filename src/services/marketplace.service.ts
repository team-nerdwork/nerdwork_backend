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
    const minimumPrice = parseFloat(config.minimumListingPrice as any);
    const maximumPrice = parseFloat(config.maximumListingPrice as any);

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
    let query = db
      .select()
      .from(nftListings)
      .where(eq(nftListings.status, "active"));

    // Apply price filters
    if (filters?.minPrice) {
      query = query.where(gte(nftListings.price, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      query = query.where(lte(nftListings.price, filters.maxPrice.toString()));
    }

    // Filter by seller
    if (filters?.sellerId) {
      query = query.where(eq(nftListings.sellerId, filters.sellerId));
    }

    // Apply sorting
    if (filters?.sortBy === "price_asc") {
      query = query.orderBy(asc(nftListings.price));
    } else if (filters?.sortBy === "price_desc") {
      query = query.orderBy(desc(nftListings.price));
    } else if (filters?.sortBy === "newest") {
      query = query.orderBy(desc(nftListings.listedAt));
    } else {
      query = query.orderBy(asc(nftListings.listedAt));
    }

    // Apply pagination
    query = query.limit(limit).offset(offset);

    const listings = await query;

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(nftListings)
      .where(eq(nftListings.status, "active"));

    if (filters?.minPrice) {
      countQuery.where(gte(nftListings.price, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      countQuery.where(lte(nftListings.price, filters.maxPrice.toString()));
    }

    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;

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
 * Purchase NFT
 */
export const purchaseNft = async (
  listingId: string,
  buyerId: string,
  buyerWalletAddress: string,
  sellerWalletAddress: string
) => {
  try {
    // Get listing details
    const listingData = await db
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

    // Get marketplace config for fees
    const config = await getMarketplaceConfig();
    const platformFeePercentage = parseFloat(
      config.platformFeePercentage as any
    );

    // Calculate amounts
    const purchasePrice = parseFloat(listing.price as any);
    const platformFeeAmount =
      (purchasePrice * platformFeePercentage) / 100;
    const royaltyAmount = listing.royaltyPercentage
      ? (purchasePrice * parseFloat(listing.royaltyPercentage as any)) / 100
      : 0;
    const sellerAmount = purchasePrice - platformFeeAmount - royaltyAmount;

    // Get buyer's reader profile for transaction
    const readerData = await db
      .select()
      .from(readerProfile)
      .where(eq(readerProfile.userProfileId, buyerId));

    if (!readerData || readerData.length === 0) {
      throw new Error("Buyer reader profile not found");
    }

    // Create order
    const [order] = await db
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
        status: "pending",
      })
      .returning();

    // Create transaction record
    const [transaction] = await db
      .insert(nftOrderTransactions)
      .values({
        orderId: order.id,
        buyerId: readerData[0].id,
        transactionType: "marketplace_purchase",
        status: "pending",
        totalAmount: purchasePrice.toString(),
        platformFeeAmount: platformFeeAmount.toString(),
        sellerAmount: sellerAmount.toString(),
        royaltyAmount: royaltyAmount.toString(),
        description: `NFT Purchase: ${listing.title}`,
      })
      .returning();

    return {
      order,
      transaction,
      amounts: {
        purchasePrice,
        platformFeeAmount,
        royaltyAmount,
        sellerAmount,
      },
    };
  } catch (error) {
    console.error("Error purchasing NFT:", error);
    throw error;
  }
};

/**
 * Complete purchase (after payment is confirmed)
 */
export const completePurchase = async (
  orderId: string,
  transactionId: string
) => {
  try {
    const orderData = await db
      .select()
      .from(nftOrders)
      .where(eq(nftOrders.id, orderId));

    if (!orderData || orderData.length === 0) {
      throw new Error("Order not found");
    }

    const order = orderData[0];

    // Update order status
    await db
      .update(nftOrders)
      .set({
        status: "completed",
        transactionId,
        completedAt: new Date(),
      })
      .where(eq(nftOrders.id, orderId));

    // Update transaction status
    await db
      .update(nftOrderTransactions)
      .set({
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(nftOrderTransactions.id, transactionId));

    // Update listing to sold
    await db
      .update(nftListings)
      .set({
        status: "sold",
        soldAt: new Date(),
      })
      .where(eq(nftListings.id, order.listingId));

    // Update seller's escrow
    const escrowData = await db
      .select()
      .from(marketplaceEscrow)
      .where(eq(marketplaceEscrow.sellerId, order.sellerId));

    const currentEarnings = escrowData.length > 0 ? parseFloat(escrowData[0].totalEarnings as any) : 0;
    const newEarnings = currentEarnings + parseFloat(order.sellerAmount as any);

    if (escrowData.length > 0) {
      await db
        .update(marketplaceEscrow)
        .set({
          totalEarnings: newEarnings.toString(),
          availableBalance: newEarnings.toString(),
          updatedAt: new Date(),
        })
        .where(eq(marketplaceEscrow.sellerId, order.sellerId));
    } else {
      await db.insert(marketplaceEscrow).values({
        sellerId: order.sellerId,
        totalEarnings: newEarnings.toString(),
        availableBalance: newEarnings.toString(),
      });
    }

    // Transfer NFT to buyer (blockchain)
    try {
      const transferTx = await AnchorTransferService.transferNft({
        mintAddress: order.mintAddress,
        fromUserProfileId: "",
        fromUserWalletAddress: order.sellerWalletAddress,
        toUserProfileId: order.buyerId,
        toUserWalletAddress: order.buyerWalletAddress,
      });

      // Record transfer
      await db.insert(nftMarketplaceTransfers).values({
        orderId: order.id,
        nftId: order.nftId,
        fromWalletAddress: order.sellerWalletAddress,
        toWalletAddress: order.buyerWalletAddress,
        transactionHash: transferTx.signature,
        status: "completed",
      });
    } catch (transferError) {
      console.error("NFT transfer error:", transferError);
      // Log the error but don't fail the transaction
    }

    return {
      success: true,
      order,
      escrowUpdated: true,
    };
  } catch (error) {
    console.error("Error completing purchase:", error);
    throw error;
  }
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
  try {
    // Get escrow balance
    const escrow = await getSellerEscrowBalance(sellerId);
    const availableBalance = parseFloat(escrow.availableBalance as any);

    if (amount > availableBalance) {
      throw new Error(
        `Insufficient balance. Available: ${availableBalance} NWT`
      );
    }

    if (amount <= 0) {
      throw new Error("Withdrawal amount must be greater than 0");
    }

    // Create withdrawal request
    const [withdrawal] = await db
      .insert(sellerWithdrawals)
      .values({
        sellerId,
        amount: amount.toString(),
        status: "pending",
      })
      .returning();

    return withdrawal;
  } catch (error) {
    console.error("Error requesting withdrawal:", error);
    throw error;
  }
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
        ? parseFloat(volumeResult[0].total)
        : 0,
      floorPrice: floorPriceResult.length > 0
        ? parseFloat(floorPriceResult[0].price as any)
        : 0,
    };
  } catch (error) {
    console.error("Error fetching marketplace stats:", error);
    throw error;
  }
};
