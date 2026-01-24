import Link from 'next/link'
import Image from 'next/image'

interface BlogOverviewProps {
  locale: string
}

export default function BlogOverview({ locale }: BlogOverviewProps) {
  const articles = [
    {
      id: 'site-vitrine-moderne',
      slug: 'site-vitrine-moderne',
      categorySlug: 'developpement-web',
      title: locale === 'fr' ? 'Site Vitrine Moderne : La Vitrine Digitale de Votre Entreprise' : 'Modern Showcase Website: Your Professional Digital Presence',
      excerpt: locale === 'fr'
        ? 'Découvrez comment un site vitrine moderne peut transformer votre présence digitale et générer plus de clients pour seulement 5 000 DH.'
        : 'Discover how a modern showcase website can transform your digital presence and generate more clients for only 5,000 DH.',
      readTime: '12 min',
      publishedAt: '2025-01-05',
      category: locale === 'fr' ? 'Développement Web' : 'Web Development',
      icon: '🌐'
    },
    {
      id: 'chatbot-ia-personnalise',
      slug: 'chatbot-ia-personnalise',
      categorySlug: 'intelligence-artificielle',
      title: locale === 'fr' ? 'Chatbot IA Personnalisé (RAG) : Intelligence Avancée' : 'Custom AI Chatbot (RAG): Advanced Intelligence',
      excerpt: locale === 'fr'
        ? 'Chatbot intelligent avec IA et base de connaissances utilisant Gemini AI, RAG, Vector DB, Next.js pour 10 000 DH + 500 DH/mois.'
        : 'Intelligent chatbot with AI and knowledge base using Gemini AI, RAG, Vector DB, Next.js for 10,000 DH + 500 DH/month.',
      readTime: '10 min',
      publishedAt: '2025-01-10',
      category: locale === 'fr' ? 'Intelligence Artificielle' : 'Artificial Intelligence',
      icon: '🤖'
    },
    {
      id: 'bot-simple-whatsapp',
      slug: 'bot-simple-whatsapp',
      categorySlug: 'intelligence-artificielle',
      title: locale === 'fr' ? 'Bot Simple WhatsApp/Telegram : Réponses Automatisées' : 'Simple WhatsApp/Telegram Bot: Automated Responses',
      excerpt: locale === 'fr'
        ? 'Bot WhatsApp/Telegram simple avec réponses automatisées et menu interactif pour 2 000 DH + 200 DH/mois.'
        : 'Simple WhatsApp/Telegram bot with automated responses and interactive menu for 2,000 DH + 200 DH/month.',
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
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