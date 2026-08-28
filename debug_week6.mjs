import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://suyrbsuuckcvhdvxcvsf.supabase.co';
const SERVICE_KEY = 'eyJhbG…4NLc';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  // Check what week numbers exist with result_entered=true
  const { data: weeks } = await supabase
    .from('matches')
    .select('week_number')
    .eq('result_entered', true)
    .not('week_number', 'is', null)
    .order('week_number');

  const uniqueWeeks = [...new Set((weeks || []).map(w => w.week_number))].sort((a,b) => a-b);
  console.log('Weeks with results:', uniqueWeeks);

  // Check match count per week
  for (const w of uniqueWeeks) {
    const { count } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('week_number', w)
      .eq('result_entered', true);
    console.log(`Week ${w}: ${count} matches`);
  }

  // Check Michelles scored predictions - what's their week_number?
  const { data: mp } = await supabase
    .from('predictions')
    .select('match_id')
    .eq('user_id', 'a5ec4198-a573-4b9d-b198-fc5eb4cbef32')
    .not('scored_at', 'is', null);

  for (const row of mp || []) {
    const { data: match } = await supabase
      .from('matches')
      .select('home_team, away_team, week_number, result_entered')
      .eq('id', row.match_id)
      .single();
    console.log(`Match: ${match?.home_team} vs ${match?.away_team} | week=${match?.week_number} | result_entered=${match?.result_entered}`);
  }
}
main().catch(console.error);
