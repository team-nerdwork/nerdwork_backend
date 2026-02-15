import { pgTable, uuid, timestamp, integer } from "drizzle-orm/pg-core";
import { nftOwnershipReasonEnum } from "./enums";
import { nfts } from "./nft.schema";
import { creatorProfile, readerProfile } from "../profile";

export const nftOwnerships = pgTable("nft_ownerships", {
  id: uuid("id").primaryKey().defaultRandom(),

  nftId: uuid("nft_id")
    .notNull()
    .references(() => nfts.id, { onDelete: "cascade" }),

  ownerReaderId: uuid("owner_reader_id")
    .notNull()
    .references(() => readerProfile.id, { onDelete: "cascade" }),

  quantity: integer("quantity").notNull().default(1),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),

  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const nftOwnershipHistory = pgTable("nft_ownership_history", {
  id: uuid("id").primaryKey().defaultRandom(),

  nftId: uuid("nft_id")
    .notNull()
    .references(() => nfts.id, { onDelete: "cascade" }),

  fromUserId: uuid("from_user_id").references(() => creatorProfile.id, {
    onDelete: "set null",
  }),

  toUserId: uuid("to_user_id")
    .notNull()
    .references(() => readerProfile.id, { onDelete: "cascade" }),

  reason: nftOwnershipReasonEnum("reason").notNull(),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});
