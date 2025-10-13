import { Html, Head, Main, NextScript } from 'next/document';

export default function OptimizedDocument() {
  return (
    <Html lang="fr">
      <Head>
        {/* CSS Critique inliné pour éliminer le render-blocking */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* CSS Critique Above-the-Fold */
            *,*::before,*::after{box-sizing:border-box}
            body{margin:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;line-height:1.6}
            .hero-container{min-height:100vh;display:flex;align-items:center;background:linear-gradient(135deg,#f97316 0%,#ea580c 100%)}
            .hero-content{max-width:1280px;margin:0 auto;padding:0 1rem;color:white}
            .hero-title{font-size:clamp(2rem,5vw,4rem);font-weight:700;line-height:1.1;margin-bottom:1rem}
            .header-nav{position:fixed;top:0;width:100%;z-index:50;background:rgba(255,255,255,0.95);backdrop-filter:blur(10px)}
            .skeleton{background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:loading 1.5s infinite}
            @keyframes loading{0%{background-position:200% 0}100%{background-position:-200% 0}}
          `
        }} />
        
        {/* Preconnections critiques */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://kvwhpymdhgdavcgfdjsu.supabase.co" />
        
        {/* DNS Prefetch pour les domaines externes */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//vercel.live" />
        
        {/* Resource Hints pour les ressources critiques */}
        <link rel="preload" href="/images/logo.webp" as="image" type="image/webp" />
        <link rel="preload" href="/_next/static/css/globals.css" as="style" />
        
        {/* Fonts avec display=swap pour éviter FOIT */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Security et Performance Headers */}
        <meta httpEquiv="X-DNS-Prefetch-Control" content="on" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        
        {/* PWA et Mobile Optimization */}
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Favicons optimisés */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/logo.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/images/logo.webp" />
        
        {/* Manifest pour PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Analytics optimisé avec defer */}
        {process.env['NEXT_PUBLIC_GA_ID'] && (
          <>
            <script 
              defer 
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env['NEXT_PUBLIC_GA_ID']}`} 
            />
            <script
              defer
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env['NEXT_PUBLIC_GA_ID']}', {
                    page_title: document.title,
                    page_location: window.location.href,
                    anonymize_ip: true,
                    cookie_flags: 'max-age=7200;secure;samesite=strict'
                  });
                `,
              }}
            />
          </>
        )}
      </Head>
      <body className="antialiased">
        {/* Preloader pour améliorer la perception de performance */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Preloader simple pour masquer le FOUC
            document.documentElement.style.visibility = 'hidden';
            window.addEventListener('DOMContentLoaded', function() {
              setTimeout(function() {
                document.documentElement.style.visibility = 'visible';
              }, 100);
            });
          `
        }} />
        
        <Main />
        <NextScript />
        
        {/* Service Worker Registration - différé */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/service-worker.js')
                  .catch(function(error) {
                    console.log('SW registration failed');
                  });
              });
            }
          `
        }} />
      </body>
    </Html>
  );
}