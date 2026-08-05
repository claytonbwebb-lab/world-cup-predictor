import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return lock status for current and next few weeks
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const currentWeek = getWeekNumber(new Date());

    const weeks = [currentWeek, currentWeek + 1, currentWeek + 2];

    const statuses = await Promise.all(
      weeks.map(async (wk) => {
        const { data: firstMatch } = await supabase
          .from('matches')
          .select('kickoff_at')
          .eq('week_number', wk)
          .order('kickoff_at', { ascending: true })
          .limit(1)
          .single();

        const isLocked = firstMatch ? new Date(firstMatch.kickoff_at) <= new Date() : true;

        const { data: pick } = await supabase
          .from('double_up_picks')
          .select('match_id')
          .eq('user_id', user.id)
          .eq('week_number', wk)
          .single();

        return { weekNumber: wk, isLocked, matchId: pick?.match_id ?? null };
      })
    );

    return NextResponse.json({ weeks: statuses.filter(s => s.weekNumber > 0) });
  } catch (error) {
    console.error('Double up status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getWeekNumber(date: Date): number {
  const SEASON_START = new Date('2026-08-11T00:00:00Z');
  const diffMs = date.getTime() - SEASON_START.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(1, 1 + Math.floor(diffDays / 7));
}