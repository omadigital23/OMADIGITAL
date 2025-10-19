import { DefaultSeoProps } from 'next-seo';

const config: DefaultSeoProps = {
  titleTemplate: '%s | OMA Digital - Chatbot Vocal IA & Automatisation WhatsApp Business',
  defaultTitle: 'OMA Digital - Chatbot Vocal Intelligent & Automatisation WhatsApp Business | Solutions IA Sénégal Maroc',
  description: '🚀 Leader en solutions IA au Sénégal & Maroc : Chatbot vocal multilingue (FR/EN/AR), automatisation WhatsApp Business API, sites web ultra-rapides Next.js, intégration Vertex AI Google. +150 PME accompagnées. Devis gratuit 24h. ☎️ +212 70 119 38 11',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://omadigital.net',
    siteName: 'OMA Digital',
    title: 'OMA Digital - Solutions IA pour PME au Sénégal et au Maroc',
    description: 'Automatisation WhatsApp, sites ultra-rapides, IA conversationnelle. 150+ clients PME, ROI +200%. Spécialiste transformation digitale Dakar, Thies, Casablanca, Rabat, Marrakech.',
    images: [
      {
        url: '/images/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'OMA Digital - Solutions IA & Automatisation pour PME au Sénégal et au Maroc',
        type: 'image/svg+xml',
      },
      {
        url: '/images/logo.webp',
        width: 800,
        height: 600,
        alt: 'Logo OMA Digital',
        type: 'image/webp',
      }
    ],
  },
  
  // Twitter
  twitter: {
    handle: '@OMADigitalSN',
    site: '@OMADigitalSN',
    cardType: 'summary_large_image',
  },
  
  // Additional Meta Tags
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'chatbot vocal intelligent Sénégal, chatbot vocal Maroc, automatisation WhatsApp Business API Dakar, WhatsApp Business automatique Casablanca, IA conversationnelle multilingue, assistant virtuel français arabe wolof, Vertex AI chatbot Sénégal, Google AI chatbot Maroc, chatbot reconnaissance vocale Dakar, speech to text Sénégal, text to speech Maroc, automatisation service client WhatsApp, chatbot PME Afrique, intelligence artificielle Thiès, IA entreprise Casablanca, développement web Next.js Sénégal, sites web ultra-rapides Maroc, agence digitale IA Dakar, transformation digitale PME africaine, solutions IA abordables Sénégal, chatbot multilingue Casablanca, automatisation PME Rabat, chatbot vocal Marrakech, développement application web Dakar, intégration API WhatsApp Business, chatbot Supabase Sénégal, backend Node.js Maroc, frontend React Sénégal, SEO local Dakar, référencement Google Casablanca, marketing digital IA Sénégal, agence web Thiès, développeur chatbot Maroc'
    },
    {
      name: 'author',
      content: 'OMA Digital Dakar & Casablanca'
    },
    {
      name: 'robots',
      content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    },
    {
      name: 'googlebot',
      content: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1'
    },
    {
      name: 'bingbot',
      content: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, viewport-fit=cover'
    },
    {
      name: 'format-detection',
      content: 'telephone=yes, email=yes, address=yes'
    },
    {
      name: 'theme-color',
      content: '#f97316'
    },
    {
      name: 'msapplication-TileColor',
      content: '#f97316'
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'default'
    },
    {
      name: 'apple-mobile-web-app-title',
      content: 'OMA Digital'
    },
    
    // Geo Tags for Senegal - Enhanced
    {
      name: 'geo.region',
      content: 'SN-DK'
    },
    {
      name: 'geo.placename',
      content: 'Dakar, Sénégal'
    },
    {
      name: 'geo.position',
      content: '14.6928;-17.4467'
    },
    {
      name: 'ICBM',
      content: '14.6928, -17.4467'
    },
    
    // Additional Geo Tags for Thies, Senegal
    {
      name: 'geo.region',
      content: 'SN-TH'
    },
    {
      name: 'geo.placename',
      content: 'Thies, Sénégal'
    },
    {
      name: 'geo.position',
      content: '14.7646;-16.9394'
    },
    {
      name: 'ICBM',
      content: '14.7646, -16.9394'
    },
    
    // Geo Tags for Morocco - Enhanced
    {
      name: 'geo.region',
      content: 'MA-CAS'
    },
    {
      name: 'geo.placename',
      content: 'Casablanca, Maroc'
    },
    {
      name: 'geo.position',
      content: '33.5731;-7.5898'
    },
    {
      name: 'ICBM',
      content: '33.5731, -7.5898'
    },
    
    // Additional Geo Tags for Rabat, Morocco
    {
      name: 'geo.region',
      content: 'MA-RAB'
    },
    {
      name: 'geo.placename',
      content: 'Rabat, Maroc'
    },
    {
      name: 'geo.position',
      content: '34.0209;-6.8416'
    },
    {
      name: 'ICBM',
      content: '34.0209, -6.8416'
    },
    
    // Additional Geo Tags for Marrakech, Morocco
    {
      name: 'geo.region',
      content: 'MA-MAR'
    },
    {
      name: 'geo.placename',
      content: 'Marrakech, Maroc'
    },
    {
      name: 'geo.position',
      content: '31.6295;-7.9811'
    },
    {
      name: 'ICBM',
      content: '31.6295, -7.9811'
    },
    
    // Business Info
    {
      name: 'contact',
      content: 'omadigital23@gmail.com'
    },
    {
      name: 'phone',
      content: '+212701193811'
    },
    {
      name: 'address',
      content: 'Hersent Rue 15, Thies, Sénégal | Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt 15, Maroc'
    },
  ],
  
  // Additional Link Tags
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/images/logo.webp',
      type: 'image/webp'
    },
    {
      rel: 'apple-touch-icon',
      href: '/images/logo.webp',
      sizes: '180x180'
    },
    {
      rel: 'manifest',
      href: '/manifest.json'
    },
    {
      rel: 'canonical',
      href: 'https://omadigital.net'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://www.googletagmanager.com'
    },
    {
      rel: 'preconnect',
      href: 'https://pcedyohixahtfogfdlig.supabase.co'
    },
    {
      rel: 'dns-prefetch',
      href: '//fonts.googleapis.com'
    },
    {
      rel: 'dns-prefetch',
      href: '//www.google-analytics.com'
    }
  ]
};

export default config;