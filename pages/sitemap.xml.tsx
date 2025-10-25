import { GetServerSideProps } from 'next';

const SITE_URL = 'https://www.omadigital.net';
const LOCALES = ['fr', 'en'];

const blogArticles = [
  'chatbot-whatsapp-senegal',
  'chatbot-vocal-multilingue',
  'sites-web-rapides-nextjs',
  'vertex-ai-vs-alternatives',
  'roi-automatisation-pme-afrique'
];

const cities = ['dakar', 'thies', 'casablanca', 'rabat', 'marrakech'];

const legalPages = {
  'politique-confidentialite': 'privacy-policy',
  'politique-cookies': 'cookie-policy',
  'conditions-generales': 'terms-conditions',
  'politique-rgpd': 'gdpr-compliance'
};

const staticPages = ['about'];

function generatePages() {
  const pages: Array<{
    url: string;
    changefreq: string;
    priority: number;
    lastmod: string;
    alternates: Array<{ locale: string; url: string }>;
  }> = [];
  const now = new Date().toISOString();

  // Homepage
  LOCALES.forEach(locale => {
    pages.push({
      url: `/${locale}`,
      changefreq: 'weekly',
      priority: 1.0,
      lastmod: now,
      alternates: LOCALES.map(l => ({ locale: l, url: `/${l}` }))
    });
  });

  // Static pages
  staticPages.forEach(page => {
    LOCALES.forEach(locale => {
      pages.push({
        url: `/${locale}/${page}`,
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: now,
        alternates: LOCALES.map(l => ({ locale: l, url: `/${l}/${page}` }))
      });
    });
  });

  // Blog index
  LOCALES.forEach(locale => {
    pages.push({
      url: `/${locale}/blog`,
      changefreq: 'daily',
      priority: 0.9,
      lastmod: now,
      alternates: LOCALES.map(l => ({ locale: l, url: `/${l}/blog` }))
    });
  });

  // Blog articles
  blogArticles.forEach(slug => {
    LOCALES.forEach(locale => {
      pages.push({
        url: `/${locale}/blog/${slug}`,
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: now,
        alternates: LOCALES.map(l => ({ locale: l, url: `/${l}/blog/${slug}` }))
      });
    });
  });

  // City pages
  cities.forEach(city => {
    LOCALES.forEach(locale => {
      pages.push({
        url: `/${locale}/villes/${city}`,
        changefreq: 'monthly',
        priority: 0.9,
        lastmod: now,
        alternates: LOCALES.map(l => ({ locale: l, url: `/${l}/villes/${city}` }))
      });
    });
  });

  // Legal pages
  Object.entries(legalPages).forEach(([frPage, enPage]) => {
    pages.push({
      url: `/fr/${frPage}`,
      changefreq: 'yearly',
      priority: 0.3,
      lastmod: now,
      alternates: [
        { locale: 'fr', url: `/fr/${frPage}` },
        { locale: 'en', url: `/en/${enPage}` }
      ]
    });
    pages.push({
      url: `/en/${enPage}`,
      changefreq: 'yearly',
      priority: 0.3,
      lastmod: now,
      alternates: [
        { locale: 'fr', url: `/fr/${frPage}` },
        { locale: 'en', url: `/en/${enPage}` }
      ]
    });
  });

  // mentions-legales (FR only)
  pages.push({
    url: '/fr/mentions-legales',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: now,
    alternates: [{ locale: 'fr', url: '/fr/mentions-legales' }]
  });

  return pages;
}

function generateSiteMap(pages: ReturnType<typeof generatePages>): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages
  .map((page) => {
    const hreflangTags = page.alternates
      .map(alt => `    <xhtml:link rel="alternate" hreflang="${alt.locale}" href="${SITE_URL}${alt.url}" />`)
      .join('\n');
    
    return `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${hreflangTags}
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
