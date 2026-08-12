import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();

  // 1. Find Clayton in profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', '*clayton*');

  // 2. VIP league members
  const vipLeagueId = process.env.VIP_LEAGUE_ID;
  const { data: vipMembers } = await supabase
    .from('league_members')
    .select('user_id, profiles(id, username)')
    .eq('league_id', vipLeagueId || '');

  // 3. Distinct week_numbers in matches (scored matches only)
  const { data: matches } = await supabase
    .from('matches')
    .select('week_number')
    .eq('result_entered', true)
    .not('week_number', 'is', null)
    .order('week_number', { ascending: false });

  const uniqueWeeks = [...new Set((matches || []).map(m => m.week_number))].sort((a, b) => b - a);

  return NextResponse.json({
    profiles,
    vipMembers,
    vipLeagueId,
    uniqueWeeks,
    weekSample: (matches || []).slice(0, 5),
  });
}
