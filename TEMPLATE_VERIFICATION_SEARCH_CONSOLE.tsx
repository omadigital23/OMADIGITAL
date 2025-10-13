// Template pour ajouter la vérification Google Search Console
// À ajouter dans votre pages/_document.tsx

import { Html, Head, Main, NextScript } from 'next/document';
import { seoOptimizer } from '../src/lib/seo-optimizer';

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* ===== GOOGLE SEARCH CONSOLE VERIFICATION ===== */}
        {/* 🔧 REMPLACEZ "VOTRE_CODE_VERIFICATION" par le code fourni par Google */}
        <meta name="google-site-verification" content="VOTRE_CODE_VERIFICATION" />
        
        {/* ===== OPTIMISATIONS SEO DÉJÀ IMPLÉMENTÉES ===== */}
        
        {/* Preconnect optimisé pour performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pcedyohixahtfogfdlig.supabase.co" />
        
        {/* DNS prefetch pour meilleur chargement */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Headers de sécurité */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Performance hints */}
        <meta httpEquiv="x-dns-prefetch-control" content="on" />
        
        {/* Theme color pour navigateurs mobiles */}
        <meta name="theme-color" content="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
        
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/images/logo.webp" />
        
        {/* Manifest PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* ===== SCHEMA.ORG OPTIMISÉ POUR SEARCH CONSOLE ===== */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://oma-digital.sn/#organization",
                  "name": "OMA Digital",
                  "url": "https://oma-digital.sn",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://oma-digital.sn/images/logo.webp",
                    "width": 300,
                    "height": 60
                  },
                  "description": "Solutions d'automatisation WhatsApp et transformation digitale pour PME sénégalaises et marocaines",
                  "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "SN",
                    "addressLocality": "Dakar",
                    "addressRegion": "Dakar"
                  },
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+221-XX-XXX-XXXX",
                    "contactType": "Service Client",
                    "availableLanguage": ["French", "English"]
                  },
                  "sameAs": [
                    "https://www.linkedin.com/company/oma-digital",
                    "https://twitter.com/omadigital_sn",
                    "https://facebook.com/omadigital.sn"
                  ],
                  "areaServed": [
                    {
                      "@type": "Country",
                      "name": "Sénégal"
                    },
                    {
                      "@type": "Country", 
                      "name": "Maroc"
                    }
                  ],
                  "serviceType": [
                    "Automatisation WhatsApp",
                    "Transformation Digitale",
                    "Développement Web",
                    "Marketing Digital",
                    "Intelligence Artificielle"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://oma-digital.sn/#website",
                  "url": "https://oma-digital.sn",
                  "name": "OMA Digital - Transformation Digitale PME",
                  "description": "Solutions d'automatisation WhatsApp, sites web ultra-rapides et IA pour PME sénégalaises et marocaines",
                  "publisher": {"@id": "https://oma-digital.sn/#organization"},
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://oma-digital.sn/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  },
                  "inLanguage": "fr-FR"
                },
                {
                  "@type": "Service",
                  "@id": "https://oma-digital.sn/#service",
                  "serviceType": "Transformation Digitale",
                  "provider": {"@id": "https://oma-digital.sn/#organization"},
                  "areaServed": [
                    {
                      "@type": "City",
                      "name": "Dakar"
                    },
                    {
                      "@type": "City",
                      "name": "Casablanca"
                    },
                    {
                      "@type": "City", 
                      "name": "Rabat"
                    }
                  ],
                  "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": "Services de Transformation Digitale",
                    "itemListElement": [
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service",
                          "name": "Automatisation WhatsApp Business",
                          "description": "Automatisation complète de vos conversations WhatsApp avec IA"
                        }
                      },
                      {
                        "@type": "Offer", 
                        "itemOffered": {
                          "@type": "Service",
                          "name": "Sites Web Ultra-Rapides",
                          "description": "Développement de sites web optimisés pour la performance et le SEO"
                        }
                      },
                      {
                        "@type": "Offer",
                        "itemOffered": {
                          "@type": "Service", 
                          "name": "Transformation Digitale Complète",
                          "description": "Accompagnement complet dans votre transformation digitale"
                        }
                      }
                    ]
                  }
                }
              ]
            })
          }}
        />
        
        {/* ===== GOOGLE ANALYTICS 4 (Déjà optimisé) ===== */}
        {process.env['NEXT_PUBLIC_GA_ID'] && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env['NEXT_PUBLIC_GA_ID']}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env['NEXT_PUBLIC_GA_ID']}', {
                    // Optimisations pour Search Console
                    send_page_view: true,
                    anonymize_ip: true,
                    cookie_flags: 'SameSite=None;Secure'
                  });
                `,
              }}
            />
          </>
        )}
        
        {/* ===== MICROSOFT CLARITY (Optionnel) ===== */}
        {process.env['NEXT_PUBLIC_CLARITY_ID'] && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env['NEXT_PUBLIC_CLARITY_ID']}");
              `,
            }}
          />
        )}
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
        
        {/* ===== SCRIPT DE PERFORMANCE MONITORING ===== */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Monitoring Core Web Vitals pour Search Console
              (function() {
                function sendToSearchConsole(metric) {
                  // Log pour debugging
                  console.log('Core Web Vitals:', metric.name, metric.value, metric.rating);
                  
                  // Envoi vers votre endpoint analytics
                  if (navigator.sendBeacon) {
                    navigator.sendBeacon('/api/analytics/web-vitals', JSON.stringify({
                      name: metric.name,
                      value: metric.value,
                      rating: metric.rating,
                      url: window.location.href,
                      timestamp: Date.now()
                    }));
                  }
                }
                
                // Chargement dynamique des Web Vitals
                if ('IntersectionObserver' in window) {
                  import('web-vitals').then(function(webVitals) {
                    webVitals.getCLS(sendToSearchConsole);
                    webVitals.getFID(sendToSearchConsole);
                    webVitals.getLCP(sendToSearchConsole);
                    webVitals.getTTFB(sendToSearchConsole);
                    webVitals.getFCP(sendToSearchConsole);
                  }).catch(function(error) {
                    console.log('Web Vitals loading failed:', error);
                  });
                }
              })();
            `,
          }}
        />
      </body>
    </Html>
  );
}

/*
🔧 INSTRUCTIONS D'UTILISATION :

1. REMPLACEZ "VOTRE_CODE_VERIFICATION" par le code fourni par Google Search Console
2. Ajoutez vos vrais numéros de téléphone et adresses
3. Configurez les variables d'environnement :
   - NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   - NEXT_PUBLIC_CLARITY_ID=XXXXXXXXX (optionnel)

4. VÉRIFICATION :
   - Visitez : https://search.google.com/search-console/
   - Ajoutez votre propriété : https://oma-digital.sn
   - Utilisez la méthode "Balise meta HTML"
   - Copiez le code et remplacez "VOTRE_CODE_VERIFICATION"

5. TEST :
   - Rebuild : npm run build
   - Vérifiez dans le code source de votre page
   - Validez dans Search Console

🎯 RÉSULTAT : Configuration optimale pour Search Console + SEO maximal !
*/