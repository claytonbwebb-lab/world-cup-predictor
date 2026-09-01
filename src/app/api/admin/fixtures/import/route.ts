import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { getWeekNumber } from '@/lib/weeks';
import { canonicalTeamName } from '@/lib/teams';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY!;
const API_FOOTBALL_HOST = 'v3.football.api-sports.io';

const PREM_TEAMS = new Set([
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Brighton & Hove Albion',
  'Chelsea', 'Coventry', 'Coventry City', 'Crystal Palace', 'Everton', 'Fulham',
  'Hull', 'Hull City', 'Ipswich', 'Ipswich Town', 'Leeds United', 'Leeds',
  'Liverpool', 'Manchester City', 'Man City', 'Manchester United', 'Man Utd',
  'Newcastle United', 'Newcastle', 'Nottingham Forest', 'Nottm Forest',
  'Sunderland', 'Tottenham Hotspur', 'Tottenham',
]);

function normaliseTeamName(name: string): string {
  return (name || '').trim().toLowerCase();
}

function isPremTeam(name: string): boolean {
  const normalised = normaliseTeamName(name);
  return Array.from(PREM_TEAMS).some(t => normaliseTeamName(t) === normalised);
}

function isPremMatch(home: string, away: string): boolean {
  // Exact aliases only — avoids false positives like Newcastle Town / Bourne Town.
  return isPremTeam(home) || isPremTeam(away);
}

function extractMatchKey(home: string, away: string, kickoff: string): string {
  const date = kickoff.slice(0, 10);
  return `${home.trim()}|${away.trim()}|${date}`;
}

async function fetchFixturesFromAPI(league: number, from: string, to: string): Promise<any[]> {
  const url = `https://${API_FOOTBALL_HOST}/fixtures?league=${league}&season=2026&from=${from}&to=${to}`;
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

async function getExistingMatchKeys(supabase: any, fixtures: any[]): Promise<Set<string>> {
  const keys = fixtures.map(f => extractMatchKey(
    f.teams.home.name, f.teams.away.name, f.fixture.date
  ));
  if (keys.length === 0) return new Set();

  // Check each key — get matches where date+teams match
  const existing = new Set<string>();
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

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const leaguesParam = searchParams.get('leagues');

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to dates are required (YYYY-MM-DD)' }, { status: 400 });
    }

    const defaultLeagues = [
      { id: 39, name: 'Premier League', filterPrem: false },
      { id: 2,  name: 'Champions League', filterPrem: true },
      { id: 3,  name: 'Europa League', filterPrem: true },
      { id: 47, name: 'Carabao Cup', filterPrem: true },
      { id: 294, name: 'FA Cup', filterPrem: true },
      { id: 528, name: 'Community Shield', filterPrem: true },
    ];

    const leagues = leaguesParam
      ? defaultLeagues.filter(l => leaguesParam.split(',').includes(String(l.id)))
      : defaultLeagues;

    const supabase: SupabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    ) as any;

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const league of leagues) {
      let fixtures: any[];
      try {
        fixtures = await fetchFixturesFromAPI(league.id, from, to);
      } catch (e: any) {
        errors.push(`League ${league.id}: ${e.message}`);
        continue;
      }

      // Filter to PL teams for non-PL leagues
      if (league.filterPrem) {
        fixtures = fixtures.filter((f: any) =>
          isPremMatch(f.teams.home.name, f.teams.away.name)
        );
      }

      // Check for existing
      const existing = await getExistingMatchKeys(supabase, fixtures);

      for (const f of fixtures) {
        const home = canonicalTeamName(f.teams.home.name);
        const away = canonicalTeamName(f.teams.away.name);
        const kickoffUTC = f.fixture.date;
        const key = extractMatchKey(home, away, kickoffUTC);

        if (existing.has(key)) {
          skipped++;
          continue;
        }

        const kickoffAt = new Date(kickoffUTC).toISOString();

        const { error } = await (supabase as any).from('matches').insert({
          home_team: home,
          away_team: away,
          home_flag: f.teams.home.logo || null,
          away_flag: f.teams.away.logo || null,
          group_stage: league.name,
          kickoff_at: kickoffAt,
          week_number: getWeekNumber(new Date(kickoffAt)),
          is_visible: false,
          is_locked: false,
          result_entered: false,
        });

        if (error) {
          console.error(`[fixtures-import] Insert error for ${home} vs ${away}:`, error);
          errors.push(`Insert error for ${home} vs ${away}: ${error.message}`);
        } else {
          imported++;
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        imported,
        skipped,
        error: errors.slice(0, 5).join(' | '),
        errors: errors.slice(0, 20),
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, imported, skipped, errors: [] });
  } catch (error: any) {
    console.error('Fixtures import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
