import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";
import { nftStatusEnum } from "./enums";
import { creatorProfile } from "../profile";

export const nfts = pgTable("nfts", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Creator
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creatorProfile.id, { onDelete: "cascade" }),

  // Current ownership (custodial for MVP)
  ownerCreatorId: uuid("owner_creator_id")
    .notNull()
    .references(() => creatorProfile.id, { onDelete: "cascade" }),

  // Core info
  title: text("title").notNull(),
  description: text("description"),

  // S3 storage reference
  imageKey: text("image_key").notNull(), // durable S3 object key

  // IPFS layer
  imageCID: text("image_cid"), // CID from Pinata (image)
  metadataCID: text("metadata_cid"), // CID from Pinata (metadata JSON)
  tokenURI: text("token_uri"), // ipfs://<metadataCID>

  // Raw metadata stored internally (optional but useful)
  metadata: jsonb("metadata"),

  // Editions
  supply: integer("supply").notNull().default(1),
  remainingSupply: integer("remaining_supply").notNull().default(1),

  // Royalties (basis points, matches Metaplex style)
  royaltyBps: integer("royalty_bps").notNull().default(500), // 500 = 5%

  // Lifecycle
  status: nftStatusEnum("status").notNull().default("draft"),

  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),

  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
