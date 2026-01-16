-- Add tags column to nfts table
-- Tags are stored as JSON array of strings (e.g., ["fiction", "mystery", "romance"])
ALTER TABLE nfts ADD COLUMN IF NOT EXISTS tags JSONB;

-- Add comment to describe the column
COMMENT ON COLUMN nfts.tags IS 'Genre/category tags for the NFT (e.g., fiction, mystery, romance)';
