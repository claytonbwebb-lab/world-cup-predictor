import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/notifications — list all notifications (admin only)
// POST /api/admin/notifications — create notification
// PUT /api/admin/notifications — update notification
// DELETE /api/admin/notifications?id=xxx — delete notification

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notifications: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const {
    message, status, type, link_text, link_url,
    starts_at, ends_at, priority, dismissal_mode, reappear_after_hours,
  } = body;

  if (!message || message.length > 250) {
    return NextResponse.json({ error: 'Message is required and must be ≤250 chars' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      message,
      status: status ?? 'draft',
      type: type ?? 'information',
      link_text: link_text ?? null,
      link_url: link_url ?? null,
      starts_at: starts_at ?? null,
      ends_at: ends_at ?? null,
      priority: priority ?? 0,
      dismissal_mode: dismissal_mode ?? 'temporary',
      reappear_after_hours: reappear_after_hours ?? 24,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notification: data }, { status: 201 });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { id, reset_dismissals, ...fields } = body;

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  if (fields.message && fields.message.length > 250) {
    return NextResponse.json({ error: 'Message must be ≤250 chars' }, { status: 400 });
  }

  // Validate URL if provided
  if (fields.link_url) {
    try { new URL(fields.link_url); }
    catch { return NextResponse.json({ error: 'Invalid link_url' }, { status: 400 }); }
  }

  // Update notification
  const { data, error } = await supabase
    .from('notifications')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Reset user dismissals if requested
  if (reset_dismissals) {
    await supabase
      .from('user_notification_dismissals')
      .delete()
      .eq('notification_id', id);
  }

  return NextResponse.json({ notification: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Delete dismissals first (CASCADE would handle this, but be explicit)
  await supabase.from('user_notification_dismissals').delete().eq('notification_id', id);

  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
