'use client';

import { ConsentProvider } from './ConsentContext';
import ConsentBanner from '@/components/ConsentBanner';
import ConsentGate from '@/components/ConsentGate';
import NotificationBannerList from '@/components/NotificationBannerList';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <NotificationBannerList />
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
      <ConsentBanner />
      <ConsentGate />
    </ConsentProvider>
  );
}
