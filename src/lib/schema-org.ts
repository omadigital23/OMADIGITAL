export interface SchemaOrgProps {
  url?: string;
  title?: string;
  description?: string;
  images?: string[];
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
}

// Organization Schema for OMA Digital
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OMA Digital",
  "alternateName": "OMA Digital Sénégal",
  "url": "https://oma-digital.sn",
  "logo": "https://oma-digital.sn/images/logo.webp",
  "image": "https://oma-digital.sn/images/logo.webp",
  "description": "Spécialiste en automatisation IA et transformation digitale pour PME sénégalaises. Solutions WhatsApp automatisé, sites ultra-rapides, chatbots intelligents.",
  "email": "omasenegal25@gmail.com",
  "telephone": "+212701193811",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Liberté 6 Extension",
    "addressLocality": "Dakar",
    "addressRegion": "Dakar",
    "postalCode": "10700",
    "addressCountry": "SN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "14.6928",
    "longitude": "-17.4467"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+212701193811",
      "contactType": "Service Client",
      "availableLanguage": ["French"],
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "08:00",
        "closes": "18:00"
      }
    }
  ],
  "sameAs": [
    `https://wa.me/212701193811`,
    "https://www.linkedin.com/company/oma-digital-senegal",
    "https://web.facebook.com/OMADigitalSenegal"
  ],
  "areaServed": {
    "@type": "Place",
    "name": "Sénégal",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "SN"
    }
  },
  "serviceArea": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": "14.6928",
      "longitude": "-17.4467"
    },
    "geoRadius": "50000"
  },
  "knowsAbout": [
    "Automatisation WhatsApp Business",
    "Intelligence Artificielle conversationnelle",
    "Sites web ultra-rapides",
    "Transformation digitale PME",
    "Chatbots multilingues",
    "SEO local Sénégal",
    "Analytics business intelligence",
    "Sécurité digitale"
  ],
  "foundingDate": "2023-01-01",
  "foundingLocation": {
    "@type": "Place",
    "name": "Dakar, Sénégal"
  },
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": "15"
  },
  "slogan": "Transformez votre PME avec l'IA - ROI +200% garanti"
};

// Local Business Schema
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://oma-digital.sn/#LocalBusiness",
  "name": "OMA Digital",
  "description": "Solutions d'automatisation et d'intelligence artificielle pour PME sénégalaises",
  "image": "https://oma-digital.sn/images/logo.webp",
  "telephone": "+212701193811",
  "email": "omasenegal25@gmail.com",
  "url": "https://oma-digital.sn",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Liberté 6 Extension", 
    "addressLocality": "Dakar",
    "addressRegion": "Dakar",
    "postalCode": "10700",
    "addressCountry": "SN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "14.6928",
    "longitude": "-17.4467"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification", 
      "dayOfWeek": "Saturday",
      "opens": "09:00",
      "closes": "15:00"
    }
  ],
  "priceRange": "€€",
  "currenciesAccepted": "XOF, EUR, USD",
  "paymentAccepted": "Cash, Credit Card, Bank Transfer, Mobile Money"
};

// Website Schema
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://oma-digital.sn/#website",
  "url": "https://oma-digital.sn",
  "name": "OMA Digital",
  "description": "Plateforme digitale spécialisée en automatisation IA pour PME sénégalaises",
  "publisher": {
    "@id": "https://oma-digital.sn/#organization"
  },
  "potentialAction": [
    {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://oma-digital.sn/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  ],
  "inLanguage": "fr-SN"
};

// Service Schema
export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Solutions d'automatisation IA pour PME",
  "description": "Services complets de transformation digitale : WhatsApp automatisé, sites ultra-rapides, chatbots IA, analytics avancées pour PME sénégalaises",
  "provider": {
    "@id": "https://oma-digital.sn/#organization"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Sénégal"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Services OMA Digital",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Automatisation WhatsApp Business",
          "description": "Configuration et automatisation complète de WhatsApp Business pour PME"
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
          "name": "Chatbots IA Multilingues",
          "description": "Chatbots intelligents français avec IA conversationnelle"
        }
      }
    ]
  }
};

// FAQ Schema
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Combien coûtent vos services d'automatisation ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nos tarifs débutent à partir de 150 000 FCFA pour une automatisation WhatsApp basique. Nous proposons des solutions sur mesure adaptées à votre budget et besoins spécifiques. Contactez-nous pour un devis personnalisé gratuit."
      }
    },
    {
      "@type": "Question", 
      "name": "En combien de temps puis-je voir des résultats ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nos clients constatent généralement une amélioration de 30-50% de leur productivité dans les 2 premières semaines. Le ROI complet (+200% en moyenne) est atteint sous 3-6 mois selon le secteur d'activité."
      }
    },
    {
      "@type": "Question",
      "name": "Proposez-vous un support en plusieurs langues ?", 
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oui, notre équipe basée à Dakar maîtrise parfaitement le français. Nos chatbots peuvent également être configurés pour répondre dans différentes langues selon vos besoins clients."
      }
    },
    {
      "@type": "Question",
      "name": "Vos solutions fonctionnent-elles avec les opérateurs sénégalais ?",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "Absolument ! Nos solutions sont optimisées pour Orange, Free, Expresso et tous les opérateurs locaux. Nous testons spécifiquement la compatibilité avec l'infrastructure télécom sénégalaise."
      }
    }
  ]
};

// Article Schema Generator
export function generateArticleSchema(props: SchemaOrgProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": props.title,
    "description": props.description,
    "image": props.images || ["https://oma-digital.sn/images/logo.webp"],
    "author": {
      "@type": "Organization",
      "name": props.authorName || "OMA Digital",
      "url": "https://oma-digital.sn"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "OMA Digital",
      "logo": {
        "@type": "ImageObject",
        "url": "https://oma-digital.sn/images/logo.webp"
      }
    },
    "datePublished": props.datePublished,
    "dateModified": props.dateModified || props.datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": props.url
    },
    "inLanguage": "fr-SN",
    "about": [
      "Automatisation PME",
      "Intelligence Artificielle", 
      "Transformation digitale Sénégal"
    ]
  };
}

// Breadcrumb Schema Generator  
export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
}

// Combined Schema for Homepage
export const homepageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema,
    localBusinessSchema, 
    websiteSchema,
    serviceSchema,
    faqSchema
  ]
};