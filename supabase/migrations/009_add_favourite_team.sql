-- Migration: 009_add_favourite_team
-- Adds favourite_team column to profiles for supporter league feature

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS favourite_team TEXT;

-- Index for faster grouping in supporter league queries
CREATE INDEX IF NOT EXISTS idx_profiles_favourite_team ON profiles(favourite_team)
WHERE favourite_team IS NOT NULL;