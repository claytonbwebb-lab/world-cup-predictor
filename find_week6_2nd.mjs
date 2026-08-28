import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://suyrbsuuckcvhdvxcvsf.supabase.co';
const SERVICE_KEY = 'eyJhbG…4NLc';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  const weekNum = 6;

  // Get all users
  const { data: allUsers } = await supabase
    .from('profiles')
    .select('id, username')
    .not('id', 'eq', '00000000-0000-0000-0000-000000000000');

  // Get week 6 matches
  const { data: weekMatches } = await supabase
    .from('matches')
    .select('id')
    .eq('week_number', weekNum)
    .eq('result_entered', true);

  const matchIds = (weekMatches || []).map(m => m.id);

  // Score each user (old reliable method)
  const results = [];
  for (const profile of allUsers || []) {
    const { data: scored } = await supabase
      .from('predictions')
      .select('points_awarded, is_exact_score, is_correct_result')
      .eq('user_id', profile.id)
      .in('match_id', matchIds)
      .not('scored_at', 'is', null);

    const pts = (scored || []).reduce((s, p) => s + (p.points_awarded || 0), 0);
    const exact = (scored || []).filter(p => p.is_exact_score).length;
    const correct = (scored || []).filter(p => p.is_correct_result && !p.is_exact_score).length;
    const total = (scored || []).length;
    results.push({ user_id: profile.id, username: profile.username, pts, exact, correct, total });
  }

  results.sort((a, b) => b.pts - a.pts || b.exact - a.exact || b.correct - a.correct || a.user_id.localeCompare(b.user_id));

  console.log('=== Week 6 Leaderboard ===\n');
  results.slice(0, 20).forEach((r, i) => {
    console.log(`${i + 1}. ${r.username}: ${r.pts} pts (exact=${r.exact}, correct=${r.correct})`);
  });

  // Find ties
  console.log('\n=== Ties check ===');
  const michelle = results.find(r => r.username?.toLowerCase() === 'michelle');
  if (michelle) {
    const tied = results.filter(r => r.pts === michelle.pts && r.user_id !== michelle.user_id);
    console.log(`Michelle has ${michelle.pts} pts`);
    console.log(`Tied with: ${tied.map(t => t.username).join(', ')}`);
    for (const t of tied) {
      const { data: user } = await supabase.from('profiles').select('email').eq('id', t.user_id).single();
      console.log(`  ${t.username} email: ${user?.email || 'not found'}`);
    }
  }
}
main().catch(console.error);
