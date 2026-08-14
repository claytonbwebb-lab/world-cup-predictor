-- Add is_visible column: matches import hidden until pushed live
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT false;

-- RLS: users can only see visible matches on the public site
-- (admins still see all via service role)
