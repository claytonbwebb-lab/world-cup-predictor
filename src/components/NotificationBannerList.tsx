'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Notification {
  id: string;
  message: string;
  type: 'information' | 'success' | 'important';
  link_text?: string;
  link_url?: string;
}

const MAX_VISIBLE = 3;

function isExternalUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname !== window.location.hostname;
  } catch {
    return false;
  }
}

export default function NotificationBannerList() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sessionAnnounced, setSessionAnnounced] = useState(false);
  const announcedRef = useRef(false);
  const supabase = createClient();

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const res = await fetch('/api/notifications');
    if (res.ok) {
      const json = await res.json();
      setNotifications(json.notifications ?? []);
    }
    setLoading(false);
  }

  async function handleDismiss(notificationId: string) {
    // Optimistic UI — remove immediately
    setDismissed(prev => new Set([...prev, notificationId]));

    const res = await fetch('/api/notifications/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: notificationId }),
    });

    if (!res.ok) {
      // Restore on failure
      setDismissed(prev => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  }

  const visible = notifications
    .filter(n => !dismissed.has(n.id))
    .slice(0, MAX_VISIBLE);

  if (loading || visible.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      onAnimationStart={() => {
        if (!announcedRef.current) {
          announcedRef.current = true;
        }
      }}
    >
      {visible.map((n, i) => (
        <div
          key={n.id}
          className="w-full bg-[#0a0f1c] border-b border-white/10 relative"
          style={{ animation: 'slideDown 0.2s ease-out', animationDelay: `${i * 60}ms` }}
        >
          <style>{`
            @keyframes slideDown {
              from { opacity: 0; transform: translateY(-8px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-start gap-3">
            {/* Indicator dot */}
            <div className="shrink-0 mt-0.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400" />
              </span>
            </div>

            {/* Message — wraps naturally */}
            <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed flex-1 break-words">
              {n.message}
            </p>

            {/* Optional CTA */}
            {n.link_text && n.link_url && (
              <a
                href={n.link_url}
                target={isExternalUrl(n.link_url) ? '_blank' : undefined}
                rel={isExternalUrl(n.link_url) ? 'noopener noreferrer' : undefined}
                className="shrink-0 ml-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
              >
                {n.link_text}
              </a>
            )}

            {/* Dismiss button */}
            <button
              onClick={() => handleDismiss(n.id)}
              className="shrink-0 text-white/40 hover:text-white/80 transition-colors p-1 -mr-1 -mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
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
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
