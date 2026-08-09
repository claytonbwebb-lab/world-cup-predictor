#!/usr/bin/env node
/**
 * Seed test predictions for fake weekly competition users.
 * Run AFTER 011_seed_test_data_weekly.sql
 * 
 * Usage: node scripts/seed-predictions.js
 * Requires SUPABASE_SERVICE_ROLE_KEY env var
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

// Fake test users
const TEST_USERS = [
  '11111111-1111-1111-1111-111111111111', // FootyTipster_Dave
  '22222222-2222-2222-2222-222222222222', // PremierPicks_Emma
  '33333333-3333-3333-3333-333333333333', // GoalGuru_Alex
  '44444444-4444-4444-4444-444444444444', // ScoreMaster_Sam
  '55555555-5555-5555-5555-555555555555', // PredictorPro_Ian
];

async function seed() {
  console.log('Fetching matches...');
  
  // Get all matches from weeks 1-5 (completed)
  const { data: matches, error: matchErr } = await supabase
    .from('matches')
    .select('id, home_score, away_score, week_number')
    .in('week_number', [1, 2, 3, 4, 5])
    .eq('result_entered', true);

  if (matchErr) {
    console.error('Error fetching matches:', matchErr);
    process.exit(1);
  }

  console.log(`Found ${matches.length} matches across weeks 1-5`);

  // Scoring helper — mirrors the server-side scoring logic
  function scorePrediction(predHome, predAway, actualHome, actualAway) {
    if (predHome === actualHome && predAway === actualAway) {
      return { points: 3, exact: true, correctResult: true };
    }
    let actualResult, predResult;
    if (actualHome > actualAway) actualResult = 'home';
    else if (actualHome === actualAway) actualResult = 'draw';
    else actualResult = 'away';
    if (predHome > predAway) predResult = 'home';
    else if (predHome === predAway) predResult = 'draw';
    else predResult = 'away';
    if (actualResult === predResult) {
      return { points: 1, exact: false, correctResult: true };
    }
    return { points: 0, exact: false, correctResult: false };
  }

  // Prediction generator — makes somewhat realistic predictions
  function makePrediction(match, userIndex) {
    const base = userIndex; // each user has a different bias
    const homeBias = [1, 0, 2, -1, 1][base % 5];
    const variation = userIndex * 3 + match.week_number;

    // Base prediction around the real score with some variance
    let home = Math.max(0, (match.home_score || 1) + (variation % 3) - 1 + homeBias);
    let away = Math.max(0, (match.away_score || 1) + ((variation + 1) % 3) - 1);

    // Round to integers 0-5
    home = Math.min(5, Math.max(0, Math.round(home)));
    away = Math.min(5, Math.max(0, Math.round(away)));

    return { home, away };
  }

  // Build predictions for all users and matches
  const predictions = [];

  for (const match of matches) {
    for (let i = 0; i < TEST_USERS.length; i++) {
      const userId = TEST_USERS[i];
      const { home, away } = makePrediction(match, i);
      const { points, exact, correctResult } = scorePrediction(
        home, away, match.home_score, match.away_score
      );

      predictions.push({
        user_id: userId,
        match_id: match.id,
        home_prediction: home,
        away_prediction: away,
        points_awarded: points,
        is_exact_score: exact,
        is_correct_result: correctResult,
        scored_at: points > 0 ? new Date().toISOString() : null,
      });
    }
  }

  console.log(`Inserting ${predictions.length} predictions...`);

  // Insert in batches
  const batchSize = 100;
  let inserted = 0;
  for (let i = 0; i < predictions.length; i += batchSize) {
    const batch = predictions.slice(i, i + batchSize);
    const { error } = await supabase.from('predictions').upsert(batch, {
      onConflict: 'user_id,match_id',
    });
    if (error) {
      console.error(`Error inserting batch ${i / batchSize}:`, error);
    } else {
      inserted += batch.length;
      console.log(`  Inserted ${inserted}/${predictions.length}`);
    }
  }

  console.log('\n✅ Seed complete!');
  console.log(`   ${matches.length} matches × ${TEST_USERS.length} users = ${predictions.length} predictions`);
  
  // Show a summary
  for (const userId of TEST_USERS) {
    const { data } = await supabase
      .from('weekly_leaderboard')
      .select('username, total_points, exact_scores, correct_results')
      .eq('user_id', userId)
      .single();
    if (data) {
      console.log(`   ${data.username}: ${data.total_points} pts (${data.exact_scores} exact, ${data.correct_results} correct)`);
    }
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
