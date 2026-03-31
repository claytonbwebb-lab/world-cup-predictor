import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function POST() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  await supabase.auth.signOut();

  // Clear auth cookies
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');

  redirect('/');
}