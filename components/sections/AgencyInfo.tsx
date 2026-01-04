'use client'

import Link from 'next/link'

interface AgencyInfoProps {
  locale: string
}

export default function AgencyInfo({ locale }: AgencyInfoProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="parallax-bg absolute inset-0 bg-gradient-to-br from-white/30 to-blue-100/30"></div>
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {locale === 'fr' ? 'Agence Digitale Internationale' : 'International Digital Agency'}
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            {locale === 'fr'
              ? 'Basée à Casablanca, OMA Digital accompagne les entreprises dans le monde entier dans leur transformation digitale avec des solutions sur mesure.'
              : 'Based in Casablanca, OMA Digital supports companies worldwide in their digital transformation with customized solutions.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Maroc - Siège Principal */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">🇲🇦</span>
              <h3 className="text-2xl font-bold text-gray-900">
                {locale === 'fr' ? 'Maroc - Siège Principal' : 'Morocco - Headquarters'}
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              {locale === 'fr'
                ? 'Notre siège principal à Casablanca dessert l\'ensemble du territoire marocain : Rabat, Marrakech, Fès, Tanger, Agadir et au-delà.'
                : 'Our main headquarters in Casablanca serves the entire Moroccan territory: Rabat, Marrakech, Fès, Tangier, Agadir and beyond.'
              }
            </p>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                {locale === 'fr' ? 'Services phares au Maroc :' : 'Flagship services in Morocco:'}
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  {locale === 'fr' ? 'Création de site web à Casablanca' : 'Website creation in Casablanca'}
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  {locale === 'fr' ? 'Développement de boutiques e-commerce (Next.js)' : 'E-commerce development (Next.js)'}
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  {locale === 'fr' ? 'Chatbots IA et automatisation marketing' : 'AI chatbots and marketing automation'}
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  {locale === 'fr' ? 'Applications mobiles sur mesure' : 'Custom mobile applications'}
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  {locale === 'fr' ? 'Référencement SEO et positionnement Google' : 'SEO and Google positioning'}
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-blue-600 mr-2">📍</span>
                <span className="text-gray-700 font-medium">
                  {locale === 'fr' ? 'Moustakbal / Sidi Maarouf, Casablanca – Maroc' : 'Moustakbal / Sidi Maarouf, Casablanca - Morocco'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">📞</span>
                <span className="text-gray-700 font-medium">+212 701 193 811</span>
              </div>
            </div>
          </div>

          {/* International */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">🌍</span>
              <h3 className="text-2xl font-bold text-gray-900">
                {locale === 'fr' ? 'Présence Internationale' : 'International Presence'}
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              {locale === 'fr'
                ? 'Depuis notre siège à Casablanca, OMA Digital dessert une clientèle internationale : Afrique, Europe, Moyen-Orient, Amérique du Nord et au-delà.'
                : 'From our headquarters in Casablanca, OMA Digital serves an international clientele: Africa, Europe, Middle East, North America and beyond.'
              }
            </p>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                {locale === 'fr' ? 'Services disponibles internationalement :' : 'Available services internationally:'}
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  {locale === 'fr' ? 'Développement web et applications sur mesure' : 'Custom web and application development'}
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  {locale === 'fr' ? 'Solutions e-commerce multi-devises' : 'Multi-currency e-commerce solutions'}
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  {locale === 'fr' ? 'Automatisation IA et workflows intelligents' : 'AI automation and intelligent workflows'}
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  {locale === 'fr' ? 'Applications mobiles multi-plateformes' : 'Cross-platform mobile applications'}
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">•</span>
                  {locale === 'fr' ? 'Marketing digital international et SEO global' : 'International digital marketing and global SEO'}
                </li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-green-600 mr-2">🌐</span>
                <span className="text-gray-700 font-medium">
                  {locale === 'fr'
                    ? 'Services 100 % à distance pour tous les pays, tous les fuseaux horaires.'
                    : '100% remote services for all countries, all time zones.'
                  }
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">📞</span>
                <span className="text-gray-700 font-medium">+212 701 193 811 (WhatsApp/International)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pourquoi choisir OMA Digital */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {locale === 'fr'
              ? 'Pourquoi choisir OMA Digital pour vos projets internationaux ?'
              : 'Why choose OMA Digital for your international projects?'
            }
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {locale === 'fr' ? 'Expertise Internationale' : 'International Expertise'}
              </h4>
              <p className="text-gray-600">
                {locale === 'fr'
                  ? 'Connaissance approfondie des marchés mondiaux et des meilleures pratiques digitales'
                  : 'Deep knowledge of global markets and digital best practices'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">💰</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {locale === 'fr' ? 'Tarifs Compétitifs Mondiaux' : 'Competitive Global Rates'}
              </h4>
              <p className="text-gray-600">
                {locale === 'fr'
                  ? 'Tarifs adaptés aux budgets internationaux sans compromettre la qualité'
                  : 'Rates adapted to international budgets without compromising quality'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {locale === 'fr' ? 'Support 24/7 Multilingue' : '24/7 Multilingual Support'}
              </h4>
              <p className="text-gray-600">
                {locale === 'fr'
                  ? 'Accompagnement personnalisé en français, anglais et arabe, adapté à vos fuseaux horaires'
                  : 'Personalized support in French, English and Arabic, adapted to your time zones'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
