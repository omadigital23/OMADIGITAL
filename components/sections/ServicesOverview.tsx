import Link from 'next/link'
import { getServicesData } from '../../lib/content'

interface ServicesOverviewProps {
  locale: string
}

export default function ServicesOverview({ locale }: ServicesOverviewProps) {
  const { featuredServices, ui } = getServicesData(locale)

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden">
      <div className="parallax-bg absolute inset-0 bg-gradient-to-br from-blue-100/30 to-purple-100/30"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {ui.featured_title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {ui.featured_description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 mb-12">
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
                {ui.learn_more}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href={`/${locale}/services`}
            className="inline-block bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors"
          >
            {ui.view_all}
          </Link>
        </div>
      </div>
    </section>
  )
}