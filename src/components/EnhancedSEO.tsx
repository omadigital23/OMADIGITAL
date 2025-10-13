import Head from 'next/head';
import { useRouter } from 'next/router';

interface EnhancedSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
  alternateLanguages?: Array<{ hreflang: string; href: string }>;
}

/**
 * Enhanced SEO component specifically optimized for omadigital.net
 * Includes advanced structured data, hreflang, and performance optimizations
 */
export function EnhancedSEO({
  title = 'OMA Digital - Solutions IA et Automatisation au Sénégal et Maroc',
  description = 'Transformez votre entreprise avec nos solutions IA au Sénégal et Maroc. Automatisation WhatsApp Business, sites web ultra-rapides, chatbots intelligents.',
  keywords = 'automatisation WhatsApp Sénégal, sites web rapides Maroc, IA entreprise Dakar, chatbot WhatsApp Casablanca',
  image = 'https://omadigital.net/images/og-image.svg',
  url,
  type = 'website',
  locale = 'fr_FR',
  alternateLanguages
}: EnhancedSEOProps) {
  const router = useRouter();
  const currentUrl = url || `https://omadigital.net${router.asPath}`;
  
  // Enhanced structured data for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://omadigital.net/#website",
        "url": "https://omadigital.net/",
        "name": "OMA Digital",
        "description": "Solutions IA et automatisation pour PME au Sénégal et Maroc",
        "publisher": {
          "@id": "https://omadigital.net/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://omadigital.net/#organization",
        "name": "OMA Digital",
        "url": "https://omadigital.net/",
        "logo": {
          "@type": "ImageObject",
          "@id": "https://omadigital.net/#logo",
          "url": "https://omadigital.net/images/logo.webp",
          "width": 800,
          "height": 600,
          "caption": "OMA Digital"
        },
        "sameAs": [
          "https://www.linkedin.com/company/oma-digital-senegal",
          "https://www.facebook.com/OMADigitalSN",
          "https://twitter.com/OMADigitalSN"
        ],
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+221701193811",
            "contactType": "customer service",
            "availableLanguage": ["fr", "en", "ar"]
          }
        ]
      }
    ]
  };

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="OMA Digital" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="theme-color" content="#f97316" />
      
      {/* Canonical and Hreflang */}
      <link rel="canonical" href={currentUrl} />
      {alternateLanguages?.map((alt, index) => (
        <link key={index} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
      ))}
      <link rel="alternate" hrefLang="x-default" href="https://omadigital.net/" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content="OMA Digital" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Geo and Business Tags */}
      <meta name="geo.region" content="SN" />
      <meta name="geo.placename" content="Thies, Senegal" />
      <meta name="geo.position" content="14.7889;-16.9281" />
      <meta name="ICBM" content="14.7889, -16.9281" />
      
      {/* Mobile and Performance */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="format-detection" content="telephone=yes" />
      
      {/* Icons and Manifest */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/logo.webp" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    </Head>
  );
}