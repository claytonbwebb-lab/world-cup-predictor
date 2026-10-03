'use client';

import Script from 'next/script';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement, forceReload?: boolean) => void;
    };
  }
}

export default function TrustpilotReviewCard() {
  const widgetRef = useRef<HTMLDivElement>(null);

  const loadWidget = () => {
    if (widgetRef.current && window.Trustpilot) {
      window.Trustpilot.loadFromElement(widgetRef.current, true);
    }
  };

  useEffect(() => {
    loadWidget();
  }, []);

  return (
    <section className="card mt-8 border-primary/20 bg-gradient-to-br from-surface to-surfaceLight/40">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
            Help PPW grow
          </p>
          <h2 className="text-xl font-bold mb-2">Enjoying Play Predict Win?</h2>
          <p className="text-sm text-textMuted leading-relaxed">
            A quick Trustpilot review helps new players trust the game and join the fun.
          </p>
        </div>

        <div
          ref={widgetRef}
          className="trustpilot-widget min-h-[52px] rounded-lg bg-background/40 px-2 py-2"
          data-locale="en-GB"
          data-template-id="56278e9abfbbba0bdcd568bc"
          data-businessunit-id="6abe3745d4ea2cdc6ac6aab7"
          data-style-height="52px"
          data-style-width="100%"
          data-token="a9a57566-62bc-4c57-b83b-1139d2b9e5ca"
        >
          <a
            href="https://www.trustpilot.com/review/playpredictwin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Leave a Trustpilot review
          </a>
        </div>
      </div>

      <Script
        src="https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
        strategy="afterInteractive"
        onLoad={loadWidget}
      />
    </section>
  );
}
