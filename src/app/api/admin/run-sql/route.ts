import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

// Use Supabase Management API via service role key
// (no native pg module needed — works on Vercel)

const MGMT_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const MGMT_BASE = 'https://api.supabase.com/v1';

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sql } = await request.json();
    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'sql field is required' }, { status: 400 });
    }

    // Safety: block dangerous commands
    const upper = sql.toUpperCase();
    const forbidden = ['DROP', 'TRUNCATE', 'DELETE', 'GRANT', 'REVOKE', 'ROLLBACK', 'INSERT', 'UPDATE'];
    const blockWord = forbidden.find(k => upper.includes(k));
    if (blockWord) {
      return NextResponse.json({ error: `Forbidden command: ${blockWord}` }, { status: 403 });
    }

    // Use Supabase Management API to run SQL
    const res = await fetch(`${MGMT_BASE}/projects/suyrbsuuckcvhdvxcvsf/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MGMT_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || data.error?.message || 'Query failed' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      rows: data,
      rowCount: Array.isArray(data) ? data.length : 0,
    });
  } catch (error: any) {
    console.error('[run-sql]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
