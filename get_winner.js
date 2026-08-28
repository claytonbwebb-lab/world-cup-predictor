const { createClient } = require('@supabase/supabase-js');
const svcKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eXJic3V1Y2tjdmhkdnhjdnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1MzgwNSwiZXhwIjoyMDkwNTI5ODA1fQ.L-ex1VZWkNd7f_-T6D1D0RiYmLR0HdoRA2QsYmB4NLc';
const supabase = createClient('https://suyrbsuuckcvhdvxcvsf.supabase.co', svcKey);

async function main() {
  // Get week 6 match IDs
  const { data: matches, error: mErr } = await supabase
    .from('matches').select('id, home_team, away_team')
    .eq('week_number', 6).eq('result_entered', true);
  if (mErr) { console.error('Match error:', mErr); return; }

  console.log('Week 6 matches:', matches.length);
  const matchIds = matches.map(m => m.id);

  // Get all users
  const { data: users, error: uErr } = await supabase
    .from('profiles').select('id, username, email')
    .not('id', 'eq', '00000000-0000-0000-0000-000000000000');
  if (uErr) { console.error('Users error:', uErr); return; }

  console.log('Users:', users.length);

  // Score each user
  const scores = [];
  for (const u of users) {
    const { data: preds } = await supabase
      .from('predictions')
      .select('points_awarded, is_exact_score, is_correct_result')
      .eq('user_id', u.id)
      .in('match_id', matchIds)
      .not('scored_at', 'is', null);
    const pts = (preds || []).reduce((s, p) => s + (p.points_awarded || 0), 0);
    const exact = (preds || []).filter(p => p.is_exact_score).length;
    const correct = (preds || []).filter(p => p.is_correct_result && !p.is_exact_score).length;
    scores.push({ id: u.id, name: u.username, email: u.email, pts, exact, correct, total: (preds || []).length });
  }

  scores.sort((a, b) => b.pts - a.pts || b.exact - a.exact || b.correct - a.correct);
  console.log('\nTop 10 Week 6:');
  scores.slice(0, 10).forEach((s, i) => console.log(`${i+1}. ${s.name}: ${s.pts}pts (exact=${s.exact} correct=${s.correct}) ${s.email || '(no email)'}`));

  const michelle = scores.find(s => s.name?.toLowerCase() === 'michelle');
  if (michelle) {
    const tied = scores.filter(s => s.pts === michelle.pts && s.id !== michelle.id);
    console.log(`\nMichelle: ${michelle.pts}pts`);
    console.log('Tied with:');
    tied.forEach(t => console.log(`  - ${t.name}: ${t.email || '(no email)'}`));
  }
}
main().catch(console.error);
