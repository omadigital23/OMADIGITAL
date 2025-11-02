import Link from 'next/link'
import Image from 'next/image'

interface BlogOverviewProps {
  locale: string
}

export default function BlogOverview({ locale }: BlogOverviewProps) {
  const articles = [
    {
      id: 'next-js-14-nouveautes',
      slug: locale === 'fr' ? 'next-js-14-nouveautes-app-router' : 'next-js-14-features-app-router',
      title: locale === 'fr' ? 'Next.js 14 : Les Nouveautés de l\'App Router' : 'Next.js 14: New App Router Features',
      excerpt: locale === 'fr' 
        ? 'Découvrez les nouvelles fonctionnalités de Next.js 14 et comment l\'App Router révolutionne le développement React.'
        : 'Discover the new features of Next.js 14 and how the App Router revolutionizes React development.',
      readTime: '8 min',
      publishedAt: '2024-01-15',
      category: locale === 'fr' ? 'Développement Web' : 'Web Development',
      icon: '🌐'
    },
    {
      id: 'flutter-vs-react-native',
      slug: locale === 'fr' ? 'flutter-vs-react-native-2024' : 'flutter-vs-react-native-2024',
      title: locale === 'fr' ? 'Flutter vs React Native : Quel Framework Choisir en 2024 ?' : 'Flutter vs React Native: Which Framework to Choose in 2024?',
      excerpt: locale === 'fr'
        ? 'Comparaison complète entre Flutter et React Native pour développer vos applications mobiles cross-platform.'
        : 'Complete comparison between Flutter and React Native for developing your cross-platform mobile applications.',
      readTime: '12 min',
      publishedAt: '2024-01-10',
      category: locale === 'fr' ? 'Développement Mobile' : 'Mobile Development',
      icon: '📱'
    },
    {
      id: 'seo-local-maroc-senegal',
      slug: locale === 'fr' ? 'seo-local-maroc-senegal-guide' : 'local-seo-morocco-senegal-guide',
      title: locale === 'fr' ? 'SEO Local au Maroc et Sénégal : Guide Complet 2024' : 'Local SEO in Morocco and Senegal: Complete Guide 2024',
      excerpt: locale === 'fr'
        ? 'Optimisez votre référencement local pour dominer les recherches Google au Maroc et au Sénégal.'
        : 'Optimize your local SEO to dominate Google searches in Morocco and Senegal.',
      readTime: '10 min',
      publishedAt: '2024-01-05',
      category: locale === 'fr' ? 'Marketing Digital' : 'Digital Marketing',
      icon: '📈'
    }
  ]

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="parallax-bg absolute inset-0 bg-gradient-to-bl from-gray-100/50 to-blue-50/50"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {locale === 'fr' ? 'Actualités & Conseils' : 'News & Tips'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'fr' 
              ? 'Découvrez nos derniers articles sur les technologies et tendances digitales'
              : 'Discover our latest articles on digital technologies and trends'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {articles.map((article) => (
            <article key={article.id} className="blog-card bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gradient-to-br from-blue-600 to-purple-700">
                <Image
                  src="/images/logo.webp"
                  alt={article.title}
                  fill
                  className="object-cover opacity-20"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">{article.icon}</div>
                    <div className="text-sm font-medium">{article.category}</div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <span>{new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}</span>
                  <span className="mx-2">•</span>
                  <span>{article.readTime}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <Link
                  href={`/${locale}/blog/${article.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  {locale === 'fr' ? 'Lire l\'article' : 'Read Article'}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={`/${locale}/blog`}
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {locale === 'fr' ? 'Voir tous les articles' : 'View All Articles'}
          </Link>
        </div>
      </div>
    </section>
  )
}