import { NextResponse } from 'next/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  const endpoints = [
    '/auth/v1/admin/settings',
    '/auth/v1/admin/email-templates',
    '/auth/v1/settings',
    '/auth/v1/config',
  ];

  const results: Record<string, any> = {};

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${SUPABASE_URL}${ep}`, {
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
        },
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text.substring(0, 200); }
      results[ep] = { status: res.status, data };
    } catch (e: any) {
      results[ep] = { error: e.message };
    }
  }

  return NextResponse.json(results);
}
