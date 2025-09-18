import Head from 'next/head';
import { GetStaticProps } from 'next';
import { memo, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SecureHeader } from '../src/components/SecureHeader';
import { OptimizedLandingPage } from '../src/components/OptimizedLandingPage';
import { Footer } from '../src/components/Footer';
import { useOptimizedPerformance } from '../src/hooks/useOptimizedPerformance';
import { ENV_CONFIG } from '../src/lib/env-config';
import dynamic from 'next/dynamic';

// Lazy load du chatbot pour améliorer les performances
const SmartChatbotNext = dynamic(
  () => import('../src/components/SmartChatbotNext').then(mod => mod.SmartChatbotNext),
  { 
    ssr: false,
    loading: () => null // Pas de loader pour le chatbot
  }
);

// Composant d'erreur global
const GlobalErrorFallback = memo(({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md mx-auto text-center p-6">
      <div className="mb-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Une erreur s'est produite</h1>
        <p className="text-gray-600 mb-6">
          Nous nous excusons pour ce désagrément. Notre équipe technique a été notifiée.
        </p>
      </div>
      
      <div className="space-y-3">
        <button 
          onClick={resetErrorBoundary}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          Réessayer
        </button>
        
        <button 
          onClick={() => window.location.href = '/'}
          className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Retour à l'accueil
        </button>
        
        <a 
          href="https://wa.me/221701193811?text=Bonjour%2C%20j%27ai%20rencontré%20une%20erreur%20sur%20votre%20site"
          className="block w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contacter le support
        </a>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Détails de l'erreur (développement)
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
            {error.message}
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
));

// Composant principal optimisé
const OptimizedHomePage = memo(() => {
  // Initialisation du monitoring de performance
  useOptimizedPerformance({
    enableWebVitals: ENV_CONFIG.PERFORMANCE_MONITORING,
    enableResourceTiming: ENV_CONFIG.PERFORMANCE_MONITORING,
    reportingEndpoint: ENV_CONFIG.MONITORING_ENDPOINT
  });

  return (
    <ErrorBoundary FallbackComponent={GlobalErrorFallback}>
      <div className="min-h-screen bg-white">
        <Head>
          {/* Meta tags essentiels */}
          <title>OMA Digital - Solutions IA & Automatisation PME Sénégal & Maroc | ROI +200% Garanti</title>
          <meta 
            name="description" 
            content="Transformez votre PME avec nos solutions IA : WhatsApp automatisé, sites ultra-rapides <1.5s, chatbots français. +200% ROI garanti en 3 mois. Spécialiste transformation digitale Dakar, Thies, Casablanca, Rabat, Marrakech." 
          />
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          
          {/* Sécurité */}
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
          <meta name="referrer" content="strict-origin-when-cross-origin" />
          
          {/* Performance - Préchargement des ressources critiques */}
          <link rel="preload" href="/images/logo.webp" as="image" type="image/webp" />
          <link rel="preload" href="/videos/hero1.webm" as="video" type="video/webm" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* DNS prefetch pour les domaines externes */}
          <link rel="dns-prefetch" href="//www.google-analytics.com" />
          <link rel="dns-prefetch" href="//pcedyohixahtfogfdlig.supabase.co" />
          
          {/* SEO avancé */}
          <meta name="keywords" content="automatisation PME Dakar, IA Sénégal, WhatsApp Business automatique, site web rapide Dakar, chatbot français, transformation digitale PME africaine, solutions IA sur mesure, business automation Senegal, automatisation PME Casablanca, IA Maroc, WhatsApp Business automatique Maroc, site web rapide Casablanca, chatbot français Maroc, transformation digitale PME marocaine, solutions IA sur mesure Maroc, business automation Maroc, automatisation PME Rabat, automatisation PME Marrakech, automatisation PME Thies" />
          <meta name="author" content="OMA Digital Dakar & Casablanca" />
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          
          {/* Open Graph */}
          <meta property="og:title" content="OMA Digital - Solutions IA pour PME au Sénégal et au Maroc" />
          <meta property="og:description" content="Automatisation WhatsApp, sites ultra-rapides, IA conversationnelle. 200+ clients PME, ROI +200%. Spécialiste transformation digitale Dakar, Thies, Casablanca, Rabat, Marrakech." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://oma-digital.sn" />
          <meta property="og:image" content="https://oma-digital.sn/images/og-image.svg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:locale" content="fr_FR" />
          <meta property="og:site_name" content="OMA Digital" />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@OMADigitalSN" />
          <meta name="twitter:creator" content="@OMADigitalSN" />
          <meta name="twitter:title" content="OMA Digital - Solutions IA PME Sénégal & Maroc" />
          <meta name="twitter:description" content="Transformez votre PME avec nos solutions IA. ROI +200% garanti en 3 mois." />
          <meta name="twitter:image" content="https://oma-digital.sn/images/og-image.svg" />
          
          {/* Géolocalisation */}
          <meta name="geo.region" content="SN-DK" />
          <meta name="geo.placename" content="Dakar, Sénégal" />
          <meta name="geo.position" content="14.6928;-17.4467" />
          <meta name="ICBM" content="14.6928, -17.4467" />
          
          {/* Informations de contact */}
          <meta name="contact" content="omadigital23@gmail.com" />
          <meta name="phone" content="+221701193811" />
          
          {/* PWA */}
          <meta name="theme-color" content="#f97316" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="OMA Digital" />
          
          {/* Icônes */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/images/logo.webp" />
          <link rel="manifest" href="/manifest.json" />
          <link rel="canonical" href="https://oma-digital.sn" />
          
          {/* Structured Data pour le SEO */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "OMA Digital",
                "alternateName": "OMA Digital Sénégal Maroc",
                "url": "https://oma-digital.sn",
                "logo": "https://oma-digital.sn/images/logo.webp",
                "description": "Solutions IA et automatisation pour PME au Sénégal et au Maroc. Automatisation WhatsApp, sites ultra-rapides, chatbots intelligents. ROI +200% garanti.",
                "foundingDate": "2023",
                "founders": [
                  {
                    "@type": "Person",
                    "name": "Équipe OMA Digital"
                  }
                ],
                "address": [
                  {
                    "@type": "PostalAddress",
                    "streetAddress": "Hersent Rue 15",
                    "addressLocality": "Thies",
                    "addressRegion": "Thies",
                    "postalCode": "21000",
                    "addressCountry": "SN"
                  },
                  {
                    "@type": "PostalAddress",
                    "streetAddress": "Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt15",
                    "addressLocality": "Casablanca",
                    "addressRegion": "Casablanca-Settat",
                    "postalCode": "20000",
                    "addressCountry": "MA"
                  }
                ],
                "contactPoint": [
                  {
                    "@type": "ContactPoint",
                    "telephone": "+221701193811",
                    "contactType": "customer service",
                    "availableLanguage": ["French", "Arabic"],
                    "areaServed": ["SN", "MA"]
                  }
                ],
                "sameAs": [
                  "https://wa.me/221701193811"
                ],
                "serviceArea": [
                  {
                    "@type": "Place",
                    "name": "Sénégal"
                  },
                  {
                    "@type": "Place", 
                    "name": "Maroc"
                  }
                ],
                "hasOfferCatalog": {
                  "@type": "OfferCatalog",
                  "name": "Services IA et Automatisation",
                  "itemListElement": [
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Automatisation WhatsApp Business",
                        "description": "Chatbots intelligents pour WhatsApp Business avec IA conversationnelle"
                      }
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "Sites Web Ultra-Rapides",
                        "description": "Développement de sites web optimisés <1.5s de chargement"
                      }
                    },
                    {
                      "@type": "Offer",
                      "itemOffered": {
                        "@type": "Service",
                        "name": "IA Conversationnelle",
                        "description": "Chatbots multilingues avec analytics avancés"
                      }
                    }
                  ]
                }
              })
            }}
          />
          
          {/* Schema pour les avis clients */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "AggregateRating",
                "itemReviewed": {
                  "@type": "Organization",
                  "name": "OMA Digital"
                },
                "ratingValue": "4.9",
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": "150"
              })
            }}
          />
        </Head>

        {/* Header sécurisé */}
        <SecureHeader />
        
        {/* Contenu principal avec espacement pour le header fixe */}
        <div className="pt-16 md:pt-20">
          <OptimizedLandingPage />
        </div>
        
        {/* Footer */}
        <Footer />
        
        {/* Chatbot - Chargé en dernier pour ne pas impacter les performances */}
        <Suspense fallback={null}>
          <SmartChatbotNext />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
});

// Props statiques pour l'optimisation
export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
    revalidate: 3600 // Revalidation toutes les heures
  };
};

OptimizedHomePage.displayName = 'OptimizedHomePage';

export default OptimizedHomePage;