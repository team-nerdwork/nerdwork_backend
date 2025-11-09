import {
  pgTable,
  uuid,
  text,
  decimal,
  timestamp,
  boolean,
  pgEnum,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { userWallets } from "./wallet";
import { nft } from "./nft";
import { readerProfile } from "./profile";

// Listing status
export const listingStatusEnum = pgEnum("listing_status", [
  "active",
  "sold",
  "cancelled",
  "delisted",
]);

// Order status
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "failed",
]);

/**
 * NFT Marketplace Listings
 * Users can list their NFTs for sale
 */
export const nftListings = pgTable("nft_listings", {
  id: uuid("id").primaryKey().defaultRandom(),

  // NFT details
  nftId: uuid("nft_id")
    .notNull()
    .references(() => nft.id, { onDelete: "cascade" }),
  mintAddress: text("mint_address").notNull(), // Solana mint address

  // Seller details
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => userWallets.id, { onDelete: "cascade" }),
  sellerWalletAddress: text("seller_wallet_address").notNull(), // Solana wallet

  // Pricing
  price: decimal("price", { precision: 20, scale: 2 }).notNull(), // NWT price
  royaltyPercentage: decimal("royalty_percentage", { precision: 5, scale: 2 })
    .default("0")
    .notNull(), // Creator royalty

  // Listing details
  title: text("title").notNull(),
  description: text("description"),
  status: listingStatusEnum("status").default("active").notNull(),

  // Dates
  listedAt: timestamp("listed_at", { mode: "date" }).notNull().defaultNow(),
  soldAt: timestamp("sold_at", { mode: "date" }),
  cancelledAt: timestamp("cancelled_at", { mode: "date" }),

  // Metadata
  metadata: jsonb("metadata"), // Store additional info like rarity, traits, etc.

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

/**
 * NFT Marketplace Orders/Purchases
 * Records of NFT sales
 */
export const nftOrders = pgTable("nft_orders", {
  id: uuid("id").primaryKey().defaultRandom(),

  // NFT and listing details
  listingId: uuid("listing_id")
    .notNull()
    .references(() => nftListings.id, { onDelete: "restrict" }),
  nftId: uuid("nft_id")
    .notNull()
    .references(() => nft.id, { onDelete: "restrict" }),
  mintAddress: text("mint_address").notNull(),

  // Buyer and seller
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => userWallets.id, { onDelete: "restrict" }),
  buyerWalletAddress: text("buyer_wallet_address").notNull(),

  sellerId: uuid("seller_id")
    .notNull()
    .references(() => userWallets.id, { onDelete: "restrict" }),
  sellerWalletAddress: text("seller_wallet_address").notNull(),

  // Payment details
  purchasePrice: decimal("purchase_price", { precision: 20, scale: 2 })
    .notNull(), // NWT price
  platformFeeAmount: decimal("platform_fee_amount", { precision: 20, scale: 2 })
    .notNull(), // Platform fee (in NWT)
  royaltyAmount: decimal("royalty_amount", { precision: 20, scale: 2 })
    .default("0")
    .notNull(), // Creator royalty
  sellerAmount: decimal("seller_amount", { precision: 20, scale: 2 }).notNull(), // Amount seller receives

  // Transaction references
  transactionId: uuid("transaction_id").references(() => nftOrderTransactions.id, {
    onDelete: "set null",
  }),

  // Status
  status: orderStatusEnum("status").default("pending").notNull(),

  // Blockchain details
  blockchainTxHash: text("blockchain_tx_hash"),

  // Metadata
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { mode: "date" }),
  cancelledAt: timestamp("cancelled_at", { mode: "date" }),
});

/**
 * NFT Order Transactions
 * NWT payment transactions for NFT purchases
 */
export const nftOrderTransactions = pgTable("nft_order_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Order reference
  orderId: uuid("order_id")
    .notNull()
    .references(() => nftOrders.id, { onDelete: "cascade" }),

  // User making the payment
  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => readerProfile.id, { onDelete: "restrict" }),

  // Transaction type
  transactionType: text("transaction_type").notNull(), // "marketplace_purchase"
  status: text("status").notNull(), // "pending", "completed", "failed"

  // Amount
  totalAmount: decimal("total_amount", { precision: 20, scale: 2 }).notNull(), // Total NWT charged
  platformFeeAmount: decimal("platform_fee_amount", { precision: 20, scale: 2 })
    .notNull(),
  sellerAmount: decimal("seller_amount", { precision: 20, scale: 2 }).notNull(),
  royaltyAmount: decimal("royalty_amount", { precision: 20, scale: 2 })
    .default("0")
    .notNull(),

  // Description
  description: text("description").notNull(),

  // Failure info
  failureReason: text("failure_reason"),

  // Metadata
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

