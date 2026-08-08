import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

const VIP_LEAGUE_SECRET = process.env.VIP_LEAGUE_SECRET || 'VIP2026SECRET';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code, token } = body as { code?: string; token?: string };

    let vipLeagueId: string | null = null;

    if (code) {
      // New flow: look up VIP league by code in the leagues table
      const { data: league } = await supabase
        .from('leagues')
        .select('id, is_vip')
        .eq('code', code.toUpperCase())
        .eq('is_vip', true)
        .single();

      if (!league) {
        return NextResponse.json({ error: 'Invalid or unknown invite code' }, { status: 404 });
      }
      vipLeagueId = league.id;
    } else if (token) {
      // Legacy flow: validate secret token and use VIP_LEAGUE_ID env var
      if (token !== VIP_LEAGUE_SECRET) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 });
      }
      vipLeagueId = process.env.VIP_LEAGUE_ID || null;
      if (!vipLeagueId) {
        return NextResponse.json({ error: 'VIP league not configured' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Missing invite code or token' }, { status: 400 });
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('league_members')
      .select('*')
      .eq('league_id', vipLeagueId)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ already_member: true });
    }

    // Add user to VIP league
    const { error: insertError } = await supabase
      .from('league_members')
      .insert({
        league_id: vipLeagueId,
        user_id: user.id,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('VIP join error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}