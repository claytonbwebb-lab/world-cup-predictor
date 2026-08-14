import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to dates are required (YYYY-MM-DD)' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('matches')
      .update({ is_visible: true, is_locked: false })
      .gte('kickoff_at', `${from}T00:00:00Z`)
      .lte('kickoff_at', `${to}T23:59:59Z`);

    // Count updated rows separately
    const { count } = await supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .gte('kickoff_at', `${from}T00:00:00Z`)
      .lte('kickoff_at', `${to}T23:59:59Z`)
      .eq('is_visible', true);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated_count: count || 0 });
  } catch (error: any) {
    console.error('Push live error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
