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

      // FR at root
      blogPosts.push({
        path: `/blog/${frSlug}`,
        alt: { en: `/en/blog/${mappedEnSlug}` },
        priority: 0.8,
        changefreq: 'monthly'
      });
      // EN localized
      blogPosts.push({
        path: `/en/blog/${mappedEnSlug}`,
        alt: { fr: `/blog/${frSlug}` },
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
      // FR at root
      cityPages.push({ path: `/villes/${city}`, alt: { en: `/en/villes/${city}` }, priority: 0.9, changefreq: 'monthly' });
      // EN localized
      cityPages.push({ path: `/en/villes/${city}`, alt: { fr: `/villes/${city}` }, priority: 0.9, changefreq: 'monthly' });
    });
  } catch (error) {
    console.error('Error reading city pages for sitemap:', error);
  }
  return cityPages;
}

// Define core pages with FR at root and EN prefixed
const pages = [
  // Homepage (FR at root, EN localized)
  { path: '/', priority: 1.0, changefreq: 'daily', alt: { en: '/en' } },

  // Main pages
  { path: '/services', priority: 0.9, changefreq: 'weekly', alt: { en: '/en/services' } },
  { path: '/about', priority: 0.8, changefreq: 'monthly', alt: { en: '/en/about' } },
  { path: '/contact', priority: 0.8, changefreq: 'monthly', alt: { en: '/en/contact' } },

  // Blog index
  { path: '/blog', priority: 0.7, changefreq: 'weekly', alt: { en: '/en/blog' } },

  // Legal pages
  { path: '/mentions-legales', priority: 0.3, changefreq: 'yearly', alt: { en: '/en/legal-notice' } },
  { path: '/privacy-policy', priority: 0.3, changefreq: 'yearly', alt: { en: '/en/privacy-policy' } },
  { path: '/terms-conditions', priority: 0.3, changefreq: 'yearly', alt: { en: '/en/terms-conditions' } },
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

    // Add hreflang alternates with FR at root and EN under /en
    if (page.path.startsWith('/en')) {
      const frenchPath = page.alt?.fr ? page.alt.fr : page.path.replace('/en', '');
      xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${page.path}" />
    <xhtml:link rel="alternate" hreflang="fr" href="${baseUrl}${frenchPath || '/'}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${frenchPath || '/'}" />
`;
    } else {
      const englishPath = page.alt?.en ? page.alt.en : (page.path === '/' ? '/en' : `/en${page.path}`);
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

// Run the generators
generateSitemap();
console.log('🚀 Sitemap generated. robots.txt left unchanged.');