import { BUSINESS } from '@/lib/constants';

export default function StructuredData({ locale }: { locale: string }) {
  const isEnglish = locale === 'en';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: BUSINESS.name,
    description: isEnglish
      ? 'AI automation agency in Senegal. Websites, mobile apps and practical automation systems.'
      : "Agence d'automatisation IA au Senegal. Creation de sites web, applications mobiles et solutions d'automatisation.",
    url: BUSINESS.siteUrl,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: BUSINESS.location.city,
      addressCountry: 'SN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 14.7886,
      longitude: -16.9262,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
    priceRange: '$$',
    sameAs: [
      'https://facebook.com/omadigital',
      'https://instagram.com/omadigital',
      'https://linkedin.com/company/omadigital',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: isEnglish ? 'Digital services' : 'Services digitaux',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: isEnglish ? 'Website Creation' : 'Creation de Sites Web',
            description: isEnglish
              ? 'Business websites, e-commerce and web applications in Senegal'
              : 'Sites vitrines, e-commerce et applications web au Senegal',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: isEnglish ? 'Mobile Applications' : 'Applications Mobiles',
            description: isEnglish
              ? 'Custom iOS and Android applications'
              : 'Applications iOS et Android sur mesure',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: isEnglish ? 'AI Automation' : 'Automatisation IA',
            description: isEnglish
              ? 'Intelligent chatbots and workflow automation'
              : 'Chatbots intelligents et automatisation des workflows',
          },
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
