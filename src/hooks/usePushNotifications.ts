import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

// Utility to convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  // API-level support (synchronous — known immediately)
  const apiSupported = typeof window !== 'undefined'
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;

  const [isSupported, setIsSupported] = useState(apiSupported);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    apiSupported ? Notification.permission : 'default'
  );
  // loading = true only while we're checking for an existing subscription
  const [loading, setLoading] = useState(apiSupported);
  const [error, setError] = useState<string | null>(null);

  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!apiSupported) return;

    async function checkExistingSubscription() {
      try {
        // Register and get the push-specific SW
        const reg = await navigator.serviceWorker.register('/push-sw.js', { scope: '/' });
        await reg.update();
        registrationRef.current = reg;
        const subscription = await reg.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err: any) {
        console.warn('[Push] SW registration failed:', err.message);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    }
    checkExistingSubscription();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribe = async () => {
    if (!isSupported) {
      setError('Push notifications not supported on this browser.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Request permission FIRST — must happen synchronously from user gesture on iOS
      if (Notification.permission === 'denied') {
        setError('Notifications blocked — enable them in your device settings.');
        setLoading(false);
        return;
      }

      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setError('Permission not granted.');
        setLoading(false);
        return;
      }

      // 2. Get SW registration (after permission granted)
      if (!registrationRef.current) {
        try {
          registrationRef.current = await navigator.serviceWorker.register('/push-sw.js', { scope: '/' });
        } catch {
          setError('Service worker not ready — try closing and reopening the app.');
          setLoading(false);
          return;
        }
      }

      // 3. Subscribe to push
      const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
      if (!VAPID_PUBLIC_KEY) {
        setError('Push not configured — contact support.');
        setLoading(false);
        return;
      }

      const subscription = await registrationRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Save via API route (handles auth server-side)
      const subJson = subscription.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subJson.keys ?? {},
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('[Push] API save error:', errData);
        setError(errData.error || 'Failed to save subscription.');
        await subscription.unsubscribe();
        setIsSubscribed(false);
      } else {
        setIsSubscribed(true);
        console.log('[Push] Subscribed successfully');
      }
    } catch (err: any) {
      console.error('[Push] Subscribe error:', err);
      setError(err.message || 'Failed to enable notifications.');
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSubscribed || !registrationRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const subscription = await registrationRef.current.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();

        // Remove subscription from your backend
        const { error: sbError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        if (sbError) {
          console.error('Supabase error deleting subscription:', sbError);
          setError(sbError.message || 'Error deleting subscription from server.');
          // If server delete fails, re-subscribe PushManager to keep the state consistent
          // This might be tricky, so for now, we'll just log and let it be
        } else {
          setIsSubscribed(false);
          console.log('Push subscription removed:', subscription);
        }
      }
    } catch (err: any) {
      console.error('Error unsubscribing from push notifications:', err);
      setError(err.message || 'Error unsubscribing.');
    } finally {
      setLoading(false);
    }
  };


  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
    registration: registrationRef.current,
  };
}
