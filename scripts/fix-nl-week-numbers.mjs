import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: fixtures, error: fetchError } = await supabase
    .from('matches')
    .select('id, home_team, away_team, kickoff_at, week_number')
    .ilike('group_stage', '%Nations League%')
    .gte('kickoff_at', '2026-10-06T00:00:00Z')
    .lt('kickoff_at', '2026-10-13T00:00:00Z')
    .order('kickoff_at');

  if (fetchError) { console.error('Fetch error:', fetchError.message); return; }

  console.log('Found', fixtures?.length || 0, 'fixtures to fix');

  for (const f of fixtures || []) {
    const { error } = await supabase.from('matches').update({ week_number: 13 }).eq('id', f.id);
    if (error) console.error('ERROR', f.home_team, 'vs', f.away_team, ':', error.message);
    else console.log('FIXED:', f.home_team, 'vs', f.away_team, '|', f.kickoff_at.slice(0, 10), '| W' + f.week_number + ' -> W13');
  }

  console.log('\nDone — check /admin, they should appear alongside the Prem fixtures now.');
}

main().catch(e => { console.error(e); process.exit(1); });
