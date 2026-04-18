import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Lock all matches where kickoff has passed but is_locked is still false
    const now = new Date().toISOString();
    const { count } = await supabase
      .from('matches')
      .update({ is_locked: true })
      .eq('is_locked', false)
      .lte('kickoff_at', now);

    return NextResponse.json({ success: true, locked: count });
  } catch (error) {
    console.error('Auto-lock error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}