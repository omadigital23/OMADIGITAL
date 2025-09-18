/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://oma-digital.sn',
  generateRobotsFile: true,
  generateIndexSitemap: false,
  
  // Exclude admin and API routes
  exclude: ['/admin', '/admin/*', '/api/*', '/server-sitemap.xml'],
  
  // Additional paths to include
  additionalPaths: async (config) => {
    const base = [
      await config.transform(config, '/'),
      await config.transform(config, '/blog'),
      await config.transform(config, '/services'),
      await config.transform(config, '/contact'),
      await config.transform(config, '/about'),
    ];

    // Include a few known blog posts (replace with dynamic fetch later)
    const extra = [];
    try {
      const blogPosts = [
        '/blog/automatisation-whatsapp-pme-senegal',
        '/blog/sites-ultra-rapides-seo-dakar',
        '/blog/transformation-digitale-pme-africaine',
        '/blog/intelligence-artificielle-business-senegal',
        '/blog/automatisation-pour-pme-maroc',
        '/blog/seo-casablanca-rabat',
        '/blog/transformation-digitale-maroc',
        '/blog/digital-transformation-senegal-maroc',
        '/blog/seo-strategies-senegal-maroc'
      ];
      for (const post of blogPosts) {
        extra.push(await config.transform(config, post));
      }
    } catch (e) {
      console.warn('Could not add extra blog posts to sitemap');
    }

    return [...base, ...extra];
  },
  
  // Default transformation for all pages
  transform: async (config, path) => {
    // Custom priority based on page importance
    let priority = 0.7;
    let changefreq = 'weekly';
    
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/blog')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/services')) {
      priority = 0.9;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: [
        {
          href: `${config.siteUrl}${path}`,
          hreflang: 'fr',
        },
        {
          href: `${config.siteUrl}${path}`,  
          hreflang: 'fr-SN',
        },
        {
          href: `${config.siteUrl}${path}`,
          hreflang: 'fr-MA',
        },
      ],
    };
  },
  
  // Robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/_next/'],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'Google-Extended',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot', 
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],
      }
    ],
    additionalSitemaps: [
      'https://oma-digital.sn/sitemap.xml',
    ],
  },
  
};