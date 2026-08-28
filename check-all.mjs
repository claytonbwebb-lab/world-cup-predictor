import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://suyrbsuuckcvhdvxcvsf.supabase.co';
const SERVICE_KEY = 'eyJhbG…4NLc';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  // Check total scored predictions
  const { data: scored, count } = await supabase
    .from('predictions')
    .select('*', { count: 'exact' })
    .not('scored_at', 'is', null);
  console.log(`Total scored predictions: ${count || 0}`);

  // Check if there are ANY predictions at all
  const { data: all, count: allCount } = await supabase
    .from('predictions')
    .select('*', { count: 'exact' });
  console.log(`Total predictions (all): ${allCount || 0}`);

  // Points by most recent scoring
  const { data: byPoints } = await supabase
    .from('predictions')
    .select('user_id, points_awarded')
    .not('scored_at', 'is', null)
    .order('scored_at', { ascending: false })
    .limit(5);
  console.log('\nMost recently scored predictions:', byPoints);

  // Matches with results entered
  const { count: mc } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .eq('result_entered', true);
  console.log(`Matches with result_entered=true: ${mc || 0}`);

  // Find michelle in profiles
  const { data: mp } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', '%michelle%');
  console.log('\nMichelle profiles:', mp);
}
main().catch(console.error);