/**
 * NFT Ownership Transfer History
 * Records when NFTs are transferred on-chain after purchase
 */
export const nftMarketplaceTransfers = pgTable("nft_marketplace_transfers", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Order and NFT
  orderId: uuid("order_id")
    .notNull()
    .references(() => nftOrders.id, { onDelete: "cascade" }),
  nftId: uuid("nft_id")
    .notNull()
    .references(() => nft.id, { onDelete: "restrict" }),

  // Transfer details
  fromWalletAddress: text("from_wallet_address").notNull(),
  toWalletAddress: text("to_wallet_address").notNull(),

  // Blockchain tx
  transactionHash: text("transaction_hash"),
  status: text("status").notNull(), // "pending", "completed", "failed"

  // Metadata
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { mode: "date" }),
});

/**
 * Marketplace Escrow for Seller Withdrawals
 * Holds seller's earnings until they withdraw
 */
export const marketplaceEscrow = pgTable("marketplace_escrow", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Seller
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => userWallets.id, { onDelete: "cascade" }),

  // Balance
  totalEarnings: decimal("total_earnings", { precision: 20, scale: 2 })
    .notNull()
    .default("0"), // Total earned
  totalWithdrawn: decimal("total_withdrawn", { precision: 20, scale: 2 })
    .notNull()
    .default("0"), // Total withdrawn
  availableBalance: decimal("available_balance", { precision: 20, scale: 2 })
    .notNull()
    .default("0"), // Available to withdraw (totalEarnings - totalWithdrawn)

  // Metadata
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

/**
 * Seller Withdrawal Requests
 * Track when sellers withdraw their earnings
 */
export const sellerWithdrawals = pgTable("seller_withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Seller
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => userWallets.id, { onDelete: "cascade" }),

  // Withdrawal details
  amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
  status: text("status").notNull(), // "pending", "approved", "completed", "rejected"

  // Reason for rejection (if applicable)
  rejectionReason: text("rejection_reason"),

  // When processed
  approvedAt: timestamp("approved_at", { mode: "date" }),
  processedAt: timestamp("processed_at", { mode: "date" }),

  // Metadata
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

/**
 * Marketplace Configuration
 * Platform settings for fees and rules
 */
export const marketplaceConfig = pgTable("marketplace_config", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Fees
  platformFeePercentage: decimal("platform_fee_percentage", {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default("2"), // Default 2% platform fee

  // Minimum listing price
  minimumListingPrice: decimal("minimum_listing_price", { precision: 20, scale: 2 })
    .notNull()
    .default("1"),

  // Maximum listing price
  maximumListingPrice: decimal("maximum_listing_price", {
    precision: 20,
    scale: 2,
  }).default("1000000"),

  // Features
  isMarketplaceActive: boolean("is_marketplace_active").notNull().default(true),
  allowRoyalties: boolean("allow_royalties").notNull().default(true),

  // Metadata
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

// Type exports
export type InsertNftListing = typeof nftListings.$inferInsert;
export type SelectNftListing = typeof nftListings.$inferSelect;

export type InsertNftOrder = typeof nftOrders.$inferInsert;
export type SelectNftOrder = typeof nftOrders.$inferSelect;

export type InsertNftOrderTransaction = typeof nftOrderTransactions.$inferInsert;
export type SelectNftOrderTransaction = typeof nftOrderTransactions.$inferSelect;

export type InsertMarketplaceEscrow = typeof marketplaceEscrow.$inferInsert;
export type SelectMarketplaceEscrow = typeof marketplaceEscrow.$inferSelect;

export type InsertSellerWithdrawal = typeof sellerWithdrawals.$inferInsert;
export type SelectSellerWithdrawal = typeof sellerWithdrawals.$inferSelect;
