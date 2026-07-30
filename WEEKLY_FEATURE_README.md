# Weekly Competitions Feature — Implementation Summary

## What was built

### Database Migration (`010_add_weekly_competitions.sql`)
- Adds `week_number INTEGER` column to `matches` table (1–38, one per Premier League gameweek)
- Creates `weeks` table with 38 pre-seeded entries for 2026/27 season
- Adds `get_week_number(season_start, kickoff_ts)` SQL helper function
- Adds `get_current_week_number(season_start)` SQL function
- Creates `weekly_leaderboard` view
- Adds indexes on `week_number` for fast queries

### Test Data Migration (`011_seed_test_data_weekly.sql`)
- Creates 5 stub test user profiles (no auth — for display in leaderboards only):
  - `FootyTipster_Dave`, `PremierPicks_Emma`, `GoalGuru_Alex`, `ScoreMaster_Sam`, `PredictorPro_Ian`
- Seeds **6 weeks** of Premier League matches:
  - Weeks 1–5: 50 completed matches with scores (Aug 11 – Sep 14 2026)
  - Week 6: 10 upcoming matches (no scores yet, unlocked)
- All 20 PL teams represented

### Predictions Seeder (`scripts/seed-predictions.js`)
- Creates realistic predictions for each test user across all completed matches
- Uses a deterministic formula based on user index + week number
- Scores predictions using the actual match scores
- Run with: `SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-predictions.js`

---

## How to apply the database migrations

### Option 1: Supabase SQL Editor (recommended)
1. Go to: https://supabase.com/dashboard → Your Project → SQL Editor
2. Open `supabase/migrations/010_add_weekly_competitions.sql` — copy-paste all contents → Run
3. Open `supabase/migrations/011_seed_test_data_weekly.sql` — copy-paste all contents → Run
4. Run the predictions seeder:
   ```bash
   cd /home/ubuntu/world-cup-predictor
   SUPABASE_SERVICE_ROLE_KEY=<your-key> node scripts/seed-predictions.js
   ```

### Option 2: Via supabase CLI (if project is linked)
```bash
cd /home/ubuntu/world-cup-predictor
supabase db push
```

---

## Frontend changes

### `/fixtures` — Week-aware fixtures
- **Default view**: shows current week's matches (auto-detected from date)
- **Week selector**: dropdown to filter by specific week (1 → current week)
- **"All Fixtures"** option to see all weeks at once
- Week badge shown on each match card
- Week range displayed (e.g. "Aug 11 – Aug 17")

### `/leaderboard` — Weekly + Seasonal toggle
- **Two tabs**: Weekly 🗓️ / Season 🏆
- **Week selector** (when Weekly is active): pick which week to view
- User rank card shows position for the selected scope
- Previous weeks are accessible via the week dropdown

### `/leagues/[id]` — League leaderboard weekly + seasonal toggle
- Same pattern as global leaderboard
- Toggle between weekly and full-season view
- Week selector for historical weeks

### Admin match editor — week_number field
- Edit and add week_number when creating/editing matches
- Week number shown in admin match table

---

## Week numbering logic

- Season 2026/27 starts **Tuesday 2026-08-11 00:00 UTC**
- Week N: starts at `season_start + (N-1)*7 days` (Tuesday 00:00)
- Week number is computed automatically in the frontend using:
  ```typescript
  const SEASON_START = new Date('2026-08-11T00:00:00Z');
  function getWeekNumber(date: Date = new Date()): number {
    const diffDays = Math.floor((date.getTime() - SEASON_START.getTime()) / 86400000);
    return Math.max(1, 1 + Math.floor(diffDays / 7));
  }
  ```

---

## To test

1. Apply the two SQL migrations above
2. Run `node scripts/seed-predictions.js` with your service role key
3. Visit https://playpredictwin-premier-league-stagi.vercel.app
4. Log in and check:
   - `/fixtures` — should show current week matches (likely Week 5 or 6 based on date)
   - `/leaderboard` — toggle between Weekly and Season tabs
   - `/leagues` — create a league, then check the leaderboard weekly/seasonal toggle
5. Check the 5 test users appear in the leaderboards with varying scores