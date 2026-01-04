interface LocalSEOProps {
  locale: string
}

export default function LocalSEO({ locale }: LocalSEOProps) {
  return (
    <section className="py-20 bg-blue-50 relative overflow-hidden">
      <div className="parallax-bg absolute inset-0 bg-gradient-to-r from-blue-200/20 to-green-200/20"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {locale === 'fr'
              ? 'Présence Locale & Services Régionaux'
              : 'Local Presence & Regional Services'
            }
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            {locale === 'fr'
              ? 'Découvrez notre couverture géographique et nos services adaptés aux marchés locaux du Maroc et du Sénégal.'
              : 'Discover our geographic coverage and services adapted to local markets in Morocco and Senegal.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Maroc */}
          <div className="local-seo-card bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <span className="text-4xl mr-4">🇲🇦</span>
              <h3 className="text-2xl font-bold text-gray-900">
                {locale === 'fr' ? 'Maroc - Casablanca' : 'Morocco - Casablanca'}
              </h3>
            </div>

            <div className="space-y-4 text-gray-600">
              <p>
                {locale === 'fr'
                  ? 'Notre siège principal à Casablanca dessert l\'ensemble du territoire marocain : Rabat, Marrakech, Fès, Tanger, Agadir et au-delà.'
                  : 'Our main headquarters in Casablanca serves the entire Moroccan territory: Rabat, Marrakech, Fes, Tangier, Agadir and beyond.'
                }
              </p>

              <div className="space-y-2">
                <p><strong>{locale === 'fr' ? 'Services les plus demandés au Maroc :' : 'Most requested services in Morocco:'}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>{locale === 'fr' ? 'Création de site web à Casablanca' : 'Website creation in Casablanca'}</li>
                  <li>{locale === 'fr' ? 'Développement de boutiques e-commerce (Next.js)' : 'E-commerce store development (Next.js)'}</li>
                  <li>{locale === 'fr' ? 'Chatbots IA et automatisation marketing' : 'AI chatbots and marketing automation'}</li>
                  <li>{locale === 'fr' ? 'Applications mobiles sur mesure' : 'Custom mobile applications'}</li>
                  <li>{locale === 'fr' ? 'Référencement SEO et positionnement Google' : 'SEO referencing and Google positioning'}</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-800">
                  📍 Moustakbal / Sidi Maarouf, Casablanca – Maroc
                </p>
                <p className="text-blue-600">📞 +212 701 193 811</p>
              </div>
            </div>
          </div>

          {/* Sénégal */}
          <div className="local-seo-card bg-white rounded-xl p-8 shadow-lg">
            <div className="flex items-center mb-6">
              <span className="text-4xl mr-4">🇸🇳</span>
              <h3 className="text-2xl font-bold text-gray-900">
                {locale === 'fr' ? 'Sénégal - Dakar' : 'Senegal - Dakar'}
              </h3>
            </div>

            <div className="space-y-4 text-gray-600">
              <p>
                {locale === 'fr'
                  ? 'Depuis notre siège à Casablanca (Maroc), OMA Digital accompagne les entreprises sénégalaises dans leur transformation digitale.'
                  : 'From our headquarters in Casablanca (Morocco), OMA Digital supports Senegalese companies in their digital transformation.'
                }
              </p>

              <div className="space-y-2">
                <p><strong>{locale === 'fr' ? 'Services disponibles au Sénégal :' : 'Services available in Senegal:'}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>{locale === 'fr' ? 'Création de sites web modernes' : 'Modern website creation'}</li>
                  <li>{locale === 'fr' ? 'Développement e-commerce performant' : 'High-performance e-commerce development'}</li>
                  <li>{locale === 'fr' ? 'Chatbots & automatisation intelligente' : 'Chatbots & intelligent automation'}</li>
                  <li>{locale === 'fr' ? 'Applications mobiles sur mesure' : 'Custom mobile applications'}</li>
                  <li>{locale === 'fr' ? 'Marketing digital & référencement SEO' : 'Digital marketing & SEO referencing'}</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold text-green-800">
                  {locale === 'fr' ? '🌍 Services 100 % à distance pour tout le Sénégal, l\'Afrique et le reste du monde.' : '🌍 100% remote services for all of Senegal, Africa and the rest of the world.'}
                </p>
                <p className="text-green-600">📞 +212 701 193 811 (WhatsApp)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {locale === 'fr'
                ? 'Pourquoi choisir OMA Digital au Maroc et Sénégal ?'
                : 'Why choose OMA Digital in Morocco and Senegal?'
              }
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="text-2xl mb-2">🏆</div>
                <h4 className="font-semibold mb-2">
                  {locale === 'fr' ? 'Expertise Locale' : 'Local Expertise'}
                </h4>
                <p className="text-gray-600 text-sm">
                  {locale === 'fr'
                    ? 'Connaissance approfondie des marchés marocain et sénégalais'
                    : 'Deep knowledge of Moroccan and Senegalese markets'
                  }
                </p>
              </div>
              <div>
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-semibold mb-2">
                  {locale === 'fr' ? 'Prix Compétitifs' : 'Competitive Prices'}
                </h4>
                <p className="text-gray-600 text-sm">
                  {locale === 'fr'
                    ? 'Tarifs adaptés aux budgets des entreprises africaines'
                    : 'Rates adapted to African business budgets'
                  }
                </p>
              </div>
              <div>
                <div className="text-2xl mb-2">🚀</div>
                <h4 className="font-semibold mb-2">
                  {locale === 'fr' ? 'Support Continu' : 'Continuous Support'}
                </h4>
                <p className="text-gray-600 text-sm">
                  {locale === 'fr'
                    ? 'Accompagnement personnalisé en français et en anglais'
                    : 'Personalized support in French and English'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}