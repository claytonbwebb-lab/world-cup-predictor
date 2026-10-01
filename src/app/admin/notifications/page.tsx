import NavBar from '@/components/NavBar';
import NotificationsClient from '@/components/NotificationsClient';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications — Admin — PlayPredictWin',
  robots: { index: false, follow: false },
};

export default async function AdminNotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?redirect=/admin/notifications');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <span>🔔</span> Notifications
        </h1>
        <NotificationsClient />
      </main>
    </div>
  );
}
