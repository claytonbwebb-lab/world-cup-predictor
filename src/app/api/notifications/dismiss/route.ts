import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/notifications/dismiss
// Body: { notification_id: string }
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const { notification_id } = await request.json();
  if (!notification_id) {
    return NextResponse.json({ error: 'Missing notification_id' }, { status: 400 });
  }

  // Fetch notification to get dismissal_mode and reappear_after_hours
  const { data: notification, error: nError } = await supabase
    .from('notifications')
    .select('id, dismissal_mode, reappear_after_hours')
    .eq('id', notification_id)
    .single();

  if (nError || !notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  const dismissedAt = new Date();
  let showAgainAt: Date | null = null;

  if (notification.dismissal_mode === 'temporary') {
    const hours = notification.reappear_after_hours ?? 24;
    showAgainAt = new Date(dismissedAt.getTime() + hours * 60 * 60 * 1000);
  }

  // UPSERT: supports repeated temporary dismissals
  const { error: upsertError } = await supabase
    .from('user_notification_dismissals')
    .upsert(
      {
        user_id: user.id,
        notification_id,
        dismissed_at: dismissedAt.toISOString(),
        show_again_at: showAgainAt?.toISOString() ?? null,
        permanently_dismissed: notification.dismissal_mode === 'permanent',
      },
      { onConflict: 'user_id,notification_id' }
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
