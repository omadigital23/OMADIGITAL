/**
 * Advanced SEO Optimizer for OMA Digital
 * - Dynamic meta generation
 * - Structured data (Schema.org)
 * - Local SEO optimization
 * - Multilingual SEO
 * - Core Web Vitals optimization
 */

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogImage?: string;
  structuredData?: any;
  localBusiness?: LocalBusinessData;
  alternateLanguages?: Array<{ hreflang: string; href: string }>;
}

interface LocalBusinessData {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  email: string;
  url: string;
  geo: {
    latitude: number;
    longitude: number;
  };
  openingHours: string[];
  priceRange: string;
  serviceArea: string[];
}

class SEOOptimizer {
  private baseUrl: string;
  private defaultLanguage: string = 'fr';
  private supportedLanguages: string[] = ['fr', 'en'];
  
  constructor(baseUrl: string = 'https://omadigital.net') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate comprehensive SEO meta tags
   */
  generateMetaTags(data: SEOData, currentPath: string = '/'): string {
    const canonical = data.canonical || `${this.baseUrl}${currentPath}`;
    const ogImage = data.ogImage || `${this.baseUrl}/images/og-default.jpg`;
    
    return `
      <!-- Primary Meta Tags -->
      <title>${data.title}</title>
      <meta name="title" content="${data.title}" />
      <meta name="description" content="${data.description}" />
      <meta name="keywords" content="${data.keywords.join(', ')}" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="${this.defaultLanguage}" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="OMA Digital" />
      <link rel="canonical" href="${canonical}" />
      
      <!-- Open Graph Meta Tags -->
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${canonical}" />
      <meta property="og:title" content="${data.title}" />
      <meta property="og:description" content="${data.description}" />
      <meta property="og:image" content="${ogImage}" />
      <meta property="og:site_name" content="OMA Digital" />
      <meta property="og:locale" content="fr_SN" />
      
      <!-- Twitter Meta Tags -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="${canonical}" />
      <meta name="twitter:title" content="${data.title}" />
      <meta name="twitter:description" content="${data.description}" />
      <meta name="twitter:image" content="${ogImage}" />
      <meta name="twitter:creator" content="@OMADigitalSN" />
      
      <!-- Alternate Languages -->
      ${this.generateAlternateLanguages(data.alternateLanguages, currentPath)}
      
      <!-- Local Business Schema -->
      ${data.localBusiness ? this.generateLocalBusinessSchema(data.localBusiness) : ''}
      
      <!-- Additional Structured Data -->
      ${data.structuredData ? `<script type="application/ld+json">${JSON.stringify(data.structuredData)}</script>` : ''}
    `.trim();
  }

  /**
   * Generate alternate language links
   */
  private generateAlternateLanguages(alternates?: Array<{ hreflang: string; href: string }>, currentPath: string = '/'): string {
    if (!alternates) {
      // Generate default alternates
      alternates = this.supportedLanguages.map(lang => ({
        hreflang: lang === 'fr' ? 'fr-SN' : lang,
        href: `${this.baseUrl}${currentPath}`
      }));
    }
    
    return alternates
      .map(alt => `<link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`)
      .join('\n      ');
  }

