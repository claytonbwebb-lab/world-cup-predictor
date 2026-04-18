import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  try {
    // Check admin auth
    const isAdmin = await requireAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const formData = await request.formData();

    const match_id = formData.get('match_id') as string;
    const locked = formData.get('locked') === 'true';

    if (!match_id) {
      return NextResponse.json({ error: 'Missing match_id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('matches')
      .update({ is_locked: locked })
      .eq('id', match_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, locked });
  } catch (error) {
    console.error('Toggle lock error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}