-- 1️⃣ Create enum safely
DO $$ BEGIN
    CREATE TYPE "nft_ownership_reason" AS ENUM (
        'mint',
        'purchase',
        'transfer'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2️⃣ Create nft_ownership_history if not exists
CREATE TABLE IF NOT EXISTS "nft_ownership_history" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "nft_id" uuid NOT NULL,
    "from_user_id" uuid,
    "to_user_id" uuid NOT NULL,
    "reason" "nft_ownership_reason" NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- 3️⃣ Create nft_ownerships if not exists
CREATE TABLE IF NOT EXISTS "nft_ownerships" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "nft_id" uuid NOT NULL,
    "owner_reader_id" uuid NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 4️⃣ Add new columns safely
ALTER TABLE "nft_orders"
ADD COLUMN IF NOT EXISTS "quantity" integer;

ALTER TABLE "nft_orders"
ADD COLUMN IF NOT EXISTS "price" numeric(20,2);

ALTER TABLE "nft_orders"
ADD COLUMN IF NOT EXISTS "platform_fee" numeric(20,2);
