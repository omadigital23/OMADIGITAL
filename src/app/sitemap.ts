import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.omadigital.net';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['fr', 'en'];
  const pages = [
    '',
    '/pricing',
    '/contact',
    '/blog',
    '/creation-site-web-senegal',
    '/creation-site-web-dakar',
    '/creation-site-web-thies',
    '/application-mobile-senegal',
    '/automatisation-ia-senegal',
  ];
  const localizedPages: Record<string, string[]> = {
    fr: [
      '/depannage-logiciel-configuration-appareils',
      '/creation-site-web-campbell-river',
      '/application-mobile-campbell-river',
      '/automatisation-ia-campbell-river',
    ],
    en: [
      '/software-troubleshooting-device-setup',
      '/website-design-campbell-river',
      '/mobile-app-development-campbell-river',
      '/ai-automation-campbell-river',
    ],
  };
  const localizedAlternates = [
    {
      fr: '/depannage-logiciel-configuration-appareils',
      en: '/software-troubleshooting-device-setup',
    },
    {
      fr: '/creation-site-web-campbell-river',
      en: '/website-design-campbell-river',
    },
    {
      fr: '/application-mobile-campbell-river',
      en: '/mobile-app-development-campbell-river',
    },
    {
      fr: '/automatisation-ia-campbell-river',
      en: '/ai-automation-campbell-river',
    },
  ];

  const blogSlugs = [
    'creer-site-web-professionnel-senegal',
    'automatisation-ia-guide-entreprises-senegalaises',
    'application-mobile-entreprise-senegal',
    'ecommerce-senegal-vendre-en-ligne',
  ];

  const entries: MetadataRoute.Sitemap = [];
  const alternateFor = (locale: string, page: string) => {
    const localizedPair = localizedAlternates.find((pair) => pair[locale as 'fr' | 'en'] === page);
    const paths = localizedPair ?? { fr: page, en: page };

    return {
      languages: {
        fr: `${BASE_URL}/fr${paths.fr}`,
        en: `${BASE_URL}/en${paths.en}`,
        'x-default': `${BASE_URL}/fr${paths.fr}`,
      },
    };
  };

  for (const locale of locales) {
    for (const page of [...pages, ...(localizedPages[locale] ?? [])]) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : 0.8,
        alternates: alternateFor(locale, page),
      });
    }

    for (const slug of blogSlugs) {
      const page = `/blog/${slug}`;

      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: alternateFor(locale, page),
      });
    }
  }

  return entries;
}
