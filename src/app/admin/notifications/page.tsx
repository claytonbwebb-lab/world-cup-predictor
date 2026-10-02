import { redirect } from 'next/navigation';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications — Admin — PlayPredictWin',
  robots: { index: false, follow: false },
};

// Notifications admin now lives as a tab on /admin.
// This URL is kept as a redirect so old bookmarks/links keep working.
export default function AdminNotificationsRedirect() {
  redirect('/admin?tab=notifications');
}
