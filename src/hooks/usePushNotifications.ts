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
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkNotificationStatus() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setIsSupported(false);
        setLoading(false);
        return;
      }

      setIsSupported(true);
      setPermission(Notification.permission);

      try {
        const swReady = navigator.serviceWorker.ready;
        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
        registrationRef.current = await Promise.race([swReady, timeout]);
        const subscription = await registrationRef.current.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        setLoading(false);
      } catch (err: any) {
        console.error('Error checking push subscription:', err);
        // Timeout or SW error — mark unsupported so banner stays hidden
        setIsSupported(false);
        setIsSubscribed(false);
        setLoading(false);
      }
    }
    checkNotificationStatus();
  }, []);

  const subscribe = async () => {
    if (!isSupported || !registrationRef.current) {
      setError('Push notifications not supported or service worker not ready.');
      return;
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
