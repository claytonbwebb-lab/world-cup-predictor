'use client';

import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { isIOS, isStandalone } from '@/utils/pwa'; // Assumed utility, created next

export default function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { isSupported, isSubscribed, permission, subscribe, loading } = usePushNotifications();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissed = localStorage.getItem('ppw_notif_dismissed');

    // Only show if supported, not dismissed, not already granted/subscribed
    if (isSupported && !dismissed && permission !== 'granted' && !isSubscribed) {
      // Special handling for iOS: only show if PWA is installed (standalone mode)
      if (isIOS() && !isStandalone()) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [isSupported, isSubscribed, permission]);

  const handleEnable = async () => {
    await subscribe();
    // If subscribed successfully, dismiss the banner
    if (isSubscribed || permission === 'granted') {
      localStorage.setItem('ppw_notif_dismissed', 'true');
      setIsVisible(false);
    }
  };

  const handleNotNow = () => {
    localStorage.setItem('ppw_notif_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible || loading) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#1a1a2e] border-t border-white/10 text-white shadow-lg md:rounded-2xl md:mx-4 md:mb-4 sm:flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔔</span>
        <p className="text-sm font-medium pr-4 sm:pr-0">
          Get match reminders? We&apos;ll notify you when you haven&apos;t predicted tomorrow&apos;s matches.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-0">
        <button
          onClick={handleEnable}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
        >
          {loading ? 'Enabling...' : 'Enable'}
        </button>
        <button
          onClick={handleNotNow}
          className="bg-surfaceLight hover:bg-surfaceLight/80 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
