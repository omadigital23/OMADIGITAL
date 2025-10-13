/**
 * Optimized Google Tag Manager component
 * Loads GTM asynchronously to avoid blocking page render
 */

import { useEffect } from 'react';
import Script from 'next/script';

export function OptimizedGTM() {
  useEffect(() => {
    // Only load GTM after the page is interactive
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
    }
  }, []);

  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `,
        }}
      />
    </>
  );
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}
