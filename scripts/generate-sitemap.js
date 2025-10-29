/**
 * Sitemap generator for omadigital.net
 * Optimized for SEO performance and multilingual support
 */

const fs = require('fs');
const path = require('path');

// Enhanced: dynamically read blog posts and city pages from locales
// Supports FR↔EN slug mapping with optional override file
function getBlogPosts() {
  const blogPosts = [];
  try {
    const frBlogPath = path.join(__dirname, '..', 'public', 'locales', 'fr', 'blog.json');
    const enBlogPath = path.join(__dirname, '..', 'public', 'locales', 'en', 'blog.json');
    const frBlogData = JSON.parse(fs.readFileSync(frBlogPath, 'utf8'));
    const enBlogData = JSON.parse(fs.readFileSync(enBlogPath, 'utf8'));

    // Optional manual overrides: { "fr-slug": "en-slug" }
    let slugOverrides = {};
    try {
      const overridePath = path.join(__dirname, '..', 'public', 'slug-map.json');
      if (fs.existsSync(overridePath)) {
        slugOverrides = JSON.parse(fs.readFileSync(overridePath, 'utf8')) || {};
      }
    } catch (_) {}

    const frSlugs = Object.keys(frBlogData.articles || {});
    const enSlugsSet = new Set(Object.keys(enBlogData.articles || {}));

    frSlugs.forEach((frSlug) => {
      // Determine the matching EN slug
      // Priority: manual override > same key exists in EN > fallback to same FR slug
      const mappedEnSlug = slugOverrides[frSlug]
        ? String(slugOverrides[frSlug])
        : enSlugsSet.has(frSlug)
          ? frSlug
          : frSlug; // fallback if no override and no matching key

      blogPosts.push({
        path: `/fr/blog/${frSlug}`,
        alt: { en: `/en/blog/${mappedEnSlug}` },
        priority: 0.8,
        changefreq: 'monthly'
      });
      blogPosts.push({
        path: `/en/blog/${mappedEnSlug}`,
        alt: { fr: `/fr/blog/${frSlug}` },
        priority: 0.8,
        changefreq: 'monthly'
      });
    });
  } catch (error) {
    console.error('Error reading blog posts for sitemap:', error);
  }
  return blogPosts;
}

function getCityPages() {
  const cityPages = [];
  try {
    const frCitiesPath = path.join(__dirname, '..', 'public', 'locales', 'fr', 'cities.json');
    const frCities = JSON.parse(fs.readFileSync(frCitiesPath, 'utf8'));
    const citySlugs = Object.keys((frCities && frCities.cities) || {});

    citySlugs.forEach((city) => {
      // Site routes use /villes for both locales
      cityPages.push({ path: `/fr/villes/${city}`, priority: 0.9, changefreq: 'monthly' });
      cityPages.push({ path: `/en/villes/${city}`, priority: 0.9, changefreq: 'monthly' });
    });
  } catch (error) {
    console.error('Error reading city pages for sitemap:', error);
  }
  return cityPages;
}

// Define core pages with locale-prefixed paths
const pages = [
  // Homepage (locale specific)
  { path: '/fr', priority: 1.0, changefreq: 'daily' },
  { path: '/en', priority: 1.0, changefreq: 'daily' },

  // Main pages
  { path: '/fr/services', priority: 0.9, changefreq: 'weekly' },
  { path: '/en/services', priority: 0.9, changefreq: 'weekly' },

  { path: '/fr/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/en/about', priority: 0.8, changefreq: 'monthly' },

  { path: '/fr/contact', priority: 0.8, changefreq: 'monthly' },
  { path: '/en/contact', priority: 0.8, changefreq: 'monthly' },

  // Blog index
  { path: '/fr/blog', priority: 0.7, changefreq: 'weekly' },
  { path: '/en/blog', priority: 0.7, changefreq: 'weekly' },

  // Legal pages
  { path: '/fr/mentions-legales', priority: 0.3, changefreq: 'yearly' },
  { path: '/en/legal-notice', priority: 0.3, changefreq: 'yearly' },

  { path: '/fr/privacy-policy', priority: 0.3, changefreq: 'yearly' },
  { path: '/en/privacy-policy', priority: 0.3, changefreq: 'yearly' },

  { path: '/fr/terms-conditions', priority: 0.3, changefreq: 'yearly' },
  { path: '/en/terms-conditions', priority: 0.3, changefreq: 'yearly' },
].concat(getBlogPosts()).concat(getCityPages());

// Generate sitemap.xml
function generateSitemap() {
  const baseUrl = 'https://www.omadigital.net';
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

    // Add hreflang alternates for locale-prefixed paths
    if (page.path.startsWith('/fr')) {
      // Use explicit alt if provided (for mapped blog slugs), else simple replace
      let englishPath = page.alt?.en ? page.alt.en : page.path.replace('/fr', '/en');
      if (page.path === '/fr/mentions-legales') englishPath = '/en/legal-notice';
      xml += `    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}${page.path}" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${englishPath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${page.path}" />
`;
    } else if (page.path.startsWith('/en')) {
      let frenchPath = page.alt?.fr ? page.alt.fr : page.path.replace('/en', '/fr');
      if (page.path === '/en/legal-notice') frenchPath = '/fr/mentions-legales';
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${page.path}" />
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}${frenchPath}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${frenchPath}" />
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

// Run the generators
generateSitemap();
console.log('🚀 Sitemap generated. robots.txt left unchanged.');