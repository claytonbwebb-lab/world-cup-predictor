// Standalone script to import UEFA Nations League fixtures for PPW Week 6 (22-28 Sep 2026)
// Sets is_visible=false so they don't go live until Steve reviews and pushes them.
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const API_KEY = '8d4907138164564a2ef220d06327d9af';
const HOST = 'v3.football.api-sports.io';
const LEAGUE_ID = 5; // UEFA Nations League

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function normaliseTeamName(name) {
  if (!name) return '';
  return name
    .replace(/\s+\(?U-?\d+岁?\)?$/, '') // remove age suffixes
    .replace(/U-?\d+/, '')               // remove U-21 etc
    .replace(/\s+/g, ' ')
    .trim();
}

// team-name canonicalisation (same as lib/teams.ts)
const TEAM_ALIASES = {
  'bosnia & herzegovina': 'Bosnia & Herzegovina',
  'bosnia-herzegovina': 'Bosnia & Herzegovina',
  'bosnia': 'Bosnia & Herzegovina',
  'rep. of ireland': 'Republic of Ireland',
  'republic of ireland': 'Republic of Ireland',
  'nir': 'Northern Ireland',
  'republic of ireland': 'Republic of Ireland',
  'czech rep.': 'Czechia',
  'czech rep': 'Czechia',
  'czech': 'Czechia',
  'czechia': 'Czechia',
  'trkiye': 'Türkiye',
  'turkey': 'Türkiye',
  'türkiye': 'Türkiye',
  'faroe islands': 'Faroe Islands',
  'fyr macedonia': 'FYR Macedonia',
  'north macedonia': 'FYR Macedonia',
  'macedonia': 'FYR Macedonia',
  'ukraine': 'Ukraine',
  'wales': 'Wales',
  'scotland': 'Scotland',
  'england': 'England',
  'spain': 'Spain',
  'germany': 'Germany',
  'france': 'France',
  'italy': 'Italy',
  'belgium': 'Belgium',
  'netherlands': 'Netherlands',
  'portugal': 'Portugal',
  'denmark': 'Denmark',
  'norway': 'Norway',
  'sweden': 'Sweden',
  'poland': 'Poland',
  'croatia': 'Croatia',
  'serbia': 'Serbia',
  'greece': 'Greece',
  'austria': 'Austria',
  'israel': 'Israel',
  'liechtenstein': 'Liechtenstein',
  'lithuania': 'Lithuania',
  'andorra': 'Andorra',
  'malta': 'Malta',
  'kosovo': 'Kosovo',
  'hungary': 'Hungary',
  'montenegro': 'Montenegro',
  'cyprus': 'Cyprus',
  'iceland': 'Iceland',
  'estonia': 'Estonia',
  'bulgaria': 'Bulgaria',
  'luxembourg': 'Luxembourg',
  'san marino': 'San Marino',
  'finland': 'Finland',
  'slovakia': 'Slovakia',
  'moldova': 'Moldova',
  'albania': 'Albania',
  'belarus': 'Belarus',
  'slovenia': 'Slovenia',
  'switzerland': 'Switzerland',
  'georgia': 'Georgia',
  'latvia': 'Latvia',
  'gibraltar': 'Gibraltar',
  'azerbaijan': 'Azerbaijan',
};

function canonicalTeamName(name) {
  if (!name) return '';
  const normalised = name.trim().toLowerCase();
  return TEAM_ALIASES[normalised] || name.trim();
}

function getWeekNumber(kickoffDate) {
  // PPW season starts 2026-08-11 (Tuesday) — Week 1
  const SEASON_START = new Date('2026-08-11T00:00:00Z');
  const kickoff = new Date(kickoffDate);
  const diffMs = kickoff.getTime() - SEASON_START.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diffWeeks + 1);
}

function extractMatchKey(home, away, kickoff) {
  const date = kickoff.slice(0, 10);
  return `${home.trim().toLowerCase()}|${away.trim().toLowerCase()}|${date}`;
}

async function fetchFixtures() {
  console.log(`Fetching UEFA Nations League fixtures (22-28 Sep 2026)...`);
  const url = `https://${HOST}/fixtures?league=${LEAGUE_ID}&season=2026&from=2026-09-22&to=2026-09-28`;
  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(`API-Football errors: ${JSON.stringify(data.errors)}`);
  }
  return data.response || [];
}

async function getExistingMatchKeys(fixtures) {
  const keys = fixtures.map(f => extractMatchKey(
    canonicalTeamName(f.teams.home.name),
    canonicalTeamName(f.teams.away.name),
    f.fixture.date
  ));
  const existing = new Set();
  for (const key of keys) {
    const [home, away, date] = key.split('|');
    const { data } = await supabase
      .from('matches')
      .select('id')
      .eq('home_team', home)
      .eq('away_team', away)
      .gte('kickoff_at', `${date}T00:00:00Z`)
      .lt('kickoff_at', `${date}T23:59:59Z`)
      .limit(1);
    if (data && data.length > 0) existing.add(key);
  }
  return existing;
}

async function insertFixtures(fixtures, existingKeys) {
  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (const f of fixtures) {
    const homeRaw = f.teams.home.name;
    const awayRaw = f.teams.away.name;
    const home = canonicalTeamName(homeRaw);
    const away = canonicalTeamName(awayRaw);
    const kickoffUTC = f.fixture.date;
    const key = extractMatchKey(home, away, kickoffUTC);

    if (existingKeys.has(key)) {
      console.log(`  SKIP (exists): ${home} vs ${away}`);
      skipped++;
      continue;
    }

    const kickoffAt = new Date(kickoffUTC).toISOString();
    const weekNumber = getWeekNumber(kickoffAt);

    // Detect league stage from fixture date
    // Match days: Sep 22-23 = MD1, Sep 24-25 = MD2, Sep 26-27 = MD3, Sep 28 = MD4
    const kickoffDay = new Date(kickoffUTC).getUTCDate();
    let groupStage = 'UEFA Nations League';
    if (kickoffDay === 23 || kickoffDay === 24) groupStage = 'UEFA Nations League - Matchday 1';
    else if (kickoffDay === 25 || kickoffDay === 26) groupStage = 'UEFA Nations League - Matchday 2';
    else if (kickoffDay === 27 || kickoffDay === 28) groupStage = 'UEFA Nations League - Matchday 3';

    const { error } = await supabase.from('matches').insert({
      home_team: home,
      away_team: away,
      home_flag: f.teams.home.logo || null,
      away_flag: f.teams.away.logo || null,
      group_stage: groupStage,
      kickoff_at: kickoffAt,
      week_number: weekNumber,
      is_visible: false,
      is_locked: false,
      result_entered: false,
    });

    if (error) {
      console.error(`  ERROR: ${home} vs ${away}: ${error.message}`);
      errors.push(`${home} vs ${away}: ${error.message}`);
    } else {
      console.log(`  INSERT: ${home} vs ${away} | ${kickoffAt} | Week ${weekNumber}`);
      imported++;
    }
  }

  return { imported, skipped, errors };
}

async function main() {
  const fixtures = await fetchFixtures();
  console.log(`API returned ${fixtures.length} fixtures`);

  const existingKeys = await getExistingMatchKeys(fixtures);
  console.log(`${existingKeys.size} already in database`);

  const { imported, skipped, errors } = await insertFixtures(fixtures, existingKeys);

  console.log(`\n=== Summary ===`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped:  ${skipped}`);
  if (errors.length > 0) {
    console.log(`Errors:   ${errors.length}`);
    errors.forEach(e => console.log(`  - ${e}`));
  }

  // List what was imported
  if (imported > 0) {
    console.log(`\n=== Imported fixtures (hidden - not visible to users) ===`);
    const { data } = await supabase
      .from('matches')
      .select('home_team, away_team, kickoff_at, week_number, group_stage, is_visible')
      .eq('group_stage', 'like', 'UEFA Nations League%')
      .gte('kickoff_at', '2026-09-22T00:00:00Z')
      .lt('kickoff_at', '2026-09-29T00:00:00Z')
      .order('kickoff_at');
    if (data) {
      data.forEach(m => {
        const kickoff = new Date(m.kickoff_at).toISOString().replace('T', ' ').slice(0, 16) + 'Z';
        console.log(`  ${m.home_team} vs ${m.away_team} | ${kickoff} | Week ${m.week_number} | visible=${m.is_visible}`);
      });
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
