import { Html, Head, Main, NextScript } from 'next/document';
import { seoOptimizer } from '../src/lib/seo-optimizer';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pcedyohixahtfogfdlig.supabase.co" />
        
        {/* DNS prefetch for better loading */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Performance hints */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
        
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo.webp" />
        
        {/* Manifest for PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Enhanced SEO - Organization Schema */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: seoOptimizer.generateOrganizationSchema()
          }}
        />
        
        {/* Google Analytics 4 */}
        {process.env['NEXT_PUBLIC_GA_ID'] && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env['NEXT_PUBLIC_GA_ID']}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env['NEXT_PUBLIC_GA_ID']}');
                `,
              }}
            />
          </>
        )}
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}