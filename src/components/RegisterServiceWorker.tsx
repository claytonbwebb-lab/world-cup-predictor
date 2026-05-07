'use client';

import { useEffect } from 'react';

export default function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    async function register() {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('[PPW] Service Worker registered:', registration.scope);
      } catch (err) {
        console.error('[PPW] Service Worker registration failed:', err);
      }
    }

    register();

    // Also listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('[PPW] SW message:', event.data);
    });
  }, []);

  return null;
}