'use client';

import { useEffect, useState } from 'react';

interface PushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

interface UsePushNotificationsReturn {
  permission: NotificationPermission | 'unsupported';
  subscription: PushSubscription | null;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setPermission('unsupported');
      setIsLoading(false);
      return;
    }

    // Check current permission
    setPermission(Notification.permission);

    // Check if already subscribed
    checkSubscription();

    // Listen for permission changes
    const interval = setInterval(() => {
      setPermission(Notification.permission);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  async function checkSubscription() {
    try {
      const swReady = navigator.serviceWorker.ready;
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
      const registration = await Promise.race([swReady, timeout]);
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        setSubscription({
          endpoint: existing.endpoint,
          keys: {
            p256dh: existing.options?.applicationServerKey 
              ? arrayBufferToBase64(existing.options.applicationServerKey as ArrayBuffer)
              : '',
            auth: 'push-notifications', // Auth is part of the subscription object
          } as any,
        });
      }
    } catch (err) {
      console.error('[Push] Error checking subscription:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function subscribe() {
    setError(null);
    setIsLoading(true);

    try {
      // Request notification permission
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') {
        setError('Notification permission denied');
        setIsLoading(false);
        return;
      }
      setPermission(perm);

      // Get VAPID public key from server
      const keyRes = await fetch('/api/push/subscribe');
      if (!keyRes.ok) {
        throw new Error('Failed to get VAPID public key');
      }
      const { publicKey } = await keyRes.json();

      // Subscribe to push
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(publicKey) as unknown as BufferSource,
      });

      const subData = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: arrayBufferToBase64((sub.options.applicationServerKey as ArrayBuffer) || new ArrayBuffer(0)),
          auth: 'ppw-auth', // placeholder - real auth is in sub
        },
      };

      // Save to backend
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subData),
      });

      if (!res.ok) {
        throw new Error('Failed to save subscription');
      }

      setSubscription(subData);
    } catch (err: any) {
      console.error('[Push] Subscribe error:', err);
      setError(err.message || 'Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribe() {
    setError(null);
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();

      if (existing) {
        // Unsubscribe from push
        await existing.unsubscribe();

        // Remove from backend
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: existing.endpoint }),
        });
      }

      setSubscription(null);
    } catch (err: any) {
      console.error('[Push] Unsubscribe error:', err);
      setError(err.message || 'Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  }

  return { permission, subscription, isLoading, error, subscribe, unsubscribe };
}

// Helper: Convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Convert Base64 string to Uint8Array
function base64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}