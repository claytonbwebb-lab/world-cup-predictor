-- Migration: Seed test data for weekly competitions
-- Run after 010_add_weekly_competitions.sql

-- Create stub profiles for fake test users (no auth — for display/testing only)
INSERT INTO profiles (id, username) VALUES
  ('11111111-1111-1111-1111-111111111111', 'FootyTipster_Dave'),
  ('22222222-2222-2222-2222-222222222222', 'PremierPicks_Emma'),
  ('33333333-3333-3333-3333-333333333333', 'GoalGuru_Alex'),
  ('44444444-4444-4444-4444-444444444444', 'ScoreMaster_Sam'),
  ('55555555-5555-5555-5555-555555555555', 'PredictorPro_Ian')
ON CONFLICT (id) DO NOTHING;

-- Week 1 matches (Aug 11-17 2026) — all completed with real-ish PL scores
INSERT INTO matches (home_team, away_team, home_flag, away_flag, group_stage, kickoff_at, home_score, away_score, is_locked, result_entered, week_number) VALUES
  ('Manchester United',   'Fulham',             '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 1', '2026-08-11 20:00:00+00', 2, 1, true, true, 1),
  ('Ipswich Town',        'Liverpool',           '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 1', '2026-08-12 19:45:00+00', 0, 2, true, true, 1),
  ('Arsenal',             'Wolverhampton',        '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 1', '2026-08-12 17:30:00+00', 1, 0, true, true, 1),
  ('Everton',             'Brighton',            '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 1', '2026-08-12 15:00:00+00', 2, 2, true, true, 1),
  ('Newcastle United',    'Southampton',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 1', '2026-08-13 19:45:00+00', 3, 1, true, true, 1),
  ('Nottingham Forest',   'AFC Bournemouth',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 1', '2026-08-13 17:30:00+00', 1, 0, true, true, 1),
  ('Chelsea',             'Manchester City',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 1', '2026-08-13 16:00:00+00', 0, 1, true, true, 1),
  ('Aston Villa',         'West Ham United',      '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 1', '2026-08-14 20:00:00+00', 3, 1, true, true, 1),
  ('Brentford',           'Crystal Palace',      '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 1', '2026-08-14 19:45:00+00', 1, 2, true, true, 1),
  ('Leicester City',      'Tottenham Hotspur',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 1', '2026-08-15 17:30:00+00', 1, 3, true, true, 1);

-- Week 2 matches (Aug 17-24 2026) — all completed
INSERT INTO matches (home_team, away_team, home_flag, away_flag, group_stage, kickoff_at, home_score, away_score, is_locked, result_entered, week_number) VALUES
  ('Fulham',              'Ipswich Town',        '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 2', '2026-08-17 20:00:00+00', 1, 1, true, true, 2),
  ('Liverpool',            'Arsenal',             '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 2', '2026-08-18 19:45:00+00', 2, 0, true, true, 2),
  ('Wolverhampton',       'Chelsea',             '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 2', '2026-08-18 17:30:00+00', 0, 2, true, true, 2),
  ('Manchester City',      'Ipswich Town',        '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 2', '2026-08-19 19:45:00+00', 4, 1, true, true, 2),
  ('Southampton',          'Brentford',           '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 2', '2026-08-19 17:30:00+00', 1, 0, true, true, 2),
  ('AFC Bournemouth',      'Newcastle United',    '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 2', '2026-08-20 19:45:00+00', 2, 3, true, true, 2),
  ('Crystal Palace',       'Nottingham Forest',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 2', '2026-08-20 17:30:00+00', 1, 1, true, true, 2),
  ('Tottenham Hotspur',   'Manchester United',    '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 2', '2026-08-21 20:00:00+00', 3, 2, true, true, 2),
  ('West Ham United',     'Aston Villa',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 2', '2026-08-21 19:45:00+00', 2, 2, true, true, 2),
  ('Brighton',            'Leicester City',       '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 2', '2026-08-22 17:30:00+00', 3, 0, true, true, 2);

-- Week 3 matches (Aug 24-31 2026) — all completed
INSERT INTO matches (home_team, away_team, home_flag, away_flag, group_stage, kickoff_at, home_score, away_score, is_locked, result_entered, week_number) VALUES
  ('Manchester United',   'Liverpool',           '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 3', '2026-08-25 19:45:00+00', 1, 1, true, true, 3),
  ('Arsenal',             'Manchester City',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 3', '2026-08-25 17:30:00+00', 2, 2, true, true, 3),
  ('Ipswich Town',        'Brighton',            '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 3', '2026-08-25 15:00:00+00', 1, 2, true, true, 3),
  ('Chelsea',             'Crystal Palace',      '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 3', '2026-08-26 19:45:00+00', 3, 0, true, true, 3),
  ('Newcastle United',    'Tottenham Hotspur',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 3', '2026-08-26 17:30:00+00', 2, 1, true, true, 3),
  ('Leicester City',      'Aston Villa',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 3', '2026-08-27 19:45:00+00', 0, 1, true, true, 3),
  ('West Ham United',     'Manchester City',      '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 3', '2026-08-27 17:30:00+00', 1, 2, true, true, 3),
  ('Brentford',           'Southampton',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 3', '2026-08-28 19:45:00+00', 2, 0, true, true, 3),
  ('Nottingham Forest',   'Wolverhampton',       '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 3', '2026-08-28 17:30:00+00', 1, 0, true, true, 3),
  ('AFC Bournemouth',     'Everton',             '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 3', '2026-08-29 15:00:00+00', 1, 1, true, true, 3);

-- Week 4 matches (Aug 31 - Sep 7 2026) — all completed
INSERT INTO matches (home_team, away_team, home_flag, away_flag, group_stage, kickoff_at, home_score, away_score, is_locked, result_entered, week_number) VALUES
  ('Manchester City',      'Arsenal',             '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 4', '2026-09-01 19:45:00+00', 2, 1, true, true, 4),
  ('Liverpool',            'Nottingham Forest',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 4', '2026-09-01 17:30:00+00', 3, 0, true, true, 4),
  ('Tottenham Hotspur',   'Brentford',           '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 4', '2026-09-01 15:00:00+00', 2, 2, true, true, 4),
  ('Crystal Palace',       'Manchester United',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 4', '2026-09-02 19:45:00+00', 0, 1, true, true, 4),
  ('Aston Villa',          'AFC Bournemouth',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 4', '2026-09-02 17:30:00+00', 2, 0, true, true, 4),
  ('Everton',             'Wolverhampton',        '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 4', '2026-09-03 19:45:00+00', 1, 1, true, true, 4),
  ('Fulham',              'Ipswich Town',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 4', '2026-09-03 17:30:00+00', 2, 0, true, true, 4),
  ('Southampton',          'Manchester United',    '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 4', '2026-09-04 19:45:00+00', 1, 2, true, true, 4),
  ('Brighton',            'Chelsea',              '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 4', '2026-09-04 17:30:00+00', 0, 2, true, true, 4),
  ('Wolverhampton',       'Newcastle United',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 4', '2026-09-05 17:30:00+00', 1, 3, true, true, 4);

-- Week 5 matches (Sep 8-14 2026) — completed
INSERT INTO matches (home_team, away_team, home_flag, away_flag, group_stage, kickoff_at, home_score, away_score, is_locked, result_entered, week_number) VALUES
  ('Manchester United',   'Arsenal',             '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 5', '2026-09-08 19:45:00+00', 1, 1, true, true, 5),
  ('Manchester City',     'Brentford',           '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 5', '2026-09-08 17:30:00+00', 3, 0, true, true, 5),
  ('Liverpool',           'Fulham',              '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 5', '2026-09-09 19:45:00+00', 2, 0, true, true, 5),
  ('Chelsea',             'West Ham United',      '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 5', '2026-09-09 17:30:00+00', 2, 1, true, true, 5),
  ('Tottenham Hotspur',   'Aston Villa',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 5', '2026-09-10 19:45:00+00', 2, 2, true, true, 5),
  ('Newcastle United',    'Manchester City',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 5', '2026-09-10 17:30:00+00', 1, 2, true, true, 5),
  ('Brighton',            'Ipswich Town',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 5', '2026-09-11 19:45:00+00', 2, 0, true, true, 5),
  ('Leicester City',      'AFC Bournemouth',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 5', '2026-09-11 17:30:00+00', 1, 0, true, true, 5),
  ('Crystal Palace',      'Southampton',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 5', '2026-09-12 17:30:00+00', 0, 0, true, true, 5),
  ('Everton',             'Leicester City',       '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 5', '2026-09-12 15:00:00+00', 1, 1, true, true, 5);

-- Week 6 matches (Sep 15-21 2026) — upcoming/future, unlocked
INSERT INTO matches (home_team, away_team, home_flag, away_flag, group_stage, kickoff_at, home_score, away_score, is_locked, result_entered, week_number) VALUES
  ('Arsenal',             'Tottenham Hotspur',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 6', '2026-09-15 19:45:00+00', NULL, NULL, false, false, 6),
  ('Manchester United',   'Brighton',            '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 6', '2026-09-15 17:30:00+00', NULL, NULL, false, false, 6),
  ('Fulham',              'Manchester City',     '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 6', '2026-09-16 19:45:00+00', NULL, NULL, false, false, 6),
  ('Brentford',           'Liverpool',            '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 6', '2026-09-16 17:30:00+00', NULL, NULL, false, false, 6),
  ('AFC Bournemouth',     'Chelsea',              '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 6', '2026-09-17 19:45:00+00', NULL, NULL, false, false, 6),
  ('Wolverhampton',       'Crystal Palace',      '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 6', '2026-09-17 17:30:00+00', NULL, NULL, false, false, 6),
  ('Southampton',         'Everton',              '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 6', '2026-09-18 19:45:00+00', NULL, NULL, false, false, 6),
  ('Aston Villa',         'Wolverhampton',        '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 6', '2026-09-18 17:30:00+00', NULL, NULL, false, false, 6),
  ('Nottingham Forest',   'Manchester United',   '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 6', '2026-09-19 15:00:00+00', NULL, NULL, false, false, 6),
  ('Ipswich Town',        'Aston Villa',         '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Week 6', '2026-09-19 17:30:00+00', NULL, NULL, false, false, 6);
