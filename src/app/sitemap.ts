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

  const blogSlugs = [
    'creer-site-web-professionnel-senegal',
    'automatisation-ia-guide-entreprises-senegalaises',
    'application-mobile-entreprise-senegal',
    'ecommerce-senegal-vendre-en-ligne',
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1 : 0.8,
      });
    }

    for (const slug of blogSlugs) {
      entries.push({
        url: `${BASE_URL}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
