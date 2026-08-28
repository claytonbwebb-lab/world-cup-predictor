import { createClient } from '@supabase/supabase-js';

const svcKey = 'eyJhbG…4NLc';
const supabase = createClient('https://suyrbsuuckcvhdvxcvsf.supabase.co', svcKey);

async function main() {
  // Week 6 matches
  const { data: matches } = await supabase
    .from('matches')
    .select('id, home_team, away_team')
    .eq('week_number', 6)
    .eq('result_entered', true);

  console.log('Week 6 matches:', (matches || []).length);
  const matchIds = (matches || []).map(m => m.id);

  // All users
  const { data: users } = await supabase
    .from('profiles')
    .select('id, username, email')
    .not('id', 'eq', '00000000-0000-0000-0000-000000000000');

  console.log('Users:', (users || []).length);

  // Score each user one by one (safe, correct)
  const scores = [];
  for (const u of users || []) {
    const { data: preds } = await supabase
      .from('predictions')
      .select('points_awarded, is_exact_score, is_correct_result')
      .eq('user_id', u.id)
      .in('match_id', matchIds)
      .not('scored_at', 'is', null);

    const pts = (preds || []).reduce((s, p) => s + (p.points_awarded || 0), 0);
    const exact = (preds || []).filter(p => p.is_exact_score).length;
    const correct = (preds || []).filter(p => p.is_correct_result && !p.is_exact_score).length;
    scores.push({ user_id: u.id, username: u.username, email: u.email, pts, exact, correct, total: (preds || []).length });
  }

  scores.sort((a, b) => b.pts - a.pts || b.exact - a.exact || b.correct - a.correct);

  console.log('\n=== Top 20 Week 6 ===');
  scores.slice(0, 20).forEach((s, i) => {
    console.log(`${i + 1}. ${s.username}: ${s.pts} pts (exact=${s.exact}, correct=${s.correct}) ${s.email || ''}`);
  });

  // Michelle check
  const michelle = scores.find(s => s.username?.toLowerCase() === 'michelle');
  if (michelle) {
    const tied = scores.filter(s => s.pts === michelle.pts && s.user_id !== michelle.user_id);
    console.log(`\nMichelle: ${michelle.pts} pts`);
    console.log('Tied with:', tied.map(t => `${t.username} (${t.email})`).join(', '));
  }
}
main().catch(console.error);
