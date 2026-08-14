import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY!;
const API_FOOTBALL_HOST = 'v3.football.api-sports.io';
const BST_OFFSET_MS = 60 * 60 * 1000;

const PREM_TEAMS = new Set([
  'Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Brighton & Hove Albion',
  'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Ipswich Town',
  'Leicester City', 'Leicester', 'Leeds United', 'Leeds',
  'Liverpool', 'Manchester City', 'Man City', 'Manchester United', 'Man Utd',
  'Newcastle United', 'Newcastle', 'Nottingham Forest', 'Nottm Forest',
  'Southampton', 'Tottenham Hotspur', 'Tottenham',
  'West Ham United', 'West Ham',
  'Wolverhampton Wanderers', 'Wolves', 'Wolverhampton',
]);

function isPremMatch(home: string, away: string): boolean {
  return Array.from(PREM_TEAMS).some(t =>
    home.toLowerCase().includes(t.toLowerCase()) ||
    away.toLowerCase().includes(t.toLowerCase())
  );
}

function applyBST(utcDateStr: string): string {
  const utc = new Date(utcDateStr);
  const bst = new Date(utc.getTime() + BST_OFFSET_MS);
  return bst.toISOString();
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
  return data.response || [];
}

export async function POST() {
  try {
    const now = new Date();
    // PPW weeks run Tuesday → Monday
    // Find current week's Tuesday, then take the Tuesday AFTER NEXT
    // (so on Sunday when current week is underway, we still get a full week ahead)
    const day = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const daysSinceTuesday = (day - 2 + 7) % 7;
    const currentTuesday = new Date(now);
    currentTuesday.setDate(now.getDate() - daysSinceTuesday);
    // Two weeks ahead so we're always staging a future week, not the current one
    const targetTuesday = new Date(currentTuesday);
    targetTuesday.setDate(currentTuesday.getDate() + 14);
    const targetMonday = new Date(targetTuesday);
    targetMonday.setDate(targetTuesday.getDate() + 6);

    const from = getDateStr(targetTuesday);
    const to = getDateStr(targetMonday);
    const weekNumber = Math.floor((targetTuesday.getTime() - currentTuesday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

    console.log(`[fixtures-auto-import] Importing fixtures from ${from} to ${to}`);

    const leagues = [
      { id: 39, filterPrem: false },
      { id: 2, filterPrem: true },
      { id: 3, filterPrem: true },
      { id: 47, filterPrem: true },
      { id: 294, filterPrem: true },
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
        const home = f.teams.home.name;
        const away = f.teams.away.name;
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
          home_flag: null,
          away_flag: null,
          group_stage: null,
          kickoff_at: applyBST(kickoffUTC),
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
