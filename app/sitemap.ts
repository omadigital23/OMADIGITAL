import { MetadataRoute } from 'next'
import { getAllArticles } from '../lib/articles'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'
  
  const routes = [
    '',
    '/services',
    '/about', 
    '/blog',
    '/contact',
    '/legal/privacy-policy',
    '/legal/terms-conditions',
    '/legal/cookie-policy',
    '/legal/gdpr-compliance'
  ]

  // Get real blog articles from articles.ts
  const allArticles = getAllArticles()
  
  // Extract unique categories
  const blogCategories = [...new Set(allArticles.map(article => article.category))]

  const locales = ['fr', 'en']
  const sitemap: MetadataRoute.Sitemap = []

  // Add main routes for each locale
  locales.forEach(locale => {
    routes.forEach(route => {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : route.includes('blog') ? 'weekly' : 'monthly',
        priority: route === '' ? 1 : route === '/services' ? 0.9 : 0.8,
        alternates: {
          languages: {
            fr: `${baseUrl}/fr${route}`,
            en: `${baseUrl}/en${route}`
          }
        }
      })
    })

    // Add blog categories
    blogCategories.forEach(category => {
      sitemap.push({
        url: `${baseUrl}/${locale}/blog/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: {
            fr: `${baseUrl}/fr/blog/${category}`,
            en: `${baseUrl}/en/blog/${category}`
          }
        }
      })
    })

    // Add blog articles for this locale
    allArticles
      .filter(article => article.locale === locale)
      .forEach(article => {
        sitemap.push({
          url: `${baseUrl}/${locale}/blog/${article.category}/${article.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: {
            languages: {
              fr: `${baseUrl}/fr/blog/${article.category}/${article.slug}`,
              en: `${baseUrl}/en/blog/${article.category}/${article.slug}`
            }
          }
        })
      })
  })

  return sitemap
}