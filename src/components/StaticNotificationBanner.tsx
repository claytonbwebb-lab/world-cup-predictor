'use client';

import React, { useState } from 'react';

interface StaticNotificationBannerProps {
  message?: string;
  onDismiss?: () => void;
}

export default function StaticNotificationBanner({
  message = '🎉 Well done to Dave Johnson who just won £50 in Week 8!',
  onDismiss,
}: StaticNotificationBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="w-full bg-[#0a0f1c] border-b border-white/10 relative z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-start gap-3">
        {/* Icon / indicator */}
        <div className="shrink-0 mt-0.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
        </div>

        {/* Message — wraps naturally */}
        <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed flex-1">
          {message}
        </p>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="shrink-0 text-white/40 hover:text-white/80 transition-colors p-1 -mr-1 -mt-1"
          aria-label="Dismiss notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
