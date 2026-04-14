import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Play Predict Win | Football Prediction League',
  description: 'Predict World Cup matches and compete with friends',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}