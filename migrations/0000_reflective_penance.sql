DO $$ BEGIN
  CREATE TYPE "public"."wallet_type_enum" AS ENUM ('solflare', 'phantom');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."comic_status_enum" AS ENUM('published', 'pending', 'scheduled', 'draft');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."chapter_type" AS ENUM('free', 'paid');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."creator_transaction_status" AS ENUM('pending', 'completed', 'processing', 'failed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."creator_transaction_type" AS ENUM('earning', 'withdrawal', 'bonus');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."earning_source" AS ENUM('chapter_purchase', 'comic_purchase', 'tip_received', 'subscription_revenue', 'platform_bonus');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."spend_category" AS ENUM('chapter_unlock', 'comic_purchase', 'tip_creator', 'subscription', 'marketplace_purchase');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."user_transaction_status" AS ENUM('pending', 'completed', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."user_transaction_type" AS ENUM('purchase', 'spend', 'refund');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."listing_status" AS ENUM('active', 'sold', 'cancelled', 'delisted');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled', 'failed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"session_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_sessions_session_token_unique" UNIQUE("session_token"),
	CONSTRAINT "auth_sessions_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "auth_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp DEFAULT null,
	"locked_until" timestamp DEFAULT null,
	"login_attempts" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_users_email_unique" UNIQUE("email"),
	CONSTRAINT "auth_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_resets_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nwt_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_wallet_id" uuid NOT NULL,
	"transaction_type" text NOT NULL,
	"category" text NOT NULL,
	"amount" text NOT NULL,
	"balance_before" text NOT NULL,
	"balance_after" text NOT NULL,
	"reference_id" text,
	"reference_type" text,
	"description" text NOT NULL,
	"metadata" json,
	"blockchain_tx_hash" text,
	"status" text NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_wallet_id" uuid NOT NULL,
	"amount" text NOT NULL,
	"currency" text NOT NULL,
	"nwt_amount" text,
	"exchange_rate" text,
	"webhook_id" text,
	"payment_intent_id" text,
	"blockchain_tx_hash" text,
	"status" text NOT NULL,
	"failure_reason" text,
	"metadata" json NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "creator_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"creator_name" text NOT NULL,
	"phone_number" text,
	"bio" text,
	"genres" text[] DEFAULT '{}'::text[] NOT NULL,
	"wallet_type" "wallet_type_enum",
	"wallet_address" text,
	"wallet_balance" double precision DEFAULT 0 NOT NULL,
	"pin_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reader_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"genres" text[] DEFAULT '{}'::text[] NOT NULL,
	"wallet_id" varchar(12) NOT NULL,
	"wallet_balance" double precision DEFAULT 0 NOT NULL,
	"pin_hash" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reader_profile_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "reader_profile_wallet_id_unique" UNIQUE("wallet_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"first_name" text,
	"last_name" text,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"date_of_birth" timestamp,
	"country" text,
	"timezone" text,
	"language" text NOT NULL,
	"preferences" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_profile_id" uuid NOT NULL,
	"nwt_balance" integer NOT NULL,
	"nwt_locked_balance" integer NOT NULL,
	"primary_wallet_address" text,
	"kyc_status" text NOT NULL,
	"kyc_level" integer DEFAULT 0 NOT NULL,
	"spending_limit_daily" integer,
	"spending_limit_monthly" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_wallets_user_profile_id_unique" UNIQUE("user_profile_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallet_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_wallet_id" uuid NOT NULL,
	"blockchain" text NOT NULL,
	"address" text NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"label" text,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "loyalty_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comic_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reader_id" uuid NOT NULL,
	"comic_id" uuid NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "comics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"language" varchar(50) NOT NULL,
	"age_rating" varchar(10) NOT NULL,
	"no_of_chapters" integer DEFAULT 0 NOT NULL,
	"no_of_drafts" integer DEFAULT 0 NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"comic_status" "comic_status_enum" DEFAULT 'draft',
	"genre" text[] NOT NULL,
	"tags" text[],
	"slug" varchar(300) NOT NULL,
	"creator_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapter_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reader_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapter_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reader_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapter_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reader_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"chapter_type" "chapter_type" DEFAULT 'free' NOT NULL,
	"price" double precision DEFAULT 0 NOT NULL,
	"summary" text,
	"serial_no" integer DEFAULT 0 NOT NULL,
	"pages" text[] NOT NULL,
	"chapter_status" "comic_status_enum" DEFAULT 'draft',
	"comic_id" uuid NOT NULL,
	"unique_code" varchar(4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chapters_unique_code_unique" UNIQUE("unique_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paid_Chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reader_id" uuid NOT NULL,
	"chapter_id" uuid NOT NULL,
	"paid_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reader_id" uuid NOT NULL,
	"comic_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "creator_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"transaction_type" "creator_transaction_type" NOT NULL,
	"status" "creator_transaction_status" DEFAULT 'pending' NOT NULL,
	"nwt_amount" numeric(10, 6) NOT NULL,
	"description" text NOT NULL,
	"earning_source" "earning_source",
	"content_id" uuid,
	"purchaser_user_id" uuid,
	"source_user_transaction_id" uuid,
	"gross_amount" numeric(10, 6),
	"platform_fee" numeric(10, 6),
	"platform_fee_percentage" numeric(5, 4) DEFAULT '0.30',
	"withdrawal_method" varchar(100),
	"withdrawal_address" text,
	"withdrawal_fee" numeric(10, 6),
	"external_transaction_id" varchar(255),
	"processed_at" timestamp,
	"failure_reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reader_id" uuid NOT NULL,
	"transaction_type" "user_transaction_type" NOT NULL,
	"status" "user_transaction_status" DEFAULT 'pending' NOT NULL,
	"nwt_amount" numeric(10, 6) NOT NULL,
	"usd_amount" numeric(10, 2),
	"description" text NOT NULL,
	"spend_category" "spend_category",
	"content_id" uuid,
	"creator_id" uuid,
	"helio_payment_id" varchar(255),
	"helio_webhook_id" varchar(255),
	"blockchain_tx_hash" varchar(255),
	"metadata" jsonb,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nfts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_wallet_id" uuid NOT NULL,
	"collection" text,
	"nft_type" text DEFAULT 'anchor',
	"mint_address" text,
	"price" integer DEFAULT 0,
	"is_limited_edition" boolean DEFAULT false,
	"amount" integer DEFAULT 1,
	"metadata" json,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_wallet_id" uuid NOT NULL,
	"transaction_type" text NOT NULL,
	"category" text NOT NULL,
	"amount" text NOT NULL,
	"balance_before" text NOT NULL,
	"balance_after" text NOT NULL,
	"reference_id" text,
	"reference_type" text,
	"description" text NOT NULL,
	"metadata" json,
	"blockchain_tx_hash" text,
	"status" text NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft_transfer_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nft_id" uuid NOT NULL,
	"from_user_wallet_id" uuid,
	"to_user_wallet_id" uuid NOT NULL,
	"from_wallet_address" text,
	"to_wallet_address" text NOT NULL,
	"transaction_hash" text,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketplace_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_fee_percentage" numeric(5, 2) DEFAULT '2' NOT NULL,
	"minimum_listing_price" numeric(20, 2) DEFAULT '1' NOT NULL,
	"maximum_listing_price" numeric(20, 2) DEFAULT '1000000',
	"is_marketplace_active" boolean DEFAULT true NOT NULL,
	"allow_royalties" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "marketplace_escrow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"total_earnings" numeric(20, 2) DEFAULT '0' NOT NULL,
	"total_withdrawn" numeric(20, 2) DEFAULT '0' NOT NULL,
	"available_balance" numeric(20, 2) DEFAULT '0' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft_listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nft_id" uuid NOT NULL,
	"mint_address" text NOT NULL,
	"seller_id" uuid NOT NULL,
	"seller_wallet_address" text NOT NULL,
	"price" numeric(20, 2) NOT NULL,
	"royalty_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "listing_status" DEFAULT 'active' NOT NULL,
	"listed_at" timestamp DEFAULT now() NOT NULL,
	"sold_at" timestamp,
	"cancelled_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft_marketplace_transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"nft_id" uuid NOT NULL,
	"from_wallet_address" text NOT NULL,
	"to_wallet_address" text NOT NULL,
	"transaction_hash" text,
	"status" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft_order_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"buyer_id" uuid NOT NULL,
	"transaction_type" text NOT NULL,
	"status" text NOT NULL,
	"total_amount" numeric(20, 2) NOT NULL,
	"platform_fee_amount" numeric(20, 2) NOT NULL,
	"seller_amount" numeric(20, 2) NOT NULL,
	"royalty_amount" numeric(20, 2) DEFAULT '0' NOT NULL,
	"description" text NOT NULL,
	"failure_reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"nft_id" uuid NOT NULL,
	"mint_address" text NOT NULL,
	"buyer_id" uuid NOT NULL,
	"buyer_wallet_address" text NOT NULL,
	"seller_id" uuid NOT NULL,
	"seller_wallet_address" text NOT NULL,
	"purchase_price" numeric(20, 2) NOT NULL,
	"platform_fee_amount" numeric(20, 2) NOT NULL,
	"royalty_amount" numeric(20, 2) DEFAULT '0' NOT NULL,
	"seller_amount" numeric(20, 2) NOT NULL,
	"transaction_id" uuid,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"blockchain_tx_hash" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "seller_withdrawals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"seller_id" uuid NOT NULL,
	"amount" numeric(20, 2) NOT NULL,
	"status" text NOT NULL,
	"rejection_reason" text,
	"approved_at" timestamp,
	"processed_at" timestamp,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpointDO $$ BEGIN
  ALTER TABLE "auth_sessions"
  ADD CONSTRAINT "auth_sessions_user_id_auth_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "password_resets"
  ADD CONSTRAINT "password_resets_user_id_auth_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "nwt_transactions"
  ADD CONSTRAINT "nwt_transactions_user_wallet_id_user_wallets_id_fk"
  FOREIGN KEY ("user_wallet_id") REFERENCES "public"."user_wallets"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "payments"
  ADD CONSTRAINT "payments_user_wallet_id_user_wallets_id_fk"
  FOREIGN KEY ("user_wallet_id") REFERENCES "public"."user_wallets"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "creator_profile"
  ADD CONSTRAINT "creator_profile_user_id_auth_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "reader_profile"
  ADD CONSTRAINT "reader_profile_user_id_auth_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "user_profiles"
  ADD CONSTRAINT "user_profiles_auth_user_id_auth_users_id_fk"
  FOREIGN KEY ("auth_user_id") REFERENCES "public"."auth_users"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "user_wallets"
  ADD CONSTRAINT "user_wallets_user_profile_id_user_profiles_id_fk"
  FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "wallet_addresses"
  ADD CONSTRAINT "wallet_addresses_user_wallet_id_user_wallets_id_fk"
  FOREIGN KEY ("user_wallet_id") REFERENCES "public"."user_wallets"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "loyalty_points"
  ADD CONSTRAINT "loyalty_points_user_id_auth_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id")
  ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "comic_subscribers"
  ADD CONSTRAINT "comic_subscribers_reader_id_reader_profile_id_fk"
  FOREIGN KEY ("reader_id") REFERENCES "public"."reader_profile"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "comic_subscribers"
  ADD CONSTRAINT "comic_subscribers_comic_id_comics_id_fk"
  FOREIGN KEY ("comic_id") REFERENCES "public"."comics"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "comics"
  ADD CONSTRAINT "comics_creator_id_creator_profile_id_fk"
  FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profile"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "chapter_comments"
  ADD CONSTRAINT "chapter_comments_reader_id_reader_profile_id_fk"
  FOREIGN KEY ("reader_id") REFERENCES "public"."reader_profile"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "chapter_comments"
  ADD CONSTRAINT "chapter_comments_chapter_id_chapters_id_fk"
  FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "chapter_likes"
  ADD CONSTRAINT "chapter_likes_reader_id_reader_profile_id_fk"
  FOREIGN KEY ("reader_id") REFERENCES "public"."reader_profile"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "chapter_likes"
  ADD CONSTRAINT "chapter_likes_chapter_id_chapters_id_fk"
  FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "chapter_views"
  ADD CONSTRAINT "chapter_views_reader_id_reader_profile_id_fk"
  FOREIGN KEY ("reader_id") REFERENCES "public"."reader_profile"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "chapter_views"
  ADD CONSTRAINT "chapter_views_chapter_id_chapters_id_fk"
  FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "chapters"
  ADD CONSTRAINT "chapters_comic_id_comics_id_fk"
  FOREIGN KEY ("comic_id") REFERENCES "public"."comics"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "paid_Chapters"
  ADD CONSTRAINT "paid_Chapters_reader_id_reader_profile_id_fk"
  FOREIGN KEY ("reader_id") REFERENCES "public"."reader_profile"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "paid_Chapters"
  ADD CONSTRAINT "paid_Chapters_chapter_id_chapters_id_fk"
  FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "library"
  ADD CONSTRAINT "library_reader_id_reader_profile_id_fk"
  FOREIGN KEY ("reader_id") REFERENCES "public"."reader_profile"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "library"
  ADD CONSTRAINT "library_comic_id_comics_id_fk"
  FOREIGN KEY ("comic_id") REFERENCES "public"."comics"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "creator_transactions"
  ADD CONSTRAINT "creator_transactions_creator_id_creator_profile_id_fk"
  FOREIGN KEY ("creator_id") REFERENCES "public"."creator_profile"("id")
  ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  ALTER TABLE "creator_transactions"
  ADD CONSTRAINT "creator_transactions_source_user_transaction_id_user_transactions_id_fk"
  FOREIGN KEY ("source_user_transaction_id")
  REFERENCES "public"."user_transactions"("id")
  ON DELETE no action
  ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

