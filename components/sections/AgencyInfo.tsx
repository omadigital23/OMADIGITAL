'use client'

import type { AgencyData } from '../../lib/content'
import type { CommonTranslations } from '../../lib/translations'

interface AgencyInfoProps {
  locale: string
  data: AgencyData
  translations?: CommonTranslations
}

export default function AgencyInfo({ locale, data: agencyData, translations = {} }: AgencyInfoProps) {
  const ag = (translations as Record<string, Record<string, string>>).agency || {}
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="parallax-bg absolute inset-0 bg-gradient-to-br from-white/30 to-blue-100/30"></div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {agencyData.sectionTitle}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            {agencyData.sectionDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 lg:gap-12 mb-16">
          {/* Maroc - Siège Principal */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">🇲🇦</span>
              <h3 className="text-2xl font-bold text-gray-900">
                {agencyData.morocco.title}
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              {agencyData.morocco.description}
            </p>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                {ag.morocco_services_label || 'Flagship services in Morocco:'}
              </h4>
              <ul className="space-y-2 text-gray-600">
                {agencyData.morocco.services.map((service, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-blue-600 mr-2">•</span>
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-blue-600 mr-2">{agencyData.morocco.locationLabel}</span>
                <span className="text-gray-700 font-medium">
                  {agencyData.morocco.locationValue}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">{agencyData.morocco.contactLabel}</span>
                <span className="text-gray-700 font-medium">{agencyData.morocco.contactValue}</span>
              </div>
            </div>
          </div>

          {/* International */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">🌍</span>
              <h3 className="text-2xl font-bold text-gray-900">
                {agencyData.international.title}
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              {agencyData.international.description}
            </p>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                {ag.international_services_label || 'Available services internationally:'}
              </h4>
              <ul className="space-y-2 text-gray-600">
                {agencyData.international.services.map((service, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-green-600 mr-2">•</span>
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-green-600 mr-2">{agencyData.international.locationLabel}</span>
                <span className="text-gray-700 font-medium">
                  {agencyData.international.locationValue}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">{agencyData.international.contactLabel}</span>
                <span className="text-gray-700 font-medium">{agencyData.international.contactValue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pourquoi choisir OMA Digital */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {agencyData.whyUs.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {agencyData.whyUs.items.map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
