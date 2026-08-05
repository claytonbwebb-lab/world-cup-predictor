-- Migration: Double Up picks
-- One Double Up pick per user per week. Match points are doubled when scored.

CREATE TABLE IF NOT EXISTS double_up_picks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_number)
);

CREATE INDEX IF NOT EXISTS idx_double_up_picks_user_week ON double_up_picks(user_id, week_number);
CREATE INDEX IF NOT EXISTS idx_double_up_picks_match ON double_up_picks(match_id);

-- Helper: check if Double Up is locked for a given week
-- (first match kickoff has passed)
CREATE OR REPLACE FUNCTION is_double_up_locked(p_week_number INTEGER)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM matches
    WHERE week_number = p_week_number
      AND kickoff_at <= NOW()
    LIMIT 1
  );
$$ LANGUAGE SQL STABLE;

-- Helper: get the earliest kickoff for a week (NULL if no matches yet)
CREATE OR REPLACE FUNCTION get_week_first_kickoff(p_week_number INTEGER)
RETURNS TIMESTAMPTZ AS $$
  SELECT MIN(kickoff_at) FROM matches WHERE week_number = p_week_number;
$$ LANGUAGE SQL STABLE;

-- Helper: get user's Double Up pick for a week
CREATE OR REPLACE FUNCTION get_double_up_pick(p_user_id UUID, p_week_number INTEGER)
RETURNS UUID AS $$
  SELECT match_id FROM double_up_picks
  WHERE user_id = p_user_id AND week_number = p_week_number;
$$ LANGUAGE SQL STABLE;