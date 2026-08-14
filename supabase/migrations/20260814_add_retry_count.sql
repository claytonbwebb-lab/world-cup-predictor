-- Add retry_count column for score update tracking
ALTER TABLE matches ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;
