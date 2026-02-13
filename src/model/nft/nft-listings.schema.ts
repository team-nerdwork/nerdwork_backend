import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";
import { nftListingStatusEnum } from "./enums";
import { nfts } from "./nft.schema";
import { creatorProfile } from "../profile";

export const nftListings = pgTable("nft_listings", {
  id: uuid("id").primaryKey().defaultRandom(),

  // NFT reference
  nftId: uuid("nft_id")
    .notNull()
    .references(() => nfts.id, { onDelete: "cascade" }),

  // Seller (creator for MVP)
  sellerId: uuid("seller_id")
    .notNull()
    .references(() => creatorProfile.id, { onDelete: "cascade" }),

  // Pricing (NWT)
  price: decimal("price", { precision: 20, scale: 2 }).notNull(),

  status: nftListingStatusEnum("status").notNull().default("active"), // active | sold | cancelled

  listedAt: timestamp("listed_at", { mode: "date" }).notNull().defaultNow(),

  soldAt: timestamp("sold_at", { mode: "date" }),
  cancelledAt: timestamp("cancelled_at", { mode: "date" }),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),

  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
