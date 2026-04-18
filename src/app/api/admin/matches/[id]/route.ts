import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Props) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = await createClient();
    const formData = await req.formData();

    const home_team = formData.get('home_team') as string;
    const away_team = formData.get('away_team') as string;
    const home_flag = formData.get('home_flag') as string;
    const away_flag = formData.get('away_flag') as string;
    const group_stage = formData.get('group_stage') as string;
    const kickoff_at = formData.get('kickoff_at') as string;

    if (!home_team || !away_team || !kickoff_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [datePart, timePart] = kickoff_at.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const localDate = new Date(`${String(year)}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00`);
    const utcMs = localDate.getTime() - localDate.getTimezoneOffset() * 60000;
    const kickoffUtc = new Date(utcMs).toISOString();

    const { error } = await supabase
      .from('matches')
      .update({
        home_team,
        away_team,
        home_flag: home_flag || null,
        away_flag: away_flag || null,
        group_stage: group_stage || null,
        kickoff_at: kickoffUtc,
      })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update match error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  try {
    const isAdmin = await requireAdmin();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = await createClient();
    const { error } = await supabase.from('matches').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete match error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}