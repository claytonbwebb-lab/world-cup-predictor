/**
 * Reset + Seed Script for PPW Premier League Staging
 *
 * Run: node scripts/reset-and-seed.js
 *
 * Wipes all matches, predictions, double_up_picks and test user data,
 * then seeds a realistic 4-week simulation where:
 *   - Weeks 1-3  (Jul 14 – Aug 3)  = completed & scored
 *   - Week 4     (Aug 4 – 10)     = current week, matches scheduled, NOT locked
 *   - Week 5+    (Aug 11+)        = future, blank
 *
 * Season start is set to Jul 14 to match the seed data.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://hcqdgbmzizunjxynhaoz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcWRnYm16aXp1bmp4eW5oYW96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDgxOTEyOCwiZXhwIjoyMTAwMzk1MTI4fQ.RMEuFc7JoXEIFDhAhhhKpk-zYVU50l-MpMvHWUu-JRk';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Season start: Jul 14 2026 (backdated to make the simulation feel realistic)
const SEASON_START = new Date('2026-07-14T00:00:00Z');

function computeWeekNumber(date) {
  const diffMs = date.getTime() - SEASON_START.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, 1 + Math.floor(diffDays / 7));
}

function dateAt(dateStr, hour = 12, min = 0) {
  const d = new Date(dateStr);
  d.setUTCHours(hour, min, 0, 0);
  return d.toISOString();
}

// All 20 PL teams
const TEAMS = [
  'Arsenal', 'Aston Villa', 'AFC Bournemouth', 'Brentford', 'Brighton',
  'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town',
  'Leicester City', 'Liverpool', 'Manchester City', 'Manchester United',
  'Newcastle United', 'Nottingham Forest', 'Southampton', 'Tottenham Hotspur',
  'West Ham United', 'Wolverhampton',
];

// Club badge URLs (served from /public/badges in Next.js)
const BADGES = {
  'Manchester United':   '/badges/manchester_united.png',
  'Manchester City':     '/badges/manchester_city.png',
  'Liverpool':           '/badges/liverpool.png',
  'Arsenal':             '/badges/arsenal.png',
  'Chelsea':             '/badges/chelsea.png',
  'Tottenham Hotspur':   '/badges/tottenham_hotspur.png',
  'Wolverhampton':       '/badges/wolverhampton.png',
  'Fulham':              '/badges/fulham.png',
  'Brighton':            '/badges/brighton.png',
  'Aston Villa':         '/badges/aston_villa.png',
  'Everton':             '/badges/everton.png',
  'AFC Bournemouth':     '/badges/bournemouth.png',
  'Newcastle United':    '/badges/newcastle_united.png',
  'Southampton':         '/badges/southampton.png',
  'Nottingham Forest':   '/badges/nottingham_forest.png',
  'Crystal Palace':      '/badges/crystal_palace.png',
  'West Ham United':     '/badges/west_ham_united.png',
  'Leicester City':      '/badges/leicester_city.png',
  'Ipswich Town':        '/badges/ipswich_town.png',
  'Brentford':           '/badges/brentford.png',
};

const FLAG = ''; // not used — badge URLs are set per-team below

// Get badge URL for a team (returns England flag as fallback for unknown teams)
function badge(team) {
  return BADGES[team] || '';
}

// Test user IDs (deterministic UUIDs for consistency)
const TEST_USERS = [
  { id: '11111111-1111-1111-1111-111111111111', username: 'FootyTipster_Dave' },
  { id: '22222222-2222-2222-2222-222222222222', username: 'PremierPicks_Emma' },
  { id: '33333333-3333-3333-3333-333333333333', username: 'GoalGuru_Alex' },
  { id: '44444444-4444-4444-4444-444444444444', username: 'ScoreMaster_Sam' },
  { id: '55555555-5555-5555-5555-555555555555', username: 'PredictorPro_Ian' },
];

// Week definitions
// completed = result_entered + scored predictions
// current   = match scheduled, not locked, predictions open
// future    = match scheduled, not locked, no predictions yet
const WEEKS = [
  {
    label: 'Week 1',
    weekNumber: 1,
    status: 'completed',
    matches: [
      { home: 'Manchester United',   away: 'Fulham',             kickoff: '2026-07-14', h: 20, m: 0, homeScore: 2, awayScore: 1 },
      { home: 'Arsenal',             away: 'Wolverhampton',       kickoff: '2026-07-14', h: 17, m: 30, homeScore: 3, awayScore: 0 },
      { home: 'Liverpool',           away: 'Ipswich Town',        kickoff: '2026-07-15', h: 19, m: 45, homeScore: 3, awayScore: 1 },
      { home: 'Manchester City',     away: 'Chelsea',             kickoff: '2026-07-15', h: 17, m: 30, homeScore: 1, awayScore: 1 },
      { home: 'Tottenham Hotspur',   away: 'Brentford',           kickoff: '2026-07-16', h: 19, m: 45, homeScore: 2, awayScore: 2 },
      { home: 'Brighton',            away: 'Aston Villa',         kickoff: '2026-07-16', h: 17, m: 30, homeScore: 0, awayScore: 1 },
      { home: 'Everton',             away: 'AFC Bournemouth',     kickoff: '2026-07-17', h: 19, m: 45, homeScore: 2, awayScore: 1 },
      { home: 'Newcastle United',    away: 'Southampton',         kickoff: '2026-07-17', h: 17, m: 30, homeScore: 4, awayScore: 0 },
      { home: 'Nottingham Forest',   away: 'Crystal Palace',      kickoff: '2026-07-18', h: 15, m: 0,  homeScore: 1, awayScore: 1 },
      { home: 'West Ham United',     away: 'Leicester City',      kickoff: '2026-07-18', h: 17, m: 30, homeScore: 2, awayScore: 0 },
    ],
  },
  {
    label: 'Week 2',
    weekNumber: 2,
    status: 'completed',
    matches: [
      { home: 'Chelsea',             away: 'Manchester United',   kickoff: '2026-07-21', h: 19, m: 45, homeScore: 1, awayScore: 2 },
      { home: 'Ipswich Town',        away: 'Tottenham Hotspur',   kickoff: '2026-07-21', h: 17, m: 30, homeScore: 0, awayScore: 3 },
      { home: 'Fulham',              away: 'Liverpool',           kickoff: '2026-07-22', h: 19, m: 45, homeScore: 1, awayScore: 2 },
      { home: 'Wolverhampton',       away: 'Manchester City',     kickoff: '2026-07-22', h: 17, m: 30, homeScore: 0, awayScore: 4 },
      { home: 'Aston Villa',         away: 'Arsenal',             kickoff: '2026-07-23', h: 19, m: 45, homeScore: 1, awayScore: 2 },
      { home: 'Brentford',           away: 'Everton',             kickoff: '2026-07-23', h: 17, m: 30, homeScore: 2, awayScore: 1 },
      { home: 'Crystal Palace',      away: 'Brighton',            kickoff: '2026-07-24', h: 19, m: 45, homeScore: 1, awayScore: 1 },
      { home: 'Southampton',         away: 'West Ham United',     kickoff: '2026-07-24', h: 17, m: 30, homeScore: 0, awayScore: 2 },
      { home: 'AFC Bournemouth',     away: 'Nottingham Forest',   kickoff: '2026-07-25', h: 15, m: 0,  homeScore: 2, awayScore: 1 },
      { home: 'Leicester City',      away: 'Newcastle United',    kickoff: '2026-07-25', h: 17, m: 30, homeScore: 1, awayScore: 3 },
    ],
  },
  {
    label: 'Week 3',
    weekNumber: 3,
    status: 'completed',
    matches: [
      { home: 'Manchester United',   away: 'Manchester City',     kickoff: '2026-07-28', h: 19, m: 45, homeScore: 1, awayScore: 1 },
      { home: 'Arsenal',             away: 'Liverpool',           kickoff: '2026-07-28', h: 17, m: 30, homeScore: 2, awayScore: 1 },
      { home: 'Tottenham Hotspur',   away: 'Chelsea',             kickoff: '2026-07-29', h: 19, m: 45, homeScore: 3, awayScore: 0 },
      { home: 'Liverpool',           away: 'Brentford',           kickoff: '2026-07-29', h: 17, m: 30, homeScore: 3, awayScore: 1 },
      { home: 'Manchester City',     away: 'Ipswich Town',        kickoff: '2026-07-30', h: 19, m: 45, homeScore: 5, awayScore: 0 },
      { home: 'Brighton',            away: 'AFC Bournemouth',     kickoff: '2026-07-30', h: 17, m: 30, homeScore: 2, awayScore: 2 },
      { home: 'Aston Villa',         away: 'Leicester City',      kickoff: '2026-07-31', h: 19, m: 45, homeScore: 2, awayScore: 0 },
      { home: 'Everton',             away: 'Wolverhampton',       kickoff: '2026-07-31', h: 17, m: 30, homeScore: 1, awayScore: 1 },
      { home: 'Nottingham Forest',   away: 'Southampton',         kickoff: '2026-08-01', h: 15, m: 0,  homeScore: 3, awayScore: 0 },
      { home: 'West Ham United',     away: 'Crystal Palace',      kickoff: '2026-08-01', h: 17, m: 30, homeScore: 1, awayScore: 2 },
    ],
  },
  {
    label: 'Week 4',
    weekNumber: 4,
    status: 'current',  // current week — matches scheduled, NOT locked
    matches: [
      { home: 'Manchester United',   away: 'Fulham',             kickoff: '2026-08-05', h: 20, m: 0, homeScore: null, awayScore: null }, // TODAY
      { home: 'Arsenal',             away: 'Wolverhampton',       kickoff: '2026-08-05', h: 17, m: 30, homeScore: null, awayScore: null }, // TODAY
      { home: 'Chelsea',             away: 'Manchester City',     kickoff: '2026-08-06', h: 19, m: 45, homeScore: null, awayScore: null },
      { home: 'Liverpool',           away: 'AFC Bournemouth',     kickoff: '2026-08-06', h: 17, m: 30, homeScore: null, awayScore: null },
      { home: 'Tottenham Hotspur',   away: 'Brentford',           kickoff: '2026-08-07', h: 19, m: 45, homeScore: null, awayScore: null },
      { home: 'Brighton',            away: 'Ipswich Town',        kickoff: '2026-08-07', h: 17, m: 30, homeScore: null, awayScore: null },
      { home: 'Nottingham Forest',   away: 'Southampton',         kickoff: '2026-08-08', h: 15, m: 0,  homeScore: null, awayScore: null },
      { home: 'West Ham United',     away: 'Leicester City',      kickoff: '2026-08-08', h: 17, m: 30, homeScore: null, awayScore: null },
      { home: 'Aston Villa',         away: 'Newcastle United',    kickoff: '2026-08-09', h: 15, m: 0,  homeScore: null, awayScore: null },
      { home: 'Crystal Palace',      away: 'Everton',             kickoff: '2026-08-09', h: 17, m: 30, homeScore: null, awayScore: null },
    ],
  },
  {
    label: 'Week 5',
    weekNumber: 5,
    status: 'future',
    matches: [
      { home: 'Manchester United',   away: 'Arsenal',             kickoff: '2026-08-11', h: 19, m: 45, homeScore: null, awayScore: null },
      { home: 'Manchester City',     away: 'Chelsea',             kickoff: '2026-08-11', h: 17, m: 30, homeScore: null, awayScore: null },
      { home: 'Liverpool',           away: 'Tottenham Hotspur',   kickoff: '2026-08-12', h: 19, m: 45, homeScore: null, awayScore: null },
      { home: 'Fulham',              away: 'Brighton',            kickoff: '2026-08-12', h: 17, m: 30, homeScore: null, awayScore: null },
      { home: 'Wolverhampton',       away: 'Nottingham Forest',   kickoff: '2026-08-13', h: 19, m: 45, homeScore: null, awayScore: null },
      { home: 'AFC Bournemouth',     away: 'Aston Villa',         kickoff: '2026-08-13', h: 17, m: 30, homeScore: null, awayScore: null },
      { home: 'Brentford',           away: 'Crystal Palace',      kickoff: '2026-08-14', h: 19, m: 45, homeScore: null, awayScore: null },
      { home: 'Southampton',         away: 'West Ham United',     kickoff: '2026-08-14', h: 17, m: 30, homeScore: null, awayScore: null },
      { home: 'Leicester City',      away: 'Everton',             kickoff: '2026-08-15', h: 15, m: 0,  homeScore: null, awayScore: null },
      { home: 'Ipswich Town',        away: 'Newcastle United',    kickoff: '2026-08-15', h: 17, m: 30, homeScore: null, awayScore: null },
    ],
  },
];

// Score a prediction against a result
function scorePrediction(homePred, awayPred, homeScore, awayScore) {
  const isExact = homePred === homeScore && awayPred === awayScore;
  const actualResult = homeScore > awayScore ? 'home' : homeScore < awayScore ? 'away' : 'draw';
  const predResult = homePred > awayPred ? 'home' : homePred < awayPred ? 'away' : 'draw';
  const isCorrectResult = !isExact && actualResult === predResult;
  let points = 0;
  if (isExact) points = 3;
  else if (isCorrectResult) points = 1;
  return { points, isExact, isCorrectResult };
}

// Deterministic pseudo-random based on seed
function seededRand(seed) {
  let x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

async function run() {
  console.log('⏳ Starting reset and seed...\n');

  // Step 1: Wipe all data
  console.log('1. Wiping data...');
  await supabase.from('double_up_picks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('predictions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('profiles').delete().in('id', TEST_USERS.map(u => u.id));
  console.log('   ✓ Matches, predictions, double_up_picks wiped\n');

  // Step 2: Insert test user profiles
  console.log('2. Creating test user profiles...');
  for (const user of TEST_USERS) {
    await supabase.from('profiles').upsert({ id: user.id, username: user.username });
  }
  console.log('   ✓ 5 test user profiles created\n');

  // Step 3: Insert weeks and matches
  console.log('3. Inserting matches...');
  const allMatchIds = {}; // weekNumber -> matchId[]

  for (const week of WEEKS) {
    allMatchIds[week.weekNumber] = [];
    for (const m of week.matches) {
      const kickoffAt = dateAt(m.kickoff, m.h, m.m);
      const { data, error } = await supabase.from('matches').insert({
        home_team: m.home,
        away_team: m.away,
        home_flag: badge(m.home),
        away_flag: badge(m.away),
        group_stage: week.label,
        kickoff_at: kickoffAt,
        home_score: m.homeScore,
        away_score: m.awayScore,
        is_locked: true,  // all past matches are locked
        result_entered: week.status === 'completed',
        week_number: week.weekNumber,
      }).select('id').single();

      if (error) {
        console.error(`   ✗ Error inserting ${m.home} v ${m.away}:`, error.message);
      } else {
        allMatchIds[week.weekNumber].push(data.id);
        if (week.status !== 'completed') {
          // Update to unlocked for current/future weeks
          await supabase.from('matches').update({ is_locked: false, result_entered: false })
            .eq('id', data.id);
        }
      }
    }
    console.log(`   ✓ ${week.label} (${week.status}): ${week.matches.length} matches`);
  }
  console.log('');

  // Step 4: Generate predictions for completed weeks
  console.log('4. Generating predictions for completed weeks...');
  let totalPreds = 0;

  for (const week of WEEKS.filter(w => w.status === 'completed')) {
    for (const m of week.matches) {
      const kickoffAt = dateAt(m.kickoff, m.h, m.m);
      const { data: matchData } = await supabase
        .from('matches')
        .select('id, home_score, away_score')
        .eq('kickoff_at', kickoffAt)
        .eq('home_team', m.home)
        .single();

      if (!matchData) { console.log(`   ! Match not found: ${m.home} v ${m.away}`); continue; }

      const matchId = matchData.id;
      const homeScore = matchData.home_score;
      const awayScore = matchData.away_score;

      // Each test user makes a prediction (with some randomness)
      for (let u = 0; u < TEST_USERS.length; u++) {
        const user = TEST_USERS[u];
        // Generate a plausible prediction using seeded randomness
        const seed = u * 1000 + week.weekNumber * 100 + week.matches.indexOf(m) * 10;
        const homePred = Math.max(0, Math.min(5, Math.round(homeScore + (seededRand(seed) - 0.5) * 3)));
        const awayPred = Math.max(0, Math.min(5, Math.round(awayScore + (seededRand(seed + 1) - 0.5) * 3)));
        const { points, isExact, isCorrectResult } = scorePrediction(homePred, awayPred, homeScore, awayScore);

        await supabase.from('predictions').insert({
          user_id: user.id,
          match_id: matchId,
          home_prediction: homePred,
          away_prediction: awayPred,
          points_awarded: points,
          is_exact_score: isExact,
          is_correct_result: isCorrectResult,
          scored_at: points > 0 ? new Date().toISOString() : null,
        });
        totalPreds++;
      }
    }
    console.log(`   ✓ ${week.label}: ${week.matches.length * TEST_USERS.length} predictions`);
  }
  console.log(`   Total: ${totalPreds} predictions seeded\n`);

  // Step 5: Predictions for current week (unscored, before results)
  console.log('5. Generating predictions for current week (Week 4 — unscored)...');
  const currentWeek = WEEKS.find(w => w.status === 'current');
  for (const m of currentWeek.matches) {
    const kickoffAt = dateAt(m.kickoff, m.h, m.m);
    const { data: matchData } = await supabase
      .from('matches')
      .select('id')
      .eq('kickoff_at', kickoffAt)
      .eq('home_team', m.home)
      .single();

    if (!matchData) continue;

    for (let u = 0; u < TEST_USERS.length; u++) {
      const user = TEST_USERS[u];
      const seed = u * 1000 + currentWeek.weekNumber * 100 + currentWeek.matches.indexOf(m) * 10;
      // Plausible predictions around realistic scorelines
      const homePred = Math.max(0, Math.min(4, Math.round(1.5 + seededRand(seed) * 2)));
      const awayPred = Math.max(0, Math.min(4, Math.round(1.0 + seededRand(seed + 1) * 2)));

      await supabase.from('predictions').insert({
        user_id: user.id,
        match_id: matchData.id,
        home_prediction: homePred,
        away_prediction: awayPred,
        points_awarded: 0,
        is_exact_score: false,
        is_correct_result: false,
        scored_at: null,
      });
    }
  }
  console.log(`   ✓ Week 4: ${currentWeek.matches.length * TEST_USERS.length} predictions (unscored)\n`);

  // Step 6: Give each test user a Double Up pick for completed weeks
  console.log('6. Setting Double Up picks for completed weeks...');
  for (const week of WEEKS.filter(w => w.status === 'completed')) {
    for (let u = 0; u < TEST_USERS.length; u++) {
      const user = TEST_USERS[u];
      // Pick the match at index matching user (deterministic)
      const matchIdx = u % week.matches.length;
      const m = week.matches[matchIdx];
      const kickoffAt = dateAt(m.kickoff, m.h, m.m);
      const { data: matchData } = await supabase
        .from('matches')
        .select('id')
        .eq('kickoff_at', kickoffAt)
        .eq('home_team', m.home)
        .single();

      if (!matchData) continue;

      await supabase.from('double_up_picks').upsert({
        user_id: user.id,
        match_id: matchData.id,
        week_number: week.weekNumber,
      }, { onConflict: 'user_id,week_number' });
    }
    console.log(`   ✓ ${week.label}: Double Up picks set for ${TEST_USERS.length} users`);
  }

  // Current week — user might have a pick too (let them set it in UI)
  console.log('\n✅ Reset and seed complete!\n');
  console.log('Summary:');
  console.log('  Weeks 1-3: COMPLETED — results, predictions, scored');
  console.log('  Week 4:   CURRENT   — Aug 5-10, matches scheduled, predictions open, not locked');
  console.log('  Week 5+:  FUTURE    — Aug 11+, blank');
  console.log('\nTest users:');
  for (const u of TEST_USERS) console.log(`  ${u.username} (${u.id})`);
}

run().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});