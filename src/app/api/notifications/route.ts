import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_VISIBLE = 3;

// GET /api/notifications — returns active notifications for the current authenticated user
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ notifications: [] });
  }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('id, message, type, link_text, link_url, starts_at, ends_at, priority')
    .eq('status', 'published')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(MAX_VISIBLE);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter by active window (starts_at/ends_at) server-side since RLS can't handle NOW()
  const now = new Date();
  const active = (notifications ?? []).filter(n => {
    if (n.starts_at && new Date(n.starts_at) > now) return false;
    if (n.ends_at && new Date(n.ends_at) <= now) return false;
    return true;
  });

  // Exclude permanently dismissed and not-yet-reappearable
  const { data: dismissals } = await supabase
    .from('user_notification_dismissals')
    .select('notification_id, permanently_dismissed, show_again_at')
    .eq('user_id', user.id);

  const dismissalMap = new Map(
    (dismissals ?? []).map(d => [d.notification_id, d])
  );

  const eligible = active.filter(n => {
    const d = dismissalMap.get(n.id);
    if (!d) return true;
    if (d.permanently_dismissed) return false;
    if (d.show_again_at && new Date(d.show_again_at) > now) return false;
    return true;
  });

  return NextResponse.json({ notifications: eligible.slice(0, MAX_VISIBLE) });
}
