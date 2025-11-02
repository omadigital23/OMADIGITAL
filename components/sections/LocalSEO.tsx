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
              ? 'Agence Digitale au Maroc & Sénégal' 
              : 'Digital Agency in Morocco & Senegal'
            }
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            {locale === 'fr'
              ? 'Basée à Casablanca, OMA Digital accompagne les entreprises du Maroc et du Sénégal dans leur transformation digitale avec des solutions sur mesure.'
              : 'Based in Casablanca, OMA Digital supports businesses in Morocco and Senegal in their digital transformation with custom solutions.'
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
                  ? 'Notre bureau principal à Casablanca dessert tout le Maroc : Rabat, Marrakech, Fès, Tanger, Agadir.'
                  : 'Our main office in Casablanca serves all of Morocco: Rabat, Marrakech, Fes, Tangier, Agadir.'
                }
              </p>
              
              <div className="space-y-2">
                <p><strong>{locale === 'fr' ? 'Services populaires au Maroc :' : 'Popular services in Morocco:'}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>{locale === 'fr' ? 'Agence web Maroc - Création site web Casablanca' : 'Web agency Morocco - Website creation Casablanca'}</li>
                  <li>{locale === 'fr' ? 'Site e-commerce Maroc - Développement Next.js' : 'E-commerce site Morocco - Next.js development'}</li>
                  <li>{locale === 'fr' ? 'Chatbot IA Maroc - Automatisation marketing' : 'AI Chatbot Morocco - Marketing automation'}</li>
                  <li>{locale === 'fr' ? 'Application mobile Maroc - Développement Casablanca' : 'Mobile app Morocco - Development Casablanca'}</li>
                  <li>{locale === 'fr' ? 'Agence SEO Maroc - Référencement Google' : 'SEO agency Morocco - Google referencing'}</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-800">
                  📍 Moustakbal/Sidimaarouf Casablanca, Maroc
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
                  ? 'OMA Digital offre ses services digitaux au marché sénégalais depuis le Maroc.'
                  : 'OMA Digital offers its digital services to the Senegalese market from Morocco.'
                }
              </p>
              
              <div className="space-y-2">
                <p><strong>{locale === 'fr' ? 'Services disponibles au Sénégal :' : 'Services available in Senegal:'}</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>{locale === 'fr' ? 'Création de sites web' : 'Website creation'}</li>
                  <li>{locale === 'fr' ? 'Développement e-commerce' : 'E-commerce development'}</li>
                  <li>{locale === 'fr' ? 'Chatbots et automatisation IA' : 'Chatbots and AI automation'}</li>
                  <li>{locale === 'fr' ? 'Applications mobiles' : 'Mobile applications'}</li>
                  <li>{locale === 'fr' ? 'Marketing digital et SEO' : 'Digital marketing and SEO'}</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold text-green-800">
                  {locale === 'fr' ? '🌍 Service à distance pour le Sénégal' : '🌍 Remote service for Senegal'}
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