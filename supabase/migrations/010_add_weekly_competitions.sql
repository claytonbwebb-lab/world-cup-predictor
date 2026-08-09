-- Migration: Add weekly competition support
-- Weeks run Tuesday 00:00 to Monday 23:59:59
-- Season 2026/27 starts 2026-08-15

-- 1. Add week_number to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS week_number INTEGER;
ALTER TABLE matches ADD CONSTRAINT matches_week_number_check CHECK (week_number >= 1);

-- 2. Weeks metadata table
CREATE TABLE IF NOT EXISTS weeks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_number INTEGER UNIQUE NOT NULL,
    label TEXT NOT NULL,            -- e.g. "Week 1", "Week 2"
    season TEXT NOT NULL DEFAULT '2026-27',
    starts_at TIMESTAMPTZ NOT NULL,  -- Tuesday 00:00 of that week
    ends_at TIMESTAMPTZ NOT NULL,   -- Monday 23:59:59 of that week
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seed weeks for 2026/27 season (Aug 2026 – May 2027, ~34 weeks)
INSERT INTO weeks (week_number, label, season, starts_at, ends_at) VALUES
(1,  'Week 1',  '2026-27', '2026-08-11 00:00:00+00', '2026-08-17 23:59:59+00'),
(2,  'Week 2',  '2026-27', '2026-08-17 00:00:00+00', '2026-08-24 23:59:59+00'),
(3,  'Week 3',  '2026-27', '2026-08-24 00:00:00+00', '2026-08-31 23:59:59+00'),
(4,  'Week 4',  '2026-27', '2026-08-31 00:00:00+00', '2026-09-07 23:59:59+00'),
(5,  'Week 5',  '2026-27', '2026-09-07 00:00:00+00', '2026-09-14 23:59:59+00'),
(6,  'Week 6',  '2026-27', '2026-09-14 00:00:00+00', '2026-09-21 23:59:59+00'),
(7,  'Week 7',  '2026-27', '2026-09-21 00:00:00+00', '2026-09-28 23:59:59+00'),
(8,  'Week 8',  '2026-27', '2026-09-28 00:00:00+00', '2026-10-05 23:59:59+00'),
(9,  'Week 9',  '2026-27', '2026-10-05 00:00:00+00', '2026-10-12 23:59:59+00'),
(10, 'Week 10', '2026-27', '2026-10-12 00:00:00+00', '2026-10-19 23:59:59+00'),
(11, 'Week 11', '2026-27', '2026-10-19 00:00:00+00', '2026-10-26 23:59:59+00'),
(12, 'Week 12', '2026-27', '2026-10-26 00:00:00+00', '2026-11-02 23:59:59+00'),
(13, 'Week 13', '2026-27', '2026-11-02 00:00:00+00', '2026-11-09 23:59:59+00'),
(14, 'Week 14', '2026-27', '2026-11-09 00:00:00+00', '2026-11-16 23:59:59+00'),
(15, 'Week 15', '2026-27', '2026-11-16 00:00:00+00', '2026-11-23 23:59:59+00'),
(16, 'Week 16', '2026-27', '2026-11-23 00:00:00+00', '2026-11-30 23:59:59+00'),
(17, 'Week 17', '2026-27', '2026-11-30 00:00:00+00', '2026-12-07 23:59:59+00'),
(18, 'Week 18', '2026-27', '2026-12-07 00:00:00+00', '2026-12-14 23:59:59+00'),
(19, 'Week 19', '2026-27', '2026-12-14 00:00:00+00', '2026-12-21 23:59:59+00'),
(20, 'Week 20', '2026-27', '2026-12-21 00:00:00+00', '2026-12-28 23:59:59+00'),
(21, 'Week 21', '2026-27', '2026-12-28 00:00:00+00', '2027-01-04 23:59:59+00'),
(22, 'Week 22', '2026-27', '2027-01-04 00:00:00+00', '2027-01-11 23:59:59+00'),
(23, 'Week 23', '2027-27', '2027-01-11 00:00:00+00', '2027-01-18 23:59:59+00'),
(24, 'Week 24', '2027-27', '2027-01-18 00:00:00+00', '2027-01-25 23:59:59+00'),
(25, 'Week 25', '2027-27', '2027-01-25 00:00:00+00', '2027-02-01 23:59:59+00'),
(26, 'Week 26', '2027-27', '2027-02-01 00:00:00+00', '2027-02-08 23:59:59+00'),
(27, 'Week 27', '2027-27', '2027-02-08 00:00:00+00', '2027-02-15 23:59:59+00'),
(28, 'Week 28', '2027-27', '2027-02-15 00:00:00+00', '2027-02-22 23:59:59+00'),
(29, 'Week 29', '2027-27', '2027-02-22 00:00:00+00', '2027-03-01 23:59:59+00'),
(30, 'Week 30', '2027-27', '2027-03-01 00:00:00+00', '2027-03-08 23:59:59+00'),
(31, 'Week 31', '2027-27', '2027-03-08 00:00:00+00', '2027-03-15 23:59:59+00'),
(32, 'Week 32', '2027-27', '2027-03-15 00:00:00+00', '2027-03-22 23:59:59+00'),
(33, 'Week 33', '2027-27', '2027-03-22 00:00:00+00', '2027-03-29 23:59:59+00'),
(34, 'Week 34', '2027-27', '2027-03-29 00:00:00+00', '2027-04-05 23:59:59+00'),
(35, 'Week 35', '2027-27', '2027-04-05 00:00:00+00', '2027-04-12 23:59:59+00'),
(36, 'Week 36', '2027-27', '2027-04-12 00:00:00+00', '2027-04-19 23:59:59+00'),
(37, 'Week 37', '2027-27', '2027-04-19 00:00:00+00', '2027-04-26 23:59:59+00'),
(38, 'Week 38', '2027-27', '2027-04-26 00:00:00+00', '2027-05-03 23:59:59+00')
ON CONFLICT (week_number) DO NOTHING;

