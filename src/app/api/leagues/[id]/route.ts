import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name } = body;
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const { data, error } = await supabase
    .from('leagues')
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('created_by', user.id)
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  let count = 0;

  if (profile?.is_admin) {
    // Admin: delete regardless of who created it
    const result = await supabase.from('leagues').delete().eq('id', params.id);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    // @ts-ignore - count may not be typed but supabase returns it
    count = result.count ?? 0;
  } else {
    // Non-admin: must be the creator — first check it exists and belongs to them
    const { data: existing } = await supabase
      .from('leagues')
      .select('id')
      .eq('id', params.id)
      .eq('created_by', user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'League not found or you are not the creator' }, { status: 404 });
    }

    const result = await supabase.from('leagues').delete().eq('id', params.id).eq('created_by', user.id);
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    // @ts-ignore
    count = result.count ?? 1;
  }

  if (count === 0) return NextResponse.json({ error: 'League not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
