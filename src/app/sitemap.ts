import type { MetadataRoute } from 'next';
import { blogCategorySlugs, blogPosts } from '@/data/blog-posts';
import { getSiteUrl } from '@/lib/site-url';

const BASE_URL = getSiteUrl();

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

  const blogPages = [
    ...blogCategorySlugs.map((category) => `/blog/${category}`),
    ...blogPosts.map((post) => `/blog/${post.slug}`),
  ];

  const entries: MetadataRoute.Sitemap = [];

  const alternateFor = (locale: string, page: string) => {
    const localizedPair = localizedAlternates.find(
      (pair) => pair[locale as 'fr' | 'en'] === page
    );
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
      // IMPORTANT : URL sans trailing slash pour éviter les redirects GSC
      // /fr (pas /fr/) retourne 200 directement avec localePrefix: 'always'
      const url = page === ''
        ? `${BASE_URL}/${locale}`
        : `${BASE_URL}/${locale}${page}`;

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : 0.8,
        alternates: alternateFor(locale, page),
      });
    }

    for (const page of blogPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page.startsWith('/blog/') && blogCategorySlugs.some((category) => page === `/blog/${category}`)
          ? 'weekly'
          : 'monthly',
        priority: 0.6,
        alternates: alternateFor(locale, page),
      });
    }
  }

  return entries;
}
