import { GetServerSideProps } from 'next';

const SITE_URL = 'https://www.omadigital.net';
const LOCALES = ['fr', 'en'];

// Blog articles
const blogArticles = [
  'chatbot-whatsapp-senegal',
  'chatbot-vocal-multilingue',
  'sites-web-rapides-nextjs',
  'vertex-ai-vs-alternatives',
  'roi-automatisation-pme-afrique'
];

// City pages
const cities = ['dakar', 'thies', 'casablanca', 'rabat', 'marrakech'];

// Legal pages (French)
const legalPagesFr = [
  'politique-confidentialite',
  'mentions-legales',
  'conditions-generales',
  'politique-cookies',
  'politique-rgpd'
];

// Legal pages (English)
const legalPagesEn = [
  'privacy-policy',
  'cookie-policy',
  'terms-conditions',
  'gdpr-compliance'
];

function generatePages() {
  const pages = [];
  const now = new Date().toISOString();

  // Homepage
  LOCALES.forEach(locale => {
    pages.push({
      url: locale === 'fr' ? '/' : `/${locale}`,
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: now
    });
  });

  // Blog index
  LOCALES.forEach(locale => {
    pages.push({
      url: `/${locale}/blog`,
      changefreq: 'daily',
      priority: 0.9,
      lastmod: now
    });
  });

  // Blog articles
  LOCALES.forEach(locale => {
    blogArticles.forEach(slug => {
      pages.push({
        url: `/${locale}/blog/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: now
      });
    });
  });

  // City pages
  LOCALES.forEach(locale => {
    cities.forEach(city => {
      pages.push({
        url: `/${locale}/villes/${city}`,
        changefreq: 'monthly',
        priority: 0.9,
        lastmod: now
      });
    });
  });

  // Legal pages French
  legalPagesFr.forEach(page => {
    pages.push({
      url: `/fr/${page}`,
      changefreq: 'yearly',
      priority: 0.3,
      lastmod: now
    });
  });

  // Legal pages English
  legalPagesEn.forEach(page => {
    pages.push({
      url: `/en/${page}`,
      changefreq: 'yearly',
      priority: 0.3,
      lastmod: now
    });
  });

  return pages;
}

function generateSiteMap(pages: ReturnType<typeof generatePages>): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages
  .map((page) => {
    return `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const pages = generatePages();
  const sitemap = generateSiteMap(pages);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
