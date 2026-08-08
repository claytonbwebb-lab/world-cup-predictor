import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekNumber = searchParams.get('weekNumber');

    if (!weekNumber) {
      return NextResponse.json({ error: 'weekNumber is required' }, { status: 400 });
    }

    const wk = parseInt(weekNumber);
    if (isNaN(wk)) {
      return NextResponse.json({ error: 'Invalid weekNumber' }, { status: 400 });
    }

    // Check lock status: is the first match of this week already kicked off?
    const { data: firstMatch } = await supabase
      .from('matches')
      .select('kickoff_at')
      .eq('week_number', wk)
      .order('kickoff_at', { ascending: true })
      .limit(1)
      .single();

    const isLocked = firstMatch ? new Date(firstMatch.kickoff_at) <= new Date() : true;

    // Get user's current pick — use service role to bypass missing RLS policy
    const adminClient = getServiceClient();
    const { data: pick, error: duError } = await adminClient
      .from('double_up_picks')
      .select('match_id')
      .eq('user_id', user.id)
      .eq('week_number', wk)
      .maybeSingle();

    if (duError) {
      console.error('Double-up GET error:', duError.message);
    }

    return NextResponse.json({
      matchId: pick?.match_id ?? null,
      isLocked,
      weekNumber: wk,
    });
  } catch (error) {
    console.error('Double up GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, weekNumber } = await request.json();

    if (!weekNumber) {
      return NextResponse.json({ error: 'weekNumber is required' }, { status: 400 });
    }

    const wk = parseInt(weekNumber);

    // Handle clear (matchId is null)
    if (!matchId) {
      const adminClient = getServiceClient();
      await adminClient
        .from('double_up_picks')
        .delete()
        .eq('user_id', user.id)
        .eq('week_number', wk);
      return NextResponse.json({ success: true, pick: null });
    }

    // 1. Check the match exists and belongs to the right week
    const { data: match } = await supabase
      .from('matches')
      .select('id, week_number, kickoff_at')
      .eq('id', matchId)
      .single();

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.week_number !== wk) {
      return NextResponse.json({ error: 'Match does not belong to this week' }, { status: 400 });
    }

    // 2. Check user has a prediction for this match
    const { data: prediction } = await supabase
      .from('predictions')
      .select('id')
      .eq('user_id', user.id)
      .eq('match_id', matchId)
      .single();

    if (!prediction) {
      return NextResponse.json({ error: 'You must submit a prediction before picking Double Up' }, { status: 400 });
    }

    // 3. Check lock status
    const isLocked = new Date(match.kickoff_at) <= new Date();
    if (isLocked) {
      return NextResponse.json({ error: 'Double Up is locked for this week' }, { status: 403 });
    }

    // 4. Upsert the pick — use service role to bypass missing RLS policy
    const adminClient = getServiceClient();
    const { data, error } = await adminClient
      .from('double_up_picks')
      .upsert(
        {
          user_id: user.id,
          match_id: matchId,
          week_number: wk,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,week_number' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch match details for the response
    const { data: matchFull } = await supabase
      .from('matches')
      .select('id, home_team, away_team, home_flag, away_flag, kickoff_at')
      .eq('id', matchId)
      .single();

    return NextResponse.json({ success: true, pick: matchFull });
  } catch (error) {
    console.error('Double up POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}