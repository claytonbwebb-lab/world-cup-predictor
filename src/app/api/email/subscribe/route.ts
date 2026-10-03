import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '9c540286-7a1a-4a6f-b85c-61ca69a7e629';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.id || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username, marketing_consent')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (profile?.marketing_consent !== true) {
    return NextResponse.json({ success: true, skipped: 'no_marketing_consent' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Resend API key not configured' }, { status: 500 });
  }

  const response = await fetch('https://api.resend.com/audiences/' + RESEND_AUDIENCE_ID + '/contacts', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: user.email,
      first_name: profile?.username || undefined,
      unsubscribed: false,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = typeof body?.message === 'string' ? body.message.toLowerCase() : '';
    if (response.status === 409 || message.includes('already')) {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }

    return NextResponse.json({ error: 'Could not add contact to Resend' }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
