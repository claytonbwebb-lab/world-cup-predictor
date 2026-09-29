// Pull UEFA Nations League fixtures for Oct 6-12 and insert with is_visible=false
import { createClient } from '@supabase/supabase-js';

const API_KEY = '8d4907138164564a2ef220d06327d9af';
const HOST = 'v3.football.api-sports.io';
const LEAGUE_ID = 5;

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
    .replace(/\s+\(?U-?\d+岁?\)?$/, '')
    .replace(/U-?\d+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const TEAM_ALIASES = {
  'bosnia & herzegovina': 'Bosnia & Herzegovina',
  'bosnia-herzegovina': 'Bosnia & Herzegovina',
  'bosnia': 'Bosnia & Herzegovina',
  'rep. of ireland': 'Republic of Ireland',
  'czech rep.': 'Czech Republic',
  'czech rep': 'Czech Republic',
  'czech': 'Czech Republic',
  'czechia': 'Czech Republic',
  'trkiye': 'Türkiye',
  'turkey': 'Türkiye',
  'türkiye': 'Türkiye',
  'faroe islands': 'Faroe Islands',
  'fyr macedonia': 'North Macedonia',
  'north macedonia': 'North Macedonia',
  'macedonia': 'North Macedonia',
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
  'kazakhstan': 'Kazakhstan',
  'armenia': 'Armenia',
  'romania': 'Romania',
  'northern ireland': 'Northern Ireland',
};

function canonicalTeamName(name) {
  if (!name) return '';
  const normalised = name.trim().toLowerCase();
  return TEAM_ALIASES[normalised] || name.trim();
}

function getWeekNumber(kickoffDate) {
  const SEASON_START = new Date('2026-07-14T00:00:00Z');
  const kickoff = new Date(kickoffDate);
  const diffMs = kickoff.getTime() - SEASON_START.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, diffWeeks + 1);
}

async function fetchFixtures() {
  const url = `https://${HOST}/fixtures?league=${LEAGUE_ID}&season=2026&from=2026-10-06&to=2026-10-12`;
  const res = await fetch(url, { headers: { 'x-apisports-key': API_KEY } });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length) {
    throw new Error(`API-Football errors: ${JSON.stringify(data.errors)}`);
  }
  return data.response || [];
}

async function getExistingKeys(fixtures) {
  const keys = new Set();
  for (const f of fixtures) {
    const home = canonicalTeamName(f.teams.home.name);
    const away = canonicalTeamName(f.teams.away.name);
    const date = f.fixture.date.slice(0, 10);
    const { data } = await supabase
      .from('matches')
      .select('id')
      .eq('home_team', home)
      .eq('away_team', away)
      .gte('kickoff_at', `${date}T00:00:00Z`)
      .lt('kickoff_at', `${date}T23:59:59Z`)
      .limit(1);
    if (data && data.length) keys.add(`${home}|${away}|${date}`);
  }
  return keys;
}

async function main() {
  console.log('Fetching Nations League fixtures for 6-12 Oct 2026...');
  const fixtures = await fetchFixtures();
  console.log(`API returned ${fixtures.length} fixtures`);

  if (fixtures.length === 0) {
    console.log('No fixtures found — nothing to do');
    return;
  }

  const existingKeys = await getExistingKeys(fixtures);
  console.log(`${existingKeys.size} already in database`);

  let imported = 0;
  let skipped = 0;
  const errors = [];

  // Determine matchday based on dates
  // Oct 6-7 = Matchday 7, Oct 8-9 = Matchday 8, Oct 10-11 = Matchday 9, Oct 12 = Matchday 10
  function getMatchday(dateStr) {
    const day = new Date(dateStr).getUTCDate();
    const month = new Date(dateStr).getUTCMonth() + 1;
    if (month !== 10) return 'UEFA Nations League';
    if (day === 6 || day === 7) return 'UEFA Nations League - Matchday 7';
    if (day === 8 || day === 9) return 'UEFA Nations League - Matchday 8';
    if (day === 10 || day === 11) return 'UEFA Nations League - Matchday 9';
    if (day === 12) return 'UEFA Nations League - Matchday 10';
    return 'UEFA Nations League';
  }

  for (const f of fixtures) {
    const home = canonicalTeamName(f.teams.home.name);
    const away = canonicalTeamName(f.teams.away.name);
    const kickoffUTC = f.fixture.date;
    const date = kickoffUTC.slice(0, 10);
    const key = `${home}|${away}|${date}`;

    if (existingKeys.has(key)) {
      console.log(`  SKIP (exists): ${home} vs ${away}`);
      skipped++;
      continue;
    }

    const kickoffAt = new Date(kickoffUTC).toISOString();
    const weekNumber = getWeekNumber(kickoffAt);
    const matchday = getMatchday(kickoffUTC);

    const { error } = await supabase.from('matches').insert({
      home_team: home,
      away_team: away,
      home_flag: f.teams.home.logo || null,
      away_flag: f.teams.away.logo || null,
      group_stage: matchday,
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
      console.log(`  INSERT: ${home} vs ${away} | ${kickoffAt} | ${matchday}`);
      imported++;
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped:  ${skipped}`);
  if (errors.length) {
    console.log(`Errors:   ${errors.length}`);
    errors.forEach(e => console.log(`  - ${e}`));
  }

  if (imported > 0) {
    console.log(`\n=== Imported fixtures (hidden - in /admin only) ===`);
    const { data } = await supabase
      .from('matches')
      .select('home_team, away_team, kickoff_at, group_stage, is_visible')
      .ilike('group_stage', '%Nations League%')
      .gte('kickoff_at', '2026-10-06T00:00:00Z')
      .lt('kickoff_at', '2026-10-13T00:00:00Z')
      .order('kickoff_at');
    if (data) {
      data.forEach(m => {
        const ko = new Date(m.kickoff_at).toISOString().replace('T', ' ').slice(0, 16) + 'Z';
        console.log(`  ${m.home_team} vs ${m.away_team} | ${ko} | ${m.group_stage} | visible=${m.is_visible}`);
      });
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
