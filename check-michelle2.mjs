import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://suyrbsuuckcvhdvxcvsf.supabase.co';
const SERVICE_KEY = 'eyJhbG…4NLc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const michelleId = 'a5ec4198-a573-4b9d-b198-fc5eb4cbef32';

  // ALL predictions (including unscored)
  console.log('=== ALL predictions (scored + unscored) ===');
  const { data: allPreds } = await supabase
    .from('predictions')
    .select('match_id, home_prediction, away_prediction, points_awarded, is_exact_score, is_correct_result, scored_at, double_up_used')
    .eq('user_id', michelleId)
    .order('created_at', { ascending: false });

  for (const p of allPreds || []) {
    const { data: match } = await supabase
      .from('matches')
      .select('home_team, away_team, home_score, away_score, week_number, result_entered, status_short')
      .eq('id', p.match_id)
      .single();
    console.log(`${match?.home_team} vs ${match?.away_team} | W${match?.week_number} | result=${match?.result_entered} | pred=${p.home_prediction}-${p.away_prediction} | actual=${match?.home_score}-${match?.away_score} | pts=${p.points_awarded ?? 'null'} | scored=${p.scored_at ? 'yes' : 'no'}`);
  }

  // Total scored points
  const scored = (allPreds || []).filter(p => p.scored_at);
  const totalPts = scored.reduce((s, p) => s + (p.points_awarded || 0), 0);
  console.log(`\nScored predictions: ${scored.length} / ${allPreds?.length || 0} | Total points: ${totalPts}`);

  // Log of recent scoring changes (look at scored_at timestamps in last 48h)
  console.log('\n=== Recent scoring activity (predictions scored in last 48h) ===');
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from('predictions')
    .select('user_id, match_id, points_awarded, scored_at, updated_at')
    .gte('scored_at', cutoff)
    .order('scored_at', { ascending: false })
    .limit(20);
  for (const r of recent || []) {
    const { data: mu } = await supabase.from('profiles').select('username').eq('id', r.user_id).single();
    console.log(`${mu?.username || r.user_id} | match=${r.match_id} | pts=${r.points_awarded} | scored_at=${r.scored_at}`);
  }
}
main().catch(console.error);
