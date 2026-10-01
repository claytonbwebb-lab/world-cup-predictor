

// App's SEASON_START = 2026-07-14
function getAppWeekNumber(kickoffDate) {
  const SEASON_START = new Date('2026-07-14T00:00:00Z');
  const kickoff = new Date(kickoffDate);
  const diffMs = kickoff.getTime() - SEASON_START.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, 1 + Math.floor(diffDays / 7));
}

async function main() {
  // Fetch imported Nations League fixtures
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
        console.error(`  ERROR updating ${m.home_team} vs ${m.away_team}:`, updErr.message);
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
