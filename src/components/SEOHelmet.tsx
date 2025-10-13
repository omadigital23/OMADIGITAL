import React from 'react';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  blogPostSchema?: any; // Add this for blog post structured data
}

export function SEOHelmet({
  title = "OMA Digital - Automatisation IA & Sites Ultra-Rapides PME Dakar Sénégal",
  description = "Transformez votre PME sénégalaise avec nos solutions IA : WhatsApp automatisé, sites ultra-rapides <1.5s, chatbots français. +200% ROI en 6 mois. Liberté 6, Dakar.",
  keywords = "automatisation PME Dakar, IA Sénégal, WhatsApp Business automatique, site web rapide Dakar, chatbot français, transformation digitale PME africaine",
  image = "https://images.unsplash.com/photo-1570566920413-fd6410fec24c?w=1200&h=630&fit=crop",
  url = "https://oma-digital.sn",
  type = "website",
  blogPostSchema // Add this parameter
}: SEOHelmetProps) {
  
  React.useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: 'OMA Digital Dakar' },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'googlebot', content: 'index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'format-detection', content: 'telephone=yes, email=yes, address=yes' },
      { name: 'theme-color', content: '#f97316' },
      { name: 'msapplication-TileColor', content: '#f97316' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: 'OMA Digital' },
      
      // Geo Tags
      { name: 'geo.region', content: 'SN-DK' },
      { name: 'geo.placename', content: 'Dakar, Sénégal' },
      { name: 'geo.position', content: '14.6928;-17.4467' },
      { name: 'ICBM', content: '14.6928, -17.4467' },
      
      // Business Info
      { name: 'contact', content: 'omasenegal25@gmail.com' },
      { name: 'phone', content: '+212701193811' },
      { name: 'address', content: 'Liberté 6 Extension, Dakar, Sénégal' },
      
      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { property: 'og:locale', content: 'fr_SN' },
      { property: 'og:site_name', content: 'OMA Digital' },
      
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      { name: 'twitter:site', content: '@OMADigitalSN' },
      { name: 'twitter:creator', content: '@OMADigitalSN' }
    ];
    
    metaTags.forEach(tag => {
      const key = tag.name || tag.property;
      const value = tag.content;
      
      let existingTag = document.querySelector(`meta[name="${key}"]`) || 
                       document.querySelector(`meta[property="${key}"]`);
      
      if (existingTag) {
        existingTag.setAttribute('content', value);
      } else {
        const newTag = document.createElement('meta');
        if (tag.name) newTag.setAttribute('name', tag.name);
        if (tag.property) newTag.setAttribute('property', tag.property);
        newTag.setAttribute('content', value);
        document.head.appendChild(newTag);
      }
    });
    
    // Add structured data with multiple schemas for better SEO
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "OMA Digital",
      "alternateName": "OMA Digital Sénégal",
      "url": "https://oma-digital.sn",
      "logo": "https://oma-digital.sn/images/logo.webp",
      "description": "Spécialiste automatisation IA et transformation digitale pour PME sénégalaises",
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
        "https://wa.me/212701193811",
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
      "slogan": "Transformez votre PME avec l'IA - ROI +200% garanti",
      "priceRange": "$",
      "currenciesAccepted": "XOF, EUR, USD",
      "paymentAccepted": "Cash, Credit Card, Bank Transfer, Mobile Money"
    };

    // Website schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "OMA Digital - Automatisation IA PME Dakar",
      "url": "https://oma-digital.sn",
      "description": "Solutions d'automatisation IA pour PME sénégalaises",
      "inLanguage": "fr-SN",
      "copyrightYear": "2025",
      "copyrightHolder": {
        "@type": "Organization",
        "name": "OMA Digital"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://oma-digital.sn/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    // Local Business schema for better local SEO
    const localBusinessSchema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "OMA Digital",
      "description": "Automatisation IA et transformation digitale pour PME à Dakar",
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
      "telephone": "+212701193811",
      "email": "omasenegal25@gmail.com",
      "url": "https://oma-digital.sn",
      "openingHours": "Mo-Sa 08:00-18:00",
      "priceRange": "$",
      "areaServed": [
        {
          "@type": "City",
          "name": "Dakar"
        },
        {
          "@type": "Country", 
          "name": "Sénégal"
        }
      ],
      "serviceType": "Transformation digitale PME",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Services OMA Digital",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Automatisation WhatsApp Business",
              "description": "Chatbots intelligents pour WhatsApp avec réponses automatiques 24/7"
            }
          },
          {
            "@type": "Offer", 
            "itemOffered": {
              "@type": "Service",
              "name": "Sites Web Ultra-Rapides",
              "description": "Sites web performants <1.5s optimisés SEO mobile-first"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service", 
              "name": "Intelligence Artificielle Conversationnelle",
              "description": "Assistants IA personnalisés en français"
            }
          }
        ]
      }
    };

    // Blog schema (if provided)
    const schemas = [organizationSchema, websiteSchema, localBusinessSchema];
    
    // Add blog post schema if provided
    if (blogPostSchema) {
      schemas.push(blogPostSchema);
    }

    // Combine all schemas
    const structuredData = schemas;
    
    // Add or update structured data scripts
    // Remove existing structured data scripts
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => {
      if (script.id && script.id.startsWith('structured-data')) {
        script.remove();
      }
    });

    // Add new structured data scripts
    structuredData.forEach((schema, index) => {
      const script = document.createElement('script');
      script.id = `structured-data-${index}`;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(schema, null, 2); // Pretty print for debugging
      document.head.appendChild(script);
    });
    
    // Add canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) {
      canonicalTag.setAttribute('href', url);
    } else {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = url;
      document.head.appendChild(canonical);
    }
    
  }, [title, description, keywords, image, url, type, blogPostSchema]);
  
  return null; // This component doesn't render anything
}

export default SEOHelmet;