import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const is_public = formData.get('is_public') === 'on';

    if (!name) {
      return NextResponse.json({ error: 'Missing league name' }, { status: 400 });
    }

    // Generate unique code
    const code = randomBytes(4).toString('hex').toUpperCase();

    const { data, error } = await supabase
      .from('leagues')
      .insert({
        name,
        code,
        created_by: user.id,
        is_public,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add creator as member
    await supabase.from('league_members').insert({
      league_id: data.id,
      user_id: user.id,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create league error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}