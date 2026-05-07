// Play Predict Win — Service Worker
// Handles push notifications and shows them to users

const CACHE_NAME = 'ppw-v1';

// Install event — cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(self.clients.claim());
});

// Push event — display notification
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: 'Play Predict Win',
    body: 'You have matches to predict!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: 'ppw-reminder',
    data: { url: 'https://playpredictwin.com/dashboard' },
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch (e) {
    // Fall back to text payload
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'predict', title: 'Make Predictions' },
      { action: 'dismiss', title: 'Later' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click — open dashboard
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  if (event.action === 'dismiss') {
    event.notification.close();
    return;
  }

  event.notification.close();

  const targetUrl = event.notification.data?.url || 'https://playpredictwin.com/dashboard';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes('playpredictwin.com') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});