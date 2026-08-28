import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://suyrbsuuckcvhdvxcvsf.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eXJic3V1Y2tjdmhkdnhjdnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1MzgwNSwiZXhwIjoyMDkwNTI5ODA1fQ.L-ex1VZWkNd7f_-T6D1D0RiYmLR0HdoRA2QsYmB4NLc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const michelleId = 'a5ec4198-a573-4b9d-b198-fc5eb4cbef32';

  const { data, error } = await supabase
    .from('predictions')
    .select(`
      match_id,
      home_prediction,
      away_prediction,
      points_awarded,
      is_exact_score,
      is_correct_result,
      scored_at,
      matches!inner(home_team, away_team, home_score, away_score, week_number)
    `)
    .eq('user_id', michelleId)
    .not('scored_at', 'is', null)
    .order('scored_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Check if double_up_picks table exists and fetch for context
  const { data: dups } = await supabase
    .from('double_up_picks')
    .select('match_id')
    .eq('user_id', michelleId);
  const dupMatchIds = new Set((dups || []).map(d => d.match_id));

  console.log('=== Michelle\'s scored predictions ===\n');
  let total = 0;
  for (const row of data || []) {
    const m = row.matches;
    const isDbl = dupMatchIds.has(row.match_id);
    console.log(`${m.home_team} ${m.home_score}–${m.away_score} ${m.away_team} (Week ${m.week_number})`);
    console.log(`  Prediction: ${row.home_prediction}–${row.away_prediction}`);
    console.log(`  Points: ${row.points_awarded}${isDbl ? ' (Double Up)' : ''}`);
    console.log(`  exact=${row.is_exact_score} correct=${row.is_correct_result}`);
    console.log(`  Scored at: ${row.scored_at}`);
    total += row.points_awarded || 0;
    console.log();
  }
  console.log(`=== Total points from scored predictions: ${total} ===`);

  // Also check unscored predictions in case a score was reset
  const { data: unscored } = await supabase
    .from('predictions')
    .select('match_id, home_prediction, away_prediction, points_awarded, scored_at, matches!inner(home_team, away_team, home_score, away_score, week_number, result_entered)')
    .eq('user_id', michelleId)
    .is('scored_at', null);

  console.log(`\nUnscored predictions: ${(unscored || []).length}`);
  for (const row of unscored || []) {
    const m = row.matches;
    console.log(`  ${m.home_team} vs ${m.away_team} (Week ${m.week_number}) result_entered=${m.result_entered}`);
  }
}

main().catch(console.error);
