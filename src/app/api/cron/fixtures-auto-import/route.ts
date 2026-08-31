import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
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

function getDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function extractMatchKey(home: string, away: string, kickoff: string): string {
  const date = kickoff.slice(0, 10);
  return `${home.trim()}|${away.trim()}|${date}`;
}

async function fetchFixtures(league: number, from: string, to: string): Promise<any[]> {
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

export async function GET() {
  return POST();
}

export async function POST() {
  try {
    const now = new Date();
    // PPW weeks run Tuesday → Monday
    // Import the NEXT week (not two weeks ahead)
    const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const daysSinceTuesday = (day - 2 + 7) % 7;
    const currentTuesday = new Date(now);
    currentTuesday.setDate(now.getDate() - daysSinceTuesday);
    const targetTuesday = new Date(currentTuesday);
    targetTuesday.setDate(currentTuesday.getDate() + 14);
    const targetMonday = new Date(targetTuesday);
    targetMonday.setDate(targetTuesday.getDate() + 6);

    const from = getDateStr(targetTuesday);
    const to = getDateStr(targetMonday);
    const weekNumber = getWeekNumber(targetTuesday);

    console.log(`[fixtures-auto-import] Importing fixtures (two weeks ahead) from ${from} to ${to}`);

    const leagues = [
      { id: 39, filterPrem: false, groupStage: 'Premier League' },
      { id: 2, filterPrem: true, groupStage: 'Champions League' },
      { id: 3, filterPrem: true, groupStage: 'Europa League' },
      { id: 47, filterPrem: true, groupStage: 'FA Cup' },
      { id: 48, filterPrem: true, groupStage: 'League Cup' },
      { id: 528, filterPrem: true, groupStage: 'Community Shield' },
    ];

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let imported = 0;

    for (const league of leagues) {
      let fixtures = await fetchFixtures(league.id, from, to);
      if (league.filterPrem) {
        fixtures = fixtures.filter((f: any) => isPremMatch(f.teams.home.name, f.teams.away.name));
      }

      // Deduplicate against existing
      for (const f of fixtures) {
        const home = canonicalTeamName(f.teams.home.name);
        const away = canonicalTeamName(f.teams.away.name);
        const kickoffUTC = f.fixture.date;
        const date = kickoffUTC.slice(0, 10);

        const { data: existing } = await supabase
          .from('matches')
          .select('id')
          .eq('home_team', home)
          .eq('away_team', away)
          .gte('kickoff_at', `${date}T00:00:00Z`)
          .lt('kickoff_at', `${date}T23:59:59Z`)
          .limit(1);

        if (existing && existing.length > 0) continue;

        const { error } = await supabase.from('matches').insert({
          home_team: home,
          away_team: away,
          home_flag: f.teams.home.logo || null,
          away_flag: f.teams.away.logo || null,
          group_stage: league.groupStage || null,
          kickoff_at: new Date(kickoffUTC).toISOString(),
          is_visible: false,
          is_locked: false,
          result_entered: false,
          week_number: weekNumber,
        });

        if (!error) imported++;
      }
    }

    console.log(`[fixtures-auto-import] Done. Imported ${imported} fixtures for ${from} to ${to}`);

    return NextResponse.json({
      success: true,
      imported_count: imported,
      week_start: from,
      week_end: to,
    });
  } catch (error: any) {
    console.error('[fixtures-auto-import] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
