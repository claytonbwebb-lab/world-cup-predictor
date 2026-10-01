import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE /api/notifications/restore?notification_id=xxx
// Removes the user's dismissal record for a notification.
// If the notification is still active, it will re-appear.
export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('notification_id');

  if (!notificationId) {
    return NextResponse.json({ error: 'Missing notification_id' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_notification_dismissals')
    .delete()
    .eq('user_id', user.id)
    .eq('notification_id', notificationId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
