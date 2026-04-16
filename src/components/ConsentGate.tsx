'use client';

import Script from 'next/script';
import { useConsent } from './ConsentContext';

export default function ConsentGate() {
  const { consent } = useConsent();

  return (
    <>
      {consent.analytics && (
        <>
          <Script async src="https://www.googletagmanager.com/gtag/js?id=G-BHKDZ3FQM8" />
          <Script id="gtag-consent">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-BHKDZ3FQM8');
            `}
          </Script>
        </>
      )}
      {consent.advertising && (
        <>
          <Script id="fb-pixel-consent">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '188391209695379');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img height="1" width="1" style={{display:'none'}}
              src="https://www.facebook.com/tr?id=188391209695379&ev=PageView&noscript=1" />
          </noscript>
        </>
      )}
    </>
  );
}