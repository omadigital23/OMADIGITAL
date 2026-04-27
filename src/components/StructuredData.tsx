export default function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'OMA Digital',
    description: "Agence d'automatisation IA au Sénégal. Création de sites web, applications mobiles et solutions d'automatisation.",
    url: 'https://www.omadigital.net',
    telephone: '+212701193811',
    email: 'support@omadigital.net',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Thiès',
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
      name: 'Services digitaux',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Création de Sites Web',
            description: 'Sites vitrines, e-commerce et applications web au Sénégal',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Applications Mobiles',
            description: 'Applications iOS et Android sur mesure',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Automatisation IA',
            description: "Chatbots intelligents et automatisation des workflows",
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
