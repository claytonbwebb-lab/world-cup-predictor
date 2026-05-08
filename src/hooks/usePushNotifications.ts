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
        // Wait for SW with a generous timeout
        const swReady = navigator.serviceWorker.ready;
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('sw-timeout')), 5000)
        );
        registrationRef.current = await Promise.race([swReady, timeout]);
        const subscription = await registrationRef.current.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (err: any) {
        // SW not registered / timed out — supported but no subscription yet
        console.warn('[Push] SW not ready:', err.message);
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
    // If SW wasn't ready at init time, try again now
    if (!registrationRef.current) {
      try {
        registrationRef.current = await Promise.race([
          navigator.serviceWorker.ready,
          new Promise<never>((_, r) => setTimeout(() => r(new Error('timeout')), 5000)),
        ]);
      } catch {
        setError('Service worker not ready. Try refreshing the page.');
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      if (Notification.permission === 'denied') {
        setError('Notification permission denied. Please enable it in your browser settings.');
        setLoading(false);
        return;
      }

      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setError('Notification permission not granted.');
        setLoading(false);
        return;
      }

      const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
      if (!VAPID_PUBLIC_KEY) {
        setError('VAPID public key not configured.');
        setLoading(false);
        return;
      }
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      const subscription = await registrationRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      // Send subscription to your backend
      const { data, error: sbError } = await supabase
        .from('push_subscriptions')
        .insert({
          subscription_data: subscription,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (sbError) {
        console.error('Supabase error saving subscription:', sbError);
        setError(sbError.message || 'Error saving subscription on server.');
        // Unsubscribe from PushManager if database save fails
        await subscription.unsubscribe();
        setIsSubscribed(false);
      } else {
        setIsSubscribed(true);
        console.log('Push subscription saved:', subscription);
      }
    } catch (err: any) {
      console.error('Error subscribing to push notifications:', err);
      setError(err.message || 'Error subscribing to push notifications.');
      setIsSubscribed(false); // Ensure state is correct if error happened mid-subscribe
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
