import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { Pool } from 'pg';

const DATABASE_URL = `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.suyrbsuuckcvhdvxcvsf.supabase.co:5432/postgres?sslmode=require`;

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { sql } = await request.json();
    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'sql field is required' }, { status: 400 });
    }

    // Safety: only allow DDL (ALTER, CREATE) and data queries - block dangerous commands
    const upper = sql.toUpperCase();
    const forbidden = ['DROP', 'TRUNCATE', 'DELETE FROM', 'UPDATE ', 'GRANT', 'REVOKE', 'ROLLBACK'];
    if (forbidden.some(k => upper.includes(k))) {
      return NextResponse.json({ error: `Forbidden command: ${sql.slice(0, 50)}` }, { status: 403 });
    }

    const pool = new Pool({ connectionString: DATABASE_URL, max: 1 });
    const client = await pool.connect();
    let result: any;
    try {
      result = await client.query(sql);
    } finally {
      client.release();
      await pool.end();
    }

    return NextResponse.json({
      ok: true,
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map((f: any) => f.name) || [],
    });
  } catch (error: any) {
    console.error('[run-sql]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
