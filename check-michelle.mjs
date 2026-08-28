import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://suyrbsuuckcvhdvxcvsf.supabase.co';
const SERVICE_KEY = 'eyJhbG…4NLc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const michelleId = 'a5ec4198-a573-4b9d-b198-fc5eb4cbef32';

  console.log('=== Michelle\'s scored predictions ===');
  const { data: preds } = await supabase
    .from('predictions')
    .select('match_id, home_prediction, away_prediction, points_awarded, is_exact_score, is_correct_result, scored_at, double_up_used')
    .eq('user_id', michelleId)
    .not('scored_at', 'is', null)
    .order('scored_at', { ascending: false });

  for (const p of preds || []) {
    const { data: match } = await supabase
      .from('matches')
      .select('home_team, away_team, home_score, away_score, week_number')
      .eq('id', p.match_id)
      .single();
    console.log(`\nMatch: ${match?.home_team} ${match?.home_score}–${match?.away_score} ${match?.away_team} (Week ${match?.week_number})`);
    console.log(`  Prediction: ${p.home_prediction}–${p.away_prediction}`);
    console.log(`  Points: ${p.points_awarded} ${p.double_up_used ? '(Double Up)' : ''} | exact=${p.is_exact_score} correct=${p.is_correct_result}`);
    console.log(`  Scored at: ${p.scored_at}`);
  }

  const totalPts = (preds || []).reduce((s, p) => s + (p.points_awarded || 0), 0);
  console.log(`\n=== Total points: ${totalPts} ===`);
}

main().catch(console.error);
