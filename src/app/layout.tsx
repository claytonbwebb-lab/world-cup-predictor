import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
const Analytics = dynamic(() => import('@vercel/analytics/next').then(m => m.Analytics), { ssr: false });
import { SpeedInsights } from '@vercel/speed-insights/next';
import ClientLayout from '@/components/ClientLayout';
import RegisterServiceWorker from '@/components/RegisterServiceWorker';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.playpredictwin.com'),
  title: {
    default: 'Play Predict Win | Football Prediction League',
    template: '%s | Play Predict Win',
  },
  description: 'Predict every Premier League 2026/27 scoreline. Compete with friends in a free prediction league. Climb the leaderboard, earn points for correct scores, and win prizes. Join thousands of football fans now.',
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
    title: 'Play Predict Win | Free Premier League Score Prediction League 2026/27',
    description: 'Predict every Premier League scoreline, run private leagues with mates, and win up to £500 in weekly and monthly cash prizes. Free to enter.',
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
    <html lang="en" className={inter.className}>
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
              "@type": "WebSite",
              "name": "Play Predict Win",
              "url": "https://www.playpredictwin.com",
              "description": "Predict every Premier League 2026/27 scoreline. Compete with friends in a free prediction league. Climb the leaderboard and win prizes.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.playpredictwin.com/fixtures?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "organizer": {
                "@type": "Organization",
                "name": "Play Predict Win",
                "url": "https://www.playpredictwin.com"
              }
            })
          }}
        /></body>
    </html>
  );
}