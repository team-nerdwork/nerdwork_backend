import {
  pgTable,
  uuid,
  timestamp,
  decimal,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { nftOrderStatusEnum } from "./enums";
import { nfts } from "./nft.schema";
import { nftListings } from "./nft-listings.schema";
import { creatorProfile, readerProfile } from "../profile";

export const nftOrders = pgTable("nft_orders", {
  id: uuid("id").primaryKey().defaultRandom(),

  nftId: uuid("nft_id")
    .notNull()
    .references(() => nfts.id, { onDelete: "restrict" }),

  listingId: uuid("listing_id")
    .notNull()
    .references(() => nftListings.id, { onDelete: "restrict" }),

  buyerId: uuid("buyer_id")
    .notNull()
    .references(() => readerProfile.id, { onDelete: "restrict" }),

  sellerId: uuid("seller_id")
    .notNull()
    .references(() => creatorProfile.id, { onDelete: "restrict" }),

  quantity: integer("quantity").notNull(),

  // Amounts (NWT)
  price: decimal("price", { precision: 20, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 20, scale: 2 }).notNull(),
  royaltyAmount: decimal("royalty_amount", {
    precision: 20,
    scale: 2,
  }).default("0"),
  sellerAmount: decimal("seller_amount", {
    precision: 20,
    scale: 2,
  }).notNull(),

  status: nftOrderStatusEnum("status").notNull().default("pending"),

  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),

  completedAt: timestamp("completed_at", { mode: "date" }),
});
