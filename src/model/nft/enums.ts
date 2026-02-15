import { pgEnum } from "drizzle-orm/pg-core";

/**
 * NFT lifecycle status
 */
export const nftStatusEnum = pgEnum("nft_status", [
  "draft",
  "frozen",
  "listed",
  "sold",
]);
/**
 * Marketplace listing status
 */
export const nftListingStatusEnum = pgEnum("nft_listing_status", [
  "active",
  "sold",
  "cancelled",
]);

/**
 * NFT order status
 */
export const nftOrderStatusEnum = pgEnum("nft_order_status", [
  "pending",
  "completed",
  "cancelled",
]);

/**
 * NFT ownership change reason
 */
export const nftOwnershipReasonEnum = pgEnum("nft_ownership_reason", [
  "mint",
  "purchase",
  "transfer",
]);