-- 4. Helper: compute week_number for a given timestamp
-- Weeks start Tuesday 00:00. Season week 1 starts 2026-08-11T00:00 (Tuesday)
CREATE OR REPLACE FUNCTION get_week_number(season_start DATE, kickoff_ts TIMESTAMPTZ)
RETURNS INTEGER AS $$
  SELECT GREATEST(1, 1 + ((kickoff_ts::date - season_start::date) / 7))::INTEGER;
$$ LANGUAGE SQL IMMUTABLE;

-- 5. Weekly leaderboard view (overall = sum of all scored predictions)
CREATE OR REPLACE VIEW weekly_leaderboard AS
SELECT
    p.id as user_id,
    p.username,
    COALESCE(SUM(pr.points_awarded), 0) as total_points,
    COUNT(pr.id) FILTER (WHERE pr.is_exact_score = true) as exact_scores,
    COUNT(pr.id) FILTER (WHERE pr.is_correct_result = true AND pr.is_exact_score = false) as correct_results,
    COUNT(pr.id) as total_predictions
FROM profiles p
LEFT JOIN predictions pr ON p.id = pr.user_id AND pr.scored_at IS NOT NULL
GROUP BY p.id, p.username
ORDER BY total_points DESC, exact_scores DESC;

-- 6. Indexes for week-based queries
CREATE INDEX IF NOT EXISTS idx_matches_week ON matches(week_number);
CREATE INDEX IF NOT EXISTS idx_predictions_week ON predictions(match_id);

-- 7. Function to get the current week number based on now()
CREATE OR REPLACE FUNCTION get_current_week_number(season_start DATE DEFAULT '2026-08-11')
RETURNS INTEGER AS $$
  SELECT GREATEST(1, 1 + ((CURRENT_DATE - season_start::date) / 7))::INTEGER;
$$ LANGUAGE SQL STABLE;
