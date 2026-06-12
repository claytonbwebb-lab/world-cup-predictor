import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// VAPID public key — embed directly so frontend can use it
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
// VAPID private key — only used server-side for sending notifications
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = 'mailto:noreply@playpredictwin.com';

function createServerSupabaseClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getUser(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  // Return VAPID public key for the frontend to use
  if (!VAPID_PUBLIC_KEY) {
    return NextResponse.json({ error: 'Push not configured' }, { status: 500 });
  }
  return NextResponse.json({ publicKey: VAPID_PUBLIC_KEY });
}

export async function POST(request: Request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint, keys } = body;

  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint,
        keys,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,endpoint' }
    );

  if (error) {
    console.error('[push/subscribe] Error saving subscription:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }

  console.log('[push/subscribe] Subscription saved for user:', user.id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const user = await getUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint } = body;

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { error } = await supabase
    .from('push_subscriptions')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('endpoint', endpoint);

  if (error) {
    console.error('[push/unsubscribe] Error removing subscription:', error);
    return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 500 });
  }

  console.log('[push/unsubscribe] Subscription removed for user:', user.id);
  return NextResponse.json({ success: true });
}