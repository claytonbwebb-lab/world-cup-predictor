// Fix week numbers for imported Nations League fixtures to match app's season start (2026-07-14)
import { createClient } from '@supabase/supabase-js';

// Must load env from the project
import dotenv from 'dotenv';
dotenv.config({ path: new URL('../.env', import.meta.url) });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env. NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function getAppWeekNumber(kickoffDate) {
  const SEASON_START = new Date('2026-07-14T00:00:00Z');
  const kickoff = new Date(kickoffDate);
  const diffMs = kickoff.getTime() - SEASON_START.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, 1 + Math.floor(diffDays / 7));
}

async function main() {
  const { data, error } = await supabase
    .from('matches')
    .select('id, home_team, away_team, kickoff_at, week_number')
    .ilike('group_stage', 'UEFA Nations League%')
    .gte('kickoff_at', '2026-09-29T00:00:00Z')
    .lt('kickoff_at', '2026-10-06T00:00:00Z');

  if (error) {
    console.error('Query error:', error);
    process.exit(1);
  }

  console.log(`Found ${data.length} fixtures to update`);

  for (const m of data) {
    const correctWeek = getAppWeekNumber(m.kickoff_at);
    if (m.week_number !== correctWeek) {
      const { error: updErr } = await supabase
        .from('matches')
        .update({ week_number: correctWeek })
        .eq('id', m.id);

      if (updErr) {
        console.error(`  ERROR ${m.home_team} vs ${m.away_team}:`, updErr.message);
      } else {
        console.log(`  UPDATED ${m.home_team} vs ${m.away_team}: week ${m.week_number} → ${correctWeek}`);
      }
    } else {
      console.log(`  OK ${m.home_team} vs ${m.away_team}: week ${correctWeek}`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
