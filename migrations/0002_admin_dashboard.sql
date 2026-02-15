DO $$ BEGIN
  CREATE TYPE admin_status_enum AS ENUM ('active', 'suspended', 'disabled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  email text NOT NULL UNIQUE,
  display_name text,
  status admin_status_enum NOT NULL DEFAULT 'active',
  last_login_at timestamp,
  created_at timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  status text NOT NULL,
  metadata jsonb,
  created_at timestamp DEFAULT now() NOT NULL,
  CONSTRAINT admin_audit_logs_admin_id_fk FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE cascade
);

ALTER TYPE comic_status_enum ADD VALUE IF NOT EXISTS 'flagged';

DO $$ BEGIN
  CREATE TYPE creator_verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE creator_profile
  ADD COLUMN IF NOT EXISTS verification_status creator_verification_status NOT NULL DEFAULT 'pending';

ALTER TABLE creator_profile
  ADD COLUMN IF NOT EXISTS verified_at timestamp;