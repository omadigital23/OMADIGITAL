import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllArticles } from '../../../lib/articles'

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'
  const url = `${domain}/${locale}/blog`
  return {
    title: locale === 'fr' ? 'Blog' : 'Blog',
    description:
      locale === 'fr'
        ? "Lectures & guides d'OMA Digital: web, mobile, IA, marketing."
        : 'OMA Digital readings & guides: web, mobile, AI, marketing.',
    alternates: {
      canonical: url,
      languages: {
        fr: `${domain}/fr/blog`,
        en: `${domain}/en/blog`,
        'x-default': `${domain}/fr/blog`,
      },
    },
  }
}

export default function BlogPage({ params }: { params: { locale: string } }) {
  const articles = getAllArticles().filter(article => article.locale === params.locale)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {params.locale === 'fr' ? 'Blog OMA Digital' : 'OMA Digital Blog'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {params.locale === 'fr' 
              ? 'Découvrez nos 12 services : développement web, applications mobiles, IA, marketing digital et création.'
              : 'Discover our 12 services: web development, mobile apps, AI, digital marketing and creation.'
            }
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => {
            const getCategoryLabel = (category: string) => {
              const categoryLabels: Record<string, { fr: string; en: string }> = {
                'developpement-web': { fr: 'Développement Web', en: 'Web Development' },
                'applications-mobiles': { fr: 'Applications Mobiles', en: 'Mobile Apps' },
                'intelligence-artificielle': { fr: 'Intelligence Artificielle', en: 'Artificial Intelligence' },
                'marketing-digital': { fr: 'Marketing Digital', en: 'Digital Marketing' },
                'creation-design': { fr: 'Création & Design', en: 'Creation & Design' }
              }
              return categoryLabels[category]?.[params.locale as 'fr' | 'en'] || category
            }

            const getCategoryColor = (category: string) => {
              const colors: Record<string, string> = {
                'developpement-web': 'bg-blue-100 text-blue-800',
                'applications-mobiles': 'bg-green-100 text-green-800',
                'intelligence-artificielle': 'bg-purple-100 text-purple-800',
                'marketing-digital': 'bg-orange-100 text-orange-800',
                'creation-design': 'bg-pink-100 text-pink-800'
              }
              return colors[category] || 'bg-gray-100 text-gray-800'
            }

            return (
              <article key={`${article.category}-${article.slug}`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {getCategoryLabel(article.category)}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <Link 
                    href={`/${params.locale}/blog/${article.category}/${article.slug}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {params.locale === 'fr' ? 'Lire la suite' : 'Read more'}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {params.locale === 'fr' 
                ? 'Aucun article disponible pour le moment.'
                : 'No articles available at the moment.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}