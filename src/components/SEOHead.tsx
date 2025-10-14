import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  noindex?: boolean;
  canonical?: string;
  structuredData?: object;
}

/**
 * SEO Head component optimized for Senegal and Morocco markets
 * Includes local business schema, hreflang, and market-specific optimization
 */
export function SEOHead({
  title,
  description,
  keywords,
  image = '/images/og-image.svg',
  noindex = false,
  canonical,
  structuredData
}: SEOHeadProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  
  const currentLanguage = i18n?.language || 'fr';
  const baseUrl = 'https://www.omadigital.net';
  const currentUrl = `${baseUrl}${router.asPath}`;
  
  // SEO-optimized titles and descriptions for Senegal/Morocco with enhanced keywords
  const seoTitle = title || t('seo.title', 'OMA Digital - Solutions IA & Chatbot Vocal Intelligent | Automatisation WhatsApp Business Sénégal Maroc | Sites Web Ultra-Rapides');
  const seoDescription = description || t('seo.description', '🚀 Transformez votre PME avec nos solutions IA au Sénégal et Maroc : Chatbot vocal multilingue (FR/EN/AR), automatisation WhatsApp Business, sites web ultra-rapides Next.js, intégration Vertex AI. Devis gratuit 24h. +221 70 119 38 11');
  const seoKeywords = keywords || t('seo.keywords', 'chatbot vocal intelligent Sénégal, automatisation WhatsApp Business Maroc, IA conversationnelle Dakar, assistant virtuel multilingue Casablanca, transformation digitale PME Afrique, développement web Next.js Sénégal, Vertex AI chatbot francophone, sites web rapides Maroc, intelligence artificielle entreprise Thiès, solutions IA abordables Afrique Ouest, chatbot français arabe wolof, automatisation service client Sénégal, agence digitale IA Casablanca, développement application web Dakar, chatbot WhatsApp API Maroc');

  // Local business structured data for both markets
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "OMA Digital",
    "description": "Solutions IA et automatisation pour entreprises au Sénégal et Maroc",
    "url": baseUrl,
    "logo": `${baseUrl}/images/logo.webp`,
    "image": `${baseUrl}${image}`,
    "telephone": "+221701193811",
    "email": "omadigital23@gmail.com",
    "priceRange": "$$",
    "currenciesAccepted": ["XOF", "MAD", "EUR"],
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
    "areaServed": [
      {
        "@type": "Country",
        "name": "Senegal",
        "alternateName": "Sénégal"
      },
      {
        "@type": "Country", 
        "name": "Morocco",
        "alternateName": "Maroc"
      }
    ],
    "address": [
      {
        "@type": "PostalAddress",
        "streetAddress": "Hersent Rue 15",
        "addressLocality": "Thies",
        "addressCountry": "SN",
        "addressRegion": "Thiès"
      },
      {
        "@type": "PostalAddress",
        "streetAddress": "Moustakbal/Sidimaarouf Casablanca, Imm 167 Lot GH20 apt 15",
        "addressLocality": "Casablanca",
        "addressCountry": "MA",
        "addressRegion": "Casablanca-Settat"
      }
    ],
    "geo": [
      {
        "@type": "GeoCoordinates",
        "latitude": "14.7889",
        "longitude": "-16.9281"
      },
      {
        "@type": "GeoCoordinates", 
        "latitude": "33.5731",
        "longitude": "-7.5898"
      }
    ],
    "openingHours": "Mo-Fr 08:00-18:00, Sa 09:00-13:00",
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": "20.0",
        "longitude": "-10.0"
      },
      "geoRadius": "2000000"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services IA et Automatisation",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Automatisation WhatsApp Business",
            "description": "Chatbots intelligents pour WhatsApp Business au Sénégal et Maroc"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Sites Web Ultra-Rapides",
            "description": "Développement de sites web performants optimisés pour l'Afrique de l'Ouest"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "IA Conversationnelle",
            "description": "Solutions d'intelligence artificielle pour entreprises africaines"
          }
        }
      ]
    },
    "sameAs": [
      "https://www.omadigital.net/blog",
      "https://wa.me/221701193811",
      "https://web.facebook.com/profile.php?id=61579740432372",
      "https://x.com/omadigital23",
      "https://www.instagram.com/omadigital123",
      "https://www.tiktok.com/@omadigital23"
    ]
  };

  // Organization schema for brand authority
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "OMA Digital",
    "alternateName": ["OMA Digital Sénégal", "OMA Digital Maroc"],
    "url": baseUrl,
    "logo": `${baseUrl}/images/logo.webp`,
    "description": "Leader en solutions IA et automatisation pour PME au Sénégal et Maroc",
    "foundingDate": "2023",
    "founders": [
      {
        "@type": "Person",
        "name": "Équipe OMA Digital"
      }
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+221701193811",
        "contactType": "customer service",
        "areaServed": ["SN", "MA"],
        "availableLanguage": ["French", "Arabic", "Wolof"]
      }
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Hersent Rue 15",
      "addressLocality": "Thies", 
      "addressCountry": "SN"
    },
    "serviceArea": [
      {
        "@type": "Country",
        "name": "Senegal"
      },
      {
        "@type": "Country",
        "name": "Morocco" 
      }
    ]
  };

  // Combine schemas
  const combinedSchema = structuredData || {
    "@context": "https://schema.org",
    "@graph": [localBusinessSchema, organizationSchema]
  };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="keywords" content={seoKeywords} />
      <meta name="author" content="OMA Digital" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || currentUrl} />
      
      {/* Hreflang for multilingual SEO */}
      <link rel="alternate" hrefLang="fr" href={`${baseUrl}${router.asPath}`} />
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${router.asPath}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${router.asPath}`} />
      
      {/* Geographic targeting for Senegal/Morocco */}
      <meta name="geo.region" content="SN" />
      <meta name="geo.placename" content="Senegal, Morocco" />
      <meta name="geo.position" content="14.7889;-16.9281" />
      <meta name="ICBM" content="14.7889, -16.9281" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={`${baseUrl}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={currentLanguage === 'en' ? 'en_US' : 'fr_FR'} />
      <meta property="og:site_name" content="OMA Digital" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={`${baseUrl}${image}`} />
      
      {/* Business-specific meta tags for local SEO */}
      <meta name="business:contact_data:street_address" content="Hersent Rue 15, Thies, Sénégal" />
      <meta name="business:contact_data:locality" content="Thies" />
      <meta name="business:contact_data:region" content="Thiès" />
      <meta name="business:contact_data:postal_code" content="21000" />
      <meta name="business:contact_data:country_name" content="Senegal" />
      <meta name="business:contact_data:phone_number" content="+221701193811" />
      <meta name="business:contact_data:email" content="omadigital23@gmail.com" />
      <meta name="business:contact_data:website" content="https://omadigital.net" />
      
      {/* Additional SEO meta tags for African markets */}
      <meta name="target-market" content="Senegal, Morocco, West Africa" />
      <meta name="service-area" content="Dakar, Thies, Casablanca, Rabat" />
      <meta name="business-type" content="Digital Agency, AI Solutions, Web Development" />
      <meta name="currency" content="XOF, MAD" />
      <meta name="language" content="French, Arabic" />
      
      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/logo.webp" />
      <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.webp" />
      <link rel="icon" type="image/png" sizes="16x16" href="/images/logo.webp" />
      
      {/* Manifest for PWA */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#f97316" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://www.googletagmanager.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(combinedSchema)
        }}
      />
    </Head>
  );
}