import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

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
    const code = body.code as string;

    if (!code) {
      return NextResponse.json({ error: 'Missing league code' }, { status: 400 });
    }

    // Find league by code
    const { data: league, error: findError } = await supabase
      .from('leagues')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (findError || !league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('league_members')
      .select('*')
      .eq('league_id', league.id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'Already a member' }, { status: 400 });
    }

    // Add user to league
    const { error: insertError } = await supabase
      .from('league_members')
      .insert({
        league_id: league.id,
        user_id: user.id,
      });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, league });
  } catch (error) {
    console.error('Join league error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}