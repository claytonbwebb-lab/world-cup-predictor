// Capacitor-specific Next.js config — use with: next build --config next.config.capacitor.js
const withPWA = require('next-pwa')({
  dest: 'out',
  register: false,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'gstatic-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
    },
    {
      urlPattern: /^https:\/\/[^/]+\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'supabase-api', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, networkTimeoutSeconds: 5 },
    },
  ],
});

const nextConfig = {
  
  images: { unoptimized: true },
  skipTrailingSlashRedirect: true,
};

module.exports = withPWA(nextConfig);
