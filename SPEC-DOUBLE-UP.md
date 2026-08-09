# Double Up — Feature Spec
**Status:** ✅ Built (2026-08-05)
**Staging branch:** `premier-league-staging`
**Last updated:** 2026-08-05

---

## What Is Double Up?

Once per week, after submitting their predictions, each user picks **one match** as their Double Up.  
If that match is predicted correctly, points for that match are doubled.

- **Correct result (1pt → 2pt)** + **Exact score (3pt → 6pt)**
- **Wrong prediction = 0pt** (no negative, no change from normal)
- **One Double Up per week** — resets every week
- **Editable** until the first match of that week kicks off

---

## Rules Summary

| Scenario | Normal points | Double Up points |
|---|---|---|
| Wrong outcome | 0 | 0 |
| Correct result, wrong score | 1 | 2 |
| Exact score | 3 | 6 |

---

## DB Schema

### New table: `double_up_picks`

```sql
CREATE TABLE double_up_picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)  -- one pick per user per week
);

CREATE INDEX idx_double_up_picks_user_week ON double_up_picks(user_id, week_number);
```

**Note:** No FK constraint on `user_id` referencing `profiles` to avoid circular deps — the predictions table uses the same pattern.

---

## Points Calculation (Existing Logic)

The existing `predictions` table stores each user's prediction. After results are entered, points are calculated (likely in a DB function or edge function). The Double Up multiplier needs to be applied **at calculation time**.

### Approach: Update the scoring edge function

In the edge function that calculates/awards points (e.g. `/api/calculate-points` or a Supabase DB function), add:

```sql
-- Pseudocode
SELECT
  p.*,
  d.match_id IS NOT NULL AS is_double_up
FROM predictions p
LEFT JOIN double_up_picks d ON d.user_id = p.user_id
  AND d.match_id = p.match_id
  AND d.week_number = m.week_number;

-- Then when awarding points:
final_points = base_points * CASE WHEN is_double_up THEN 2 ELSE 1 END;
```

The `week_number` join key is already available on matches (`m.week_number`).

---

## User Flow

### 1. Predictions page (`/fixtures` or `/predictions`)
- User submits predictions for the week (existing behaviour, unchanged)
- After submitting, a **"Pick your Double Up"** section appears showing the week's matches they've predicted
- User clicks a match to select it as Double Up — a toggle/visual indicator shows it's selected
- Clicking a different match before the deadline **swaps** the Double Up

### 2. Double Up lock-out
- Once the **first match of the week kicks off**, the Double Up selector becomes **locked** — no more changes
- UI shows "Double Up locked" state for that week

### 3. My Predictions / Results page
- The Double Up match is marked with a **⭐ Double Up** badge
- On results page, points show as "2pts (2x)" or "6pts (2x)" to make the multiplier visible

### 4. Leaderboard (weekly & seasonal)
- No change to leaderboard display — Double Up is a personal strategy choice, not a separate scoring mechanism
- (Optional/future: could show Double Up stats in profile)

---

## UI Components

### DoubleUpPicker component
**Location:** `src/components/DoubleUpPicker.tsx`

**Props:**
- `weekNumber: number`
- `matches: Match[]` — the week's matches (user must have predicted all of them to pick one)
- `currentPick: Match | null`
- `isLocked: boolean` — true once first match kicks off
- `onPick: (matchId: string) => void`

**States:**
- `idle` — no pick made yet, show "Select your Double Up" prompt
- `selected` — one match highlighted with Double Up badge
- `locked` — selection frozen, shows locked badge
- `not_submitted` — user hasn't submitted predictions yet, picker hidden or disabled

**Visual:**
- Match cards with a toggle button or star icon
- Selected state: gold/yellow highlight + ⭐ badge
- Locked state: greyed out, padlock icon, "Locked" label

---

## API Endpoints

### `POST /api/double-up`
**Auth required:** Yes

**Body:**
```json
{ "matchId": "uuid", "weekNumber": 3 }
```

**Behaviour:**
- Validates: match belongs to that week
- Validates: user has submitted a prediction for that match
- Validates: `isLocked == false` for that week
- Upserts into `double_up_picks` (allows re-pick to swap)
- Returns `200 { success: true, pick: Match }`

**Errors:**
- `400` — match not in user's predictions
- `403` — Double Up already locked for this week
- `401` — not authenticated

### `GET /api/double-up?weekNumber=3`
**Auth required:** Yes

**Returns:**
```json
{ "matchId": "uuid" | null, "isLocked": false }
```

### `GET /api/double-up/status`
**Auth required:** Yes

Returns lock status for all weeks (or current + next week) — so the UI knows which weeks are still editable.

---

## Edge Cases

1. **User submits predictions, then closes browser before picking Double Up** → they can pick any time before first kick-off
2. **User submits predictions, then waits until after first match to try picking** → `403` — too late, no Double Up for that week
3. **Match is postponed/cancelled** → treat as no prediction, Double Up should be refunded/swappable? → **Defer to Phase 2**
4. **Week with no predictions submitted** → Double Up picker hidden
5. **User joins mid-week** → Double Up available from their first prediction week onwards

---

## Phases

### Phase 1 (this build)
- DB table + API endpoints
- DoubleUpPicker component
- Points calculation updated
- Badge on predictions/results pages
- Lock-out after first kick-off

### Phase 2 (future)
- Postponed match handling
- Double Up stats on profile page
- Notification when Double Up match is about to kick off

---

## Files to Create/Modify

```
src/
├── app/api/double-up/route.ts          [NEW]
├── app/api/double-up/status/route.ts   [NEW]
├── components/
│   └── DoubleUpPicker.tsx              [NEW]
├── app/fixtures/page.tsx               [MOD - add picker]
├── app/results/page.tsx                [MOD - show badge]
└── lib/
    ├── doubleUp.ts                     [NEW - DB helpers]
    └── scoring.ts                      [MOD - apply 2x multiplier]
```

**DB migrations needed:**
- `014_double_up_picks.sql` — create table + indexes

---

## Test Scenarios

1. User predicts 5 matches, picks Double Up, gets result correct → awards 2pt
2. User predicts 5 matches, picks Double Up, gets exact score → awards 6pt
3. User swaps Double Up before deadline → second pick is stored, first discarded
4. User tries to pick after first match kicks off → 403 error
5. User tries to pick a match they haven't predicted → 400 error
6. User has no predictions for the week → picker hidden
7. Leaderboard: user with Double Up that was correct jumps ahead correctly