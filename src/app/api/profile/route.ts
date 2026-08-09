import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { favourite_team } = body;

  if (!favourite_team || typeof favourite_team !== 'string') {
    return NextResponse.json({ error: 'favourite_team is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ favourite_team })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, profile: data });
}