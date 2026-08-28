import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://suyrbsuuckcvhdvxcvsf.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eXJic3V1Y2tjdmhkdnhjdnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1MzgwNSwiZXhwIjoyMDkwNTI5ODA1fQ.L-ex1VZWkNd7f_-T6D1D0RiYmLR0HdoRA2QsYmB4NLc';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const weekNum = 1;

async function oldLogic() {
  const { data: allUsers } = await supabase.from('profiles').select('id, username').not('id', 'eq', '00000000-0000-0000-0000-000000000000');
  const { data: weekMatches } = await supabase.from('matches').select('id').eq('week_number', weekNum).eq('result_entered', true);
  const matchIds = (weekMatches || []).map(m => m.id);

  const results = [];
  for (const profile of allUsers || []) {
    const { data: scored } = await supabase.from('predictions').select('points_awarded, is_exact_score, is_correct_result').eq('user_id', profile.id).in('match_id', matchIds).not('scored_at', 'is', null);
    const pts = (scored || []).reduce((s, p) => s + (p.points_awarded || 0), 0);
    const exact = (scored || []).filter(p => p.is_exact_score).length;
    const correct = (scored || []).filter(p => p.is_correct_result && !p.is_exact_score).length;
    const total = (scored || []).length;
    results.push({ user_id: profile.id, username: profile.username, pts, exact, correct, total });
  }
  return results;
}

async function newLogic() {
  const { data: allUsers } = await supabase.from('profiles').select('id, username').not('id', 'eq', '00000000-0000-0000-0000-000000000000');
  const { data: weekMatches } = await supabase.from('matches').select('id').eq('week_number', weekNum).eq('result_entered', true);
  const matchIds = (weekMatches || []).map(m => m.id);

  const { data: allPredictions } = await supabase.from('predictions').select('user_id, points_awarded, is_exact_score, is_correct_result').in('match_id', matchIds).not('scored_at', 'is', null);

  const statsByUser = new Map();
  for (const p of allPredictions || []) {
    const s = statsByUser.get(p.user_id) || { pts: 0, exact: 0, correct: 0, total: 0 };
    s.pts += p.points_awarded || 0;
    if (p.is_exact_score) s.exact++;
    else if (p.is_correct_result) s.correct++;
    s.total++;
    statsByUser.set(p.user_id, s);
  }

  return (allUsers || []).map(profile => {
    const s = statsByUser.get(profile.id);
    return { user_id: profile.id, username: profile.username, pts: s?.pts || 0, exact: s?.exact || 0, correct: s?.correct || 0, total: s?.total || 0 };
  });
}

async function main() {
  console.log('Comparing week', weekNum, '...');
  const [old, neu] = await Promise.all([oldLogic(), newLogic()]);

  const oldMap = new Map(old.map(x => [x.user_id, x]));
  const newMap = new Map(neu.map(x => [x.user_id, x]));

  let diffs = 0;
  for (const [uid, o] of oldMap) {
    const n = newMap.get(uid);
    if (!n) { console.log('MISSING in new:', uid, o.username, o); diffs++; continue; }
    if (o.pts !== n.pts || o.exact !== n.exact || o.correct !== n.correct || o.total !== n.total) {
      console.log('DIFF for', o.username, '(', uid, '):');
      console.log('  OLD:', { pts: o.pts, exact: o.exact, correct: o.correct, total: o.total });
      console.log('  NEW:', { pts: n.pts, exact: n.exact, correct: n.correct, total: n.total });
      diffs++;
    }
  }
  for (const [uid, n] of newMap) {
    if (!oldMap.has(uid)) { console.log('MISSING in old:', uid, n.username, n); diffs++; }
  }
  if (diffs === 0) console.log('No differences found');

  const mOld = old.find(x => x.username?.toLowerCase().includes('michelle'));
  const mNew = neu.find(x => x.username?.toLowerCase().includes('michelle'));
  if (mOld || mNew) {
    console.log('\n--- Michelle ---\nOLD:', mOld, '\nNEW:', mNew);
  }
}
main().catch(console.error);
