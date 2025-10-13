/**
 * Sitemap generator for omadigital.net
 * Optimized for SEO performance and multilingual support
 */

const fs = require('fs');
const path = require('path');

// Define all pages with their priorities and change frequencies
const pages = [
  // Homepage
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/en', priority: 1.0, changefreq: 'daily' },
  
  // Main pages
  { path: '/services', priority: 0.9, changefreq: 'weekly' },
  { path: '/en/services', priority: 0.9, changefreq: 'weekly' },
  
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/en/about', priority: 0.8, changefreq: 'monthly' },
  
  { path: '/contact', priority: 0.8, changefreq: 'monthly' },
  { path: '/en/contact', priority: 0.8, changefreq: 'monthly' },
  
  // Blog posts (example)
  { path: '/blog', priority: 0.7, changefreq: 'weekly' },
  { path: '/en/blog', priority: 0.7, changefreq: 'weekly' },
  
  { path: '/blog/automatisation-whatsapp-pme-senegal', priority: 0.8, changefreq: 'monthly' },
  { path: '/en/blog/whatsapp-automation-sme-senegal', priority: 0.8, changefreq: 'monthly' },
  
  { path: '/blog/sites-ultra-rapides-seo-dakar', priority: 0.8, changefreq: 'monthly' },
  { path: '/en/blog/lightning-fast-websites-seo-dakar', priority: 0.8, changefreq: 'monthly' },
  
  { path: '/blog/transformation-digitale-pme-africaine', priority: 0.7, changefreq: 'monthly' },
  { path: '/en/blog/digital-transformation-african-sme', priority: 0.7, changefreq: 'monthly' },
  
  // Legal pages
  { path: '/mentions-legales', priority: 0.3, changefreq: 'yearly' },
  { path: '/en/legal-notice', priority: 0.3, changefreq: 'yearly' },
  
  { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly' },
  { path: '/en/privacy-policy', priority: 0.3, changefreq: 'yearly' },
  
  { path: '/terms-conditions', priority: 0.3, changefreq: 'yearly' },
  { path: '/en/terms-conditions', priority: 0.3, changefreq: 'yearly' }
];

// Generate sitemap.xml
function generateSitemap() {
  const baseUrl = 'https://omadigital.net';
  const lastmod = new Date().toISOString();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;
  
  pages.forEach(page => {
    xml += `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
`;
    
    // Add hreflang alternates
    if (page.path.endsWith('/en') || page.path.includes('/en/')) {
      const frenchPath = page.path.replace('/en', '') || '/';
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${page.path}" />
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}${frenchPath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${frenchPath}" />
`;
    } else {
      const englishPath = page.path === '/' ? '/en' : `/en${page.path}`;
      xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}${page.path}" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${englishPath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${page.path}" />
`;
    }
    
    xml += `  </url>
`;
  });
  
  xml += `</urlset>`;
  
  // Write sitemap.xml
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), xml);
  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
}

// Generate robots.txt
function generateRobots() {
  const robotsTxt = `# robots.txt for OMA Digital
# Your digital partner in Senegal and Morocco

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /test-*

# Sitemap
Sitemap: https://omadigital.net/sitemap.xml

# Crawl-delay for better server performance
Crawl-delay: 1

# Specific rules for major search engines
User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: Bingbot
Allow: /
Disallow: /api/
Disallow: /admin/

User-agent: Slurp
Allow: /
Disallow: /api/
Disallow: /admin/

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /
`;
  
  fs.writeFileSync(path.join(__dirname, '..', 'public', 'robots.txt'), robotsTxt);
  console.log('✅ Robots.txt generated successfully at public/robots.txt');
}

// Run the generators
generateSitemap();
generateRobots();

console.log('🚀 SEO files generated for omadigital.net');