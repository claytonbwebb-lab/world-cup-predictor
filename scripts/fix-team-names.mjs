import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://suyrbsuuckcvhdvxcvsf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1eXJic3V1Y2tjdmhkdnhjdnNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk1MzgwNSwiZXhwIjoyMDkwNTI5ODA1fQ.L-ex1VZWkNd7f_-T6D1D0RiYmLR0HdoRA2QsYmB4NLc'
);

const renames = [
  { from: 'West Ham', to: 'West Ham United' },
  { from: 'Norwich', to: 'Norwich City' },
  { from: 'Sheffield Utd', to: 'Sheffield United' },
  { from: 'Wolves', to: 'Wolverhampton Wanderers' },
];

async function main() {
  const { data, error } = await supabase
    .from('matches')
    .select('id,home_team,away_team,kickoff_at')
    .gte('kickoff_at', '2026-09-15T00:00:00Z')
    .lte('kickoff_at', '2026-09-23T23:59:59Z')
    .order('kickoff_at');

  if (error) { console.error(error); process.exit(1); }

  for (const row of data || []) {
    let newHome = row.home_team;
    let newAway = row.away_team;
    let changed = false;
    for (const r of renames) {
      if (newHome === r.from) { newHome = r.to; changed = true; }
      if (newAway === r.from) { newAway = r.to; changed = true; }
    }
    if (changed) {
      const { error: updErr } = await supabase.from('matches').update({ home_team: newHome, away_team: newAway }).eq('id', row.id);
      console.log(updErr ? 'ERR' : 'OK', row.id.slice(0,8), row.home_team, 'vs', row.away_team, '->', newHome, 'vs', newAway);
    } else {
      console.log('SKIP', row.id.slice(0,8), row.home_team, 'vs', row.away_team);
    }
  }
}

main();