  /**
   * Generate Local Business structured data
   */
  generateLocalBusinessSchema(business: LocalBusinessData): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": business.name,
      "image": `${this.baseUrl}/images/logo.webp`,
      "url": business.url,
      "telephone": business.telephone,
      "email": business.email,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": business.address.streetAddress,
        "addressLocality": business.address.addressLocality,
        "addressRegion": business.address.addressRegion,
        "postalCode": business.address.postalCode,
        "addressCountry": business.address.addressCountry
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": business.geo.latitude,
        "longitude": business.geo.longitude
      },
      "openingHoursSpecification": business.openingHours.map(hours => ({
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": this.parseDayOfWeek(hours),
        "opens": this.parseOpenTime(hours),
        "closes": this.parseCloseTime(hours)
      })),
      "priceRange": business.priceRange,
      "areaServed": business.serviceArea.map(area => ({
        "@type": "City",
        "name": area
      })),
      "serviceType": [
        "Automatisation WhatsApp",
        "Sites Web",
        "Intelligence Artificielle",
        "Transformation Digitale",
        "Marketing Digital"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "127"
      }
    };

    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }

  /**
   * Generate Article structured data for blog posts
   */
  generateArticleSchema(article: {
    title: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified: string;
    image: string;
    url: string;
    wordCount: number;
    tags: string[];
  }): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "description": article.description,
      "image": article.image,
      "url": article.url,
      "datePublished": article.datePublished,
      "dateModified": article.dateModified,
      "author": {
        "@type": "Person",
        "name": article.author,
        "url": `${this.baseUrl}/about`
      },
      "publisher": {
        "@type": "Organization",
        "name": "OMA Digital",
        "logo": {
          "@type": "ImageObject",
          "url": `${this.baseUrl}/images/logo.webp`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": article.url
      },
      "wordCount": article.wordCount,
      "keywords": article.tags.join(", "),
      "articleSection": "Technology",
      "articleBody": article.description
    };

    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }

  /**
   * Generate Service structured data
   */
  generateServiceSchema(service: {
    name: string;
    description: string;
    provider: string;
    areaServed: string[];
    offers: Array<{
      name: string;
      description: string;
      price: string;
      currency: string;
    }>;
  }): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": service.name,
      "description": service.description,
      "provider": {
        "@type": "Organization",
        "name": service.provider,
        "url": this.baseUrl
      },
      "areaServed": service.areaServed.map(area => ({
        "@type": "City",
        "name": area
      })),
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Services Digitaux",
        "itemListElement": service.offers.map((offer, index) => ({
          "@type": "Offer",
          "position": index + 1,
          "itemOffered": {
            "@type": "Service",
            "name": offer.name,
            "description": offer.description
          },
          "price": offer.price,
          "priceCurrency": offer.currency,
          "availability": "https://schema.org/InStock"
        }))
      }
    };

    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }

  /**
   * Generate FAQ structured data
   */
  generateFAQSchema(faqs: Array<{ question: string; answer: string }>): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }

  /**
   * Generate Organization structured data
   */
  generateOrganizationSchema(): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "OMA Digital",
      "alternateName": "OMA Digital Sénégal",
      "url": this.baseUrl,
      "logo": `${this.baseUrl}/images/logo.webp`,
      "description": "Spécialiste en transformation digitale pour PME sénégalaises et marocaines. Solutions d'automatisation WhatsApp, sites web ultra-rapides et intelligence artificielle.",
      "email": "contact@oma-digital.com",
      "telephone": "+212 70 119 38 11",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Rue 123, Plateau",
        "addressLocality": "Dakar",
        "addressRegion": "Dakar",
        "postalCode": "12500",
        "addressCountry": "SN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 14.6937,
        "longitude": -17.4441
      },
      "sameAs": [
        "https://www.linkedin.com/company/oma-digital-senegal",
        "https://www.facebook.com/OMADigitalSN",
        "https://twitter.com/OMADigitalSN"
      ],
      "founder": {
        "@type": "Person",
        "name": "Fondateur OMA Digital"
      },
      "foundingDate": "2023",
      "numberOfEmployees": "10-50",
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
        "Développement Web",
        "Intelligence Artificielle",
        "Transformation Digitale",
        "Marketing Digital"
      ]
    };

    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }

  /**
   * Generate BreadcrumbList structured data
   */
  generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };

    return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
  }

  /**
   * Generate optimized meta description
   */
  generateMetaDescription(content: string, maxLength: number = 160): string {
    // Clean HTML tags
    const cleanContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (cleanContent.length <= maxLength) {
      return cleanContent;
    }
    
    // Find the last complete sentence that fits
    const sentences = cleanContent.split(/[.!?]+/);
    let description = '';
    
    for (const sentence of sentences) {
      const testDescription = description + sentence.trim() + '.';
      if (testDescription.length <= maxLength) {
        description = testDescription;
      } else {
        break;
      }
    }
    
    // If no complete sentence fits, truncate at word boundary
    if (!description) {
      const words = cleanContent.split(' ');
      description = words.slice(0, 25).join(' ');
      if (description.length > maxLength - 3) {
        description = description.substring(0, maxLength - 3) + '...';
      }
    }
    
    return description;
  }

  /**
   * Generate SEO-optimized keywords
   */
  generateKeywords(content: string, primaryKeywords: string[]): string[] {
    const stopWords = new Set([
      'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'mais',
      'donc', 'car', 'ni', 'or', 'dans', 'sur', 'avec', 'sans', 'pour',
      'par', 'vers', 'chez', 'entre', 'sous', 'over', 'the', 'and', 'or'
    ]);
    
    // Extract words from content
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    // Count word frequency
    const frequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get top keywords
    const topKeywords = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
    
    // Combine with primary keywords
    return [...primaryKeywords, ...topKeywords].slice(0, 15);
  }

  /**
   * Parse opening hours helpers
   */
  private parseDayOfWeek(hours: string): string {
    const days = {
      'lundi': 'Monday',
      'mardi': 'Tuesday', 
      'mercredi': 'Wednesday',
      'jeudi': 'Thursday',
      'vendredi': 'Friday',
      'samedi': 'Saturday',
      'dimanche': 'Sunday'
    };
    
    for (const [fr, en] of Object.entries(days)) {
      if (hours.toLowerCase().includes(fr)) {
        return en;
      }
    }
    
    return 'Monday';
  }

  private parseOpenTime(hours: string): string {
    const match = hours.match(/(\d{1,2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : '09:00';
  }

  private parseCloseTime(hours: string): string {
    const matches = hours.match(/(\d{1,2}):(\d{2})/g);
    return matches && matches.length > 1 ? matches[1] : '18:00';
  }
}

// Local business data for Senegal and Morocco
export const OMA_DIGITAL_BUSINESS_DATA: LocalBusinessData = {
  name: "OMA Digital",
  address: {
    streetAddress: "Rue 123, Plateau",
    addressLocality: "Dakar",
    addressRegion: "Dakar",
    postalCode: "12500",
    addressCountry: "SN"
  },
  telephone: "+212 70 119 38 11",
  email: "contact@oma-digital.com",
  url: "https://oma-digital.sn",
  geo: {
    latitude: 14.6937,
    longitude: -17.4441
  },
  openingHours: [
    "lundi 09:00-18:00",
    "mardi 09:00-18:00", 
    "mercredi 09:00-18:00",
    "jeudi 09:00-18:00",
    "vendredi 09:00-18:00"
  ],
  priceRange: "€€",
  serviceArea: [
    "Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor",
    "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger"
  ]
};

// Export singleton instance
export const seoOptimizer = new SEOOptimizer();

// React hook for dynamic SEO
export function useSEO(data: Partial<SEOData>, path?: string) {
  const fullData: SEOData = {
    title: "OMA Digital - Transformation Digitale PME Sénégal & Maroc",
    description: "Solutions d'automatisation WhatsApp, sites web ultra-rapides et IA pour PME. ROI garanti 200% en 6 mois.",
    keywords: ["automatisation WhatsApp", "transformation digitale", "IA PME", "Sénégal", "Maroc"],
    localBusiness: OMA_DIGITAL_BUSINESS_DATA,
    ...data
  };
  
  return {
    metaTags: seoOptimizer.generateMetaTags(fullData, path),
    structuredData: {
      organization: seoOptimizer.generateOrganizationSchema(),
      localBusiness: seoOptimizer.generateLocalBusinessSchema(fullData.localBusiness!),
    }
  };
}