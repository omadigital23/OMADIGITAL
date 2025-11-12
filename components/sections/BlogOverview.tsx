import Link from 'next/link'
import Image from 'next/image'

interface BlogOverviewProps {
  locale: string
}

export default function BlogOverview({ locale }: BlogOverviewProps) {
  const articles = [
    {
      id: 'sites-web-rapides-nextjs',
      slug: locale === 'fr' ? 'sites-web-rapides-nextjs' : 'fast-websites-nextjs',
      categorySlug: 'developpement-web',
      title: locale === 'fr' ? 'Sites web ultra-rapides avec Next.js : Guide pour PME au Sénégal et Maroc' : 'Ultra-fast websites with Next.js: Guide for SMEs in Senegal and Morocco',
      excerpt: locale === 'fr' 
        ? 'Apprenez comment créer un site web qui se charge en moins de 1.5 seconde et améliore votre référencement Google de 300%.'
        : 'Learn how to create a website that loads in less than 1.5 seconds and improves your Google ranking by 300%.',
      readTime: '12 min',
      publishedAt: '2025-01-05',
      category: locale === 'fr' ? 'Développement Web' : 'Web Development',
      icon: '🌐'
    },
    {
      id: 'chatbot-vocal-multilingue',
      slug: locale === 'fr' ? 'chatbot-vocal-multilingue' : 'multilingual-voice-chatbot',
      categorySlug: 'intelligence-artificielle',
      title: locale === 'fr' ? 'Chatbot vocal multilingue : L\'avenir du service client au Sénégal et au Maroc' : 'Multilingual voice chatbot: The future of customer service in Senegal and Morocco',
      excerpt: locale === 'fr'
        ? 'Découvrez comment notre chatbot vocal intelligent en français, arabe et wolof révolutionne le service client des PME africaines.'
        : 'Discover how our intelligent voice chatbot in French, Arabic and Wolof revolutionizes customer service for African SMEs.',
      readTime: '10 min',
      publishedAt: '2025-01-10',
      category: locale === 'fr' ? 'Intelligence Artificielle' : 'Artificial Intelligence',
      icon: '🤖'
    },
    {
      id: 'chatbot-whatsapp-senegal',
      slug: locale === 'fr' ? 'chatbot-whatsapp-senegal' : 'whatsapp-chatbot-senegal',
      categorySlug: 'whatsapp-business',
      title: locale === 'fr' ? 'Comment automatiser WhatsApp Business au Sénégal : Guide complet 2025' : 'How to automate WhatsApp Business in Senegal: Complete Guide 2025',
      excerpt: locale === 'fr'
        ? 'Découvrez comment les PME sénégalaises peuvent automatiser leur service client WhatsApp et augmenter leurs ventes de 98% avec un chatbot intelligent.'
        : 'Discover how Senegalese SMEs can automate their WhatsApp customer service and increase sales by 98% with an intelligent chatbot.',
      readTime: '8 min',
      publishedAt: '2025-01-15',
      category: locale === 'fr' ? 'WhatsApp Business' : 'WhatsApp Business',
      icon: '💬'
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
                  <span>{article.publishedAt}</span>
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
                  href={`/${locale}/blog/${article.categorySlug}/${article.slug}`}
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