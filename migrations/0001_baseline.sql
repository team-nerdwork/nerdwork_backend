-- ===============================
-- NFT ENUMS (SAFE CREATION)
-- ===============================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nft_listing_status') THEN
        CREATE TYPE "public"."nft_listing_status" AS ENUM ('active', 'sold', 'cancelled');
    END IF;
END$$;
--> statement-breakpoint

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nft_order_status') THEN
        CREATE TYPE "public"."nft_order_status" AS ENUM ('pending', 'completed', 'cancelled');
    END IF;
END$$;
--> statement-breakpoint

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nft_ownership_reason') THEN
        CREATE TYPE "public"."nft_ownership_reason" AS ENUM ('mint', 'purchase', 'transfer');
    END IF;
END$$;
--> statement-breakpoint


-- ===============================
-- SAFE ENUM EXTENSION
-- ===============================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'spend_category'
        AND e.enumlabel = 'marketplace_purchase'
    ) THEN
        ALTER TYPE "public"."spend_category" ADD VALUE 'marketplace_purchase';
    END IF;
END$$;
--> statement-breakpoint


-- ===============================
-- NFT CORE TABLE
-- ===============================

CREATE TABLE IF NOT EXISTS "nfts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "creator_id" uuid NOT NULL,
    "owner_creator_id" uuid NOT NULL,
    "title" text NOT NULL,
    "description" text,
    "image_key" text NOT NULL,
    "image_cid" text,
    "metadata_cid" text,
    "token_uri" text,
    "metadata" jsonb,
    "supply" integer DEFAULT 1 NOT NULL,
    "remaining_supply" integer DEFAULT 1 NOT NULL,
    "royalty_bps" integer DEFAULT 500,
    "status" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint


-- ===============================
-- LISTINGS
-- ===============================

CREATE TABLE IF NOT EXISTS "nft_listings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "nft_id" uuid NOT NULL,
    "seller_id" uuid NOT NULL,
    "price" numeric(20, 2) NOT NULL,
    "status" "nft_listing_status" DEFAULT 'active' NOT NULL,
    "listed_at" timestamp DEFAULT now() NOT NULL,
    "sold_at" timestamp,
    "cancelled_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint


-- ===============================
-- ORDERS
-- ===============================

CREATE TABLE IF NOT EXISTS "nft_orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "nft_id" uuid NOT NULL,
    "listing_id" uuid NOT NULL,
    "buyer_id" uuid NOT NULL,
    "seller_id" uuid NOT NULL,
    "quantity" integer NOT NULL,
    "price" numeric(20, 2) NOT NULL,
    "platform_fee" numeric(20, 2) NOT NULL,
    "royalty_amount" numeric(20, 2) DEFAULT '0',
    "seller_amount" numeric(20, 2) NOT NULL,
    "status" "nft_order_status" DEFAULT 'pending' NOT NULL,
    "metadata" jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "completed_at" timestamp
);
--> statement-breakpoint


-- ===============================
-- OWNERSHIP HISTORY
-- ===============================

CREATE TABLE IF NOT EXISTS "nft_ownership_history" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "nft_id" uuid NOT NULL,
    "from_user_id" uuid,
    "to_user_id" uuid NOT NULL,
    "reason" "nft_ownership_reason" NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint


-- ===============================
-- CURRENT OWNERSHIP
-- ===============================

CREATE TABLE IF NOT EXISTS "nft_ownerships" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "nft_id" uuid NOT NULL,
    "owner_reader_id" uuid NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint


-- ===============================
-- FOREIGN KEYS (SAFE)
-- ===============================

ALTER TABLE "nfts"
DROP CONSTRAINT IF EXISTS "nfts_creator_id_creator_profile_id_fk";

ALTER TABLE "nfts"
ADD CONSTRAINT "nfts_creator_id_creator_profile_id_fk"
FOREIGN KEY ("creator_id")
REFERENCES "public"."creator_profile"("id")
ON DELETE cascade;
--> statement-breakpoint


ALTER TABLE "nfts"
DROP CONSTRAINT IF EXISTS "nfts_owner_creator_id_creator_profile_id_fk";

ALTER TABLE "nfts"
ADD CONSTRAINT "nfts_owner_creator_id_creator_profile_id_fk"
FOREIGN KEY ("owner_creator_id")
REFERENCES "public"."creator_profile"("id")
ON DELETE cascade;
--> statement-breakpoint


ALTER TABLE "nft_listings"
DROP CONSTRAINT IF EXISTS "nft_listings_nft_id_nfts_id_fk";

ALTER TABLE "nft_listings"
ADD CONSTRAINT "nft_listings_nft_id_nfts_id_fk"
FOREIGN KEY ("nft_id")
REFERENCES "public"."nfts"("id")
ON DELETE cascade;
--> statement-breakpoint


ALTER TABLE "nft_listings"
DROP CONSTRAINT IF EXISTS "nft_listings_seller_id_creator_profile_id_fk";

ALTER TABLE "nft_listings"
ADD CONSTRAINT "nft_listings_seller_id_creator_profile_id_fk"
FOREIGN KEY ("seller_id")
REFERENCES "public"."creator_profile"("id")
ON DELETE cascade;
--> statement-breakpoint


ALTER TABLE "nft_orders"
DROP CONSTRAINT IF EXISTS "nft_orders_nft_id_nfts_id_fk";

ALTER TABLE "nft_orders"
ADD CONSTRAINT "nft_orders_nft_id_nfts_id_fk"
FOREIGN KEY ("nft_id")
REFERENCES "public"."nfts"("id")
ON DELETE restrict;
--> statement-breakpoint


ALTER TABLE "nft_orders"
DROP CONSTRAINT IF EXISTS "nft_orders_listing_id_nft_listings_id_fk";

ALTER TABLE "nft_orders"
ADD CONSTRAINT "nft_orders_listing_id_nft_listings_id_fk"
FOREIGN KEY ("listing_id")
REFERENCES "public"."nft_listings"("id")
ON DELETE restrict;
--> statement-breakpoint


ALTER TABLE "nft_orders"
DROP CONSTRAINT IF EXISTS "nft_orders_buyer_id_reader_profile_id_fk";

ALTER TABLE "nft_orders"
ADD CONSTRAINT "nft_orders_buyer_id_reader_profile_id_fk"
FOREIGN KEY ("buyer_id")
REFERENCES "public"."reader_profile"("id")
ON DELETE restrict;
--> statement-breakpoint


ALTER TABLE "nft_orders"
DROP CONSTRAINT IF EXISTS "nft_orders_seller_id_creator_profile_id_fk";

ALTER TABLE "nft_orders"
ADD CONSTRAINT "nft_orders_seller_id_creator_profile_id_fk"
FOREIGN KEY ("seller_id")
REFERENCES "public"."creator_profile"("id")
ON DELETE restrict;
--> statement-breakpoint


ALTER TABLE "nft_ownership_history"
DROP CONSTRAINT IF EXISTS "nft_ownership_history_nft_id_nfts_id_fk";

ALTER TABLE "nft_ownership_history"
ADD CONSTRAINT "nft_ownership_history_nft_id_nfts_id_fk"
FOREIGN KEY ("nft_id")
REFERENCES "public"."nfts"("id")
ON DELETE cascade;
--> statement-breakpoint


ALTER TABLE "nft_ownership_history"
DROP CONSTRAINT IF EXISTS "nft_ownership_history_to_user_id_reader_profile_id_fk";

ALTER TABLE "nft_ownership_history"
ADD CONSTRAINT "nft_ownership_history_to_user_id_reader_profile_id_fk"
FOREIGN KEY ("to_user_id")
REFERENCES "public"."reader_profile"("id")
ON DELETE cascade;
--> statement-breakpoint


ALTER TABLE "nft_ownerships"
DROP CONSTRAINT IF EXISTS "nft_ownerships_nft_id_nfts_id_fk";

ALTER TABLE "nft_ownerships"
ADD CONSTRAINT "nft_ownerships_nft_id_nfts_id_fk"
FOREIGN KEY ("nft_id")
REFERENCES "public"."nfts"("id")
ON DELETE cascade;
--> statement-breakpoint


ALTER TABLE "nft_ownerships"
DROP CONSTRAINT IF EXISTS "nft_ownerships_owner_reader_id_reader_profile_id_fk";

ALTER TABLE "nft_ownerships"
ADD CONSTRAINT "nft_ownerships_owner_reader_id_reader_profile_id_fk"
FOREIGN KEY ("owner_reader_id")
REFERENCES "public"."reader_profile"("id")
ON DELETE cascade;
--> statement-breakpoint