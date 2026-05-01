import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();

  // Apply migration using service role (bypasses RLS)
  const { error } = await supabase.rpc('exec', {
    sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;',
  });

  if (error) {
    // Try direct SQL alter as fallback
    const { data, error: alterError } = await supabase
      .from('profiles')
      .select('marketing_consent')
      .limit(1);

    if (alterError && alterError.code === '42703') {
      // Column doesn't exist, need different approach - use raw query via service role
      const { error: rawError } = await supabase.query(`
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;
      `);
      if (rawError) {
        return NextResponse.json({ success: false, error: rawError.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, method: 'raw' });
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
