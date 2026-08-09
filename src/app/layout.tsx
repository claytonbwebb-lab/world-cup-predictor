import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
const Analytics = dynamic(() => import('@vercel/analytics/next').then(m => m.Analytics), { ssr: false });
import { SpeedInsights } from '@vercel/speed-insights/next';
import ClientLayout from '@/components/ClientLayout';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';
import './globals.css';

export const metadata: Metadata = {
  title: 'Play Predict Win | Football Prediction League',
  description: 'Predict Premier League matches and compete with friends',
  icons: [
    { rel: 'icon', url: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    { rel: 'apple-touch-icon', url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    { rel: 'manifest', url: '/manifest.json' },
  ],
  appleWebApp: {
    capable: true,
    title: 'PlayPredictWin',
    statusBarStyle: 'black-translucent',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'theme-color': '#0f172a',
  },
  openGraph: {
    title: 'Play Predict Win',
    description: 'Predict every Premier League 2026/27 scoreline. Compete with your mates. Climb the leaderboard.',
    url: 'https://www.playpredictwin.com',
    siteName: 'Play Predict Win',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Play Predict Win — Premier League 2026/27 Prediction League',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Predict Win',
    description: 'Predict every Premier League 2026/27 scoreline. Compete with your mates. Climb the leaderboard.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
        <RegisterServiceWorker />
        <SpeedInsights />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": "Premier League 2026/27",
              "description": "Predict every Premier League 2026/27 scoreline and compete with friends on Play Predict Win.",
              "startDate": "2026-08-15",
              "endDate": "2027-05-24",
              "eventStatus": "https://schema.org/EventScheduled",
              "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
              "location": {
                "@type": "VirtualLocation",
                "url": "https://www.playpredictwin.com"
              },
              "organizer": {
                "@type": "Organization",
                "name": "Play Predict Win",
                "url": "https://www.playpredictwin.com"
              },
              "image": "https://www.playpredictwin.com/og-image.png",
              "offers": {
                "@type": "Offer",
                "name": "Free Prediction League",
                "price": "0",
                "priceCurrency": "GBP",
                "availability": "https://schema.org/InStock",
                "url": "https://www.playpredictwin.com/auth/signup"
              }
            })
          }}
        /></body>
    </html>
  );
}