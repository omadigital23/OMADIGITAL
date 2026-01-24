import Link from 'next/link'

interface ServicesOverviewProps {
  locale: string
}

export default function ServicesOverview({ locale }: ServicesOverviewProps) {
  const featuredServices = [
    {
      id: 'site-vitrine',
      title: locale === 'fr' ? 'Site Vitrine' : 'Showcase Website',
      description: locale === 'fr' ? 'Sites web modernes, rapides et sécurisés' : 'Modern, fast and secure websites',
      price: '5 000 DH',
      icon: '🌐'
    },
    {
      id: 'ecommerce-essentiel',
      title: locale === 'fr' ? 'E-commerce Essentiel' : 'Essential E-commerce',
      description: locale === 'fr' ? 'Boutiques en ligne optimisées pour les ventes' : 'Online stores optimized for sales',
      price: '10 000 DH',
      icon: '🛒'
    },
    {
      id: 'app-mobile-mvp',
      title: locale === 'fr' ? 'Application Mobile MVP' : 'Mobile App MVP',
      description: locale === 'fr' ? 'Applications mobiles MVP pour tester votre concept' : 'MVP mobile apps to test your concept',
      price: locale === 'fr' ? 'À partir de 10 999 DH' : 'Starting from 10,999 DH',
      icon: '📱'
    }
  ]

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      <div className="parallax-bg absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {locale === 'fr' ? 'Nos Services Phares' : 'Our Featured Services'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'fr'
              ? 'Solutions digitales sur mesure pour transformer votre présence en ligne'
              : 'Custom digital solutions to transform your online presence'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {featuredServices.map((service) => (
            <div key={service.id} className="service-card bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="text-2xl font-bold text-blue-600 mb-6">{service.price}</div>
              <Link
                href={`/${locale}/services`}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {locale === 'fr' ? 'En savoir plus' : 'Learn More'}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={`/${locale}/services`}
            className="inline-block bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            {locale === 'fr' ? 'Voir tous nos services' : 'View All Services'}
          </Link>
        </div>
      </div>
    </section>
  )
}