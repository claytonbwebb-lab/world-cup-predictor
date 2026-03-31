'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LogoutPage() {
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.signOut().then(() => {
      window.location.href = '/';
    });
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-textMuted">Signing out...</p>
    </div>
  );
}
