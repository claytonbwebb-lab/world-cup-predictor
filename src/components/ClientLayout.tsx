'use client';

import { ConsentProvider } from './ConsentContext';
import ConsentBanner from '@/components/ConsentBanner';
import ConsentGate from '@/components/ConsentGate';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
      <ConsentBanner />
      <ConsentGate />
    </ConsentProvider>
  );
}
