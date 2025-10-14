import { GetServerSideProps } from 'next';

// Site configuration
const SITE_URL = 'https://www.omadigital.net';

// Define all public pages with their metadata
const publicPages = [
  {
    url: '/',
    changefreq: 'weekly',
    priority: 1.0,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/about',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/voice-chat',
    changefreq: 'weekly',
    priority: 0.9,
    lastmod: new Date().toISOString(),
  },
  // Blog pages
  {
    url: '/blog',
    changefreq: 'daily',
    priority: 0.9,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/blog/chatbot-whatsapp-senegal',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/blog/chatbot-vocal-multilingue',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/blog/sites-web-rapides-nextjs',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/blog/vertex-ai-vs-alternatives',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/blog/roi-automatisation-pme-afrique',
    changefreq: 'weekly',
    priority: 0.8,
    lastmod: new Date().toISOString(),
  },
  // City pages
  {
    url: '/villes/dakar',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/villes/thies',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/villes/casablanca',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/villes/rabat',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/villes/marrakech',
    changefreq: 'monthly',
    priority: 0.9,
    lastmod: new Date().toISOString(),
  },
  // Legal pages
  {
    url: '/politique-confidentialite',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/mentions-legales',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/conditions-generales',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/politique-cookies',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/politique-rgpd',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/privacy-policy',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/cookie-policy',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/terms-conditions',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString(),
  },
  {
    url: '/gdpr-compliance',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString(),
  },
];

function generateSiteMap(pages: typeof publicPages): string {
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
  // Generate the XML sitemap
  const sitemap = generateSiteMap(publicPages);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
