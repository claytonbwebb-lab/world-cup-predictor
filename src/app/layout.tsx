import type { Metadata } from 'next';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Play Predict Win | Football Prediction League',
  description: 'Predict World Cup matches and compete with friends',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Play Predict Win',
    description: 'Predict every World Cup 2026 scoreline. Compete with your mates. Climb the leaderboard.',
    url: 'https://www.playpredictwin.com',
    siteName: 'Play Predict Win',
    locale: 'en_GB',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Play Predict Win — World Cup 2026 Prediction League',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Play Predict Win',
    description: 'Predict every World Cup 2026 scoreline. Compete with your mates. Climb the leaderboard.',
    images: ['/og-image.png'],
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": "FIFA World Cup 2026",
              "description": "Predict every match scoreline in the FIFA World Cup 2026 and compete with friends on Play Predict Win.",
              "startDate": "2026-06-11",
              "endDate": "2026-07-19",
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