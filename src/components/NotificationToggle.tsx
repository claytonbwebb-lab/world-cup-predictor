'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function NotificationToggle() {
  const { permission, subscription, isLoading, error, subscribe, unsubscribe } = usePushNotifications();
  const [showError, setShowError] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <div className="w-4 h-4 border-2 border-slate-600 border-t-slate-400 rounded-full animate-spin" />
        Checking notification status...
      </div>
    );
  }

  if (permission === 'unsupported') {
    return null; // Browser doesn't support push notifications
  }

  if (subscription) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-slate-400">Push notifications enabled</span>
        </div>
        <button
          onClick={unsubscribe}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          Disable
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-amber-500 rounded-full" />
        <span className="text-sm text-slate-400">Get match reminders</span>
      </div>
      {permission === 'denied' ? (
        <span className="text-xs text-red-400">
          Notifications blocked — enable in browser settings
        </span>
      ) : (
        <button
          onClick={subscribe}
          className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded-full transition-colors"
        >
          Enable
        </button>
      )}
      {error && showError && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}