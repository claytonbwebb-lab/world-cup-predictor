// Admin-only route: import UEFA Nations League fixtures for a given date range
// Does NOT filter to PL teams — imports all Nations League teams
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getWeekNumber } from '@/lib/weeks';
import { canonicalTeamName } from '@/lib/teams';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY!;
const API_FOOTBALL_HOST = 'v3.football.api-sports.io';
const NATIONS_LEAGUE_ID = 5; // UEFA Nations League in API-Football

function extractMatchKey(home: string, away: string, kickoff: string): string {
  const date = kickoff.slice(0, 10);
  return `${canonicalTeamName(home).toLowerCase()}|${canonicalTeamName(away).toLowerCase()}|${date}`;
}

async function fetchNationsLeagueFixtures(from: string, to: string): Promise<any[]> {
  const url = `https://${API_FOOTBALL_HOST}/fixtures?league=${NATIONS_LEAGUE_ID}&season=2026&from=${from}&to=${to}`;
  const res = await fetch(url, {
    headers: { 'x-apisports-key': API_FOOTBALL_KEY },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    const msg = Object.values(data.errors).join('; ');
    throw new Error(`API-Football error: ${msg}`);
  }
  return data.response || [];
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { from = '2026-09-22', to = '2026-09-28' } = body;

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to dates required (YYYY-MM-DD)' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log(`[nations-league-import] Fetching fixtures ${from} → ${to}`);
    const fixtures = await fetchNationsLeagueFixtures(from, to);
    console.log(`[nations-league-import] API returned ${fixtures.length} fixtures`);

    if (fixtures.length === 0) {
      return NextResponse.json({ success: true, imported: 0, skipped: 0, fixtures: [] });
    }

    // Detect match day from date (UNL runs Thu/Fri/Sat/Sun in Sept)
    function getMatchDay(kickoffUTC: string): string {
      const day = new Date(kickoffUTC).getUTCDate();
      if (day === 22 || day === 23 || day === 24) return 'UEFA Nations League - Matchday 1';
      if (day === 25 || day === 26 || day === 27) return 'UEFA Nations League - Matchday 2';
      return 'UEFA Nations League - Matchday 3';
    }

    // Check for existing matches
    const keys = fixtures.map(f => extractMatchKey(
      f.teams.home.name, f.teams.away.name, f.fixture.date
    ));

    const existingKeys = new Set<string>();
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
      if (data && data.length > 0) existingKeys.add(key);
    }

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    const importedFixtures: any[] = [];

    for (const f of fixtures) {
      const home = canonicalTeamName(f.teams.home.name);
      const away = canonicalTeamName(f.teams.away.name);
      const kickoffUTC = f.fixture.date;
      const key = extractMatchKey(f.teams.home.name, f.teams.away.name, kickoffUTC);
      const kickoffAt = new Date(kickoffUTC).toISOString();
      const weekNumber = getWeekNumber(new Date(kickoffAt));
      const groupStage = getMatchDay(kickoffUTC);

      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }

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
        console.error(`[nations-league-import] Error for ${home} vs ${away}:`, error);
        errors.push(`${home} vs ${away}: ${error.message}`);
      } else {
        imported++;
        importedFixtures.push({ home, away, kickoff: kickoffAt, week: weekNumber, stage: groupStage });
      }
    }

    if (errors.length > 0 && imported === 0) {
      return NextResponse.json({ success: false, imported: 0, skipped, errors }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors: errors.slice(0, 5),
      fixtures: importedFixtures,
    });
  } catch (error: any) {
    console.error('[nations-league-import] Fatal error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
