import { Metadata } from 'next'

interface ServicesPageProps {
  params: { locale: string }
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const locale = params.locale
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'
  const url = `${domain}/${locale}/services`
  
  return {
    title: locale === 'fr' ? 'Nos Services' : 'Our Services',
    description: locale === 'fr'
      ? 'Découvrez nos services : développement web, applications mobiles, e-commerce, SEO, marketing digital et consulting IT au Maroc et Sénégal.'
      : 'Discover our services: web development, mobile apps, e-commerce, SEO, digital marketing and IT consulting in Morocco and Senegal.',
    alternates: {
      canonical: url,
      languages: {
        fr: `${domain}/fr/services`,
        en: `${domain}/en/services`,
        'x-default': `${domain}/fr/services`,
      },
    },
  }
}

import { getLocalizedContent } from '../../../lib/utils/content'

async function getServices(locale: string) {
  const data = await getLocalizedContent(locale)
  return data?.services || []
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const services = await getServices(params.locale)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {params.locale === 'fr' ? 'Nos Services' : 'Our Services'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {params.locale === 'fr' 
              ? 'Solutions digitales complètes pour transformer votre entreprise au Maroc et Sénégal'
              : 'Complete digital solutions to transform your business in Morocco and Senegal'
            }
          </p>
        </div>
      </section>

      {/* Why Choose OMA Digital */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              {params.locale === 'fr' ? 'Pourquoi Choisir OMA Digital ?' : 'Why Choose OMA Digital?'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '⚡', title: params.locale === 'fr' ? 'Rapide & Efficace' : 'Fast & Efficient', desc: params.locale === 'fr' ? 'Délais respectés, qualité garantie' : 'Respected deadlines, guaranteed quality' },
              { icon: '💰', title: params.locale === 'fr' ? 'Tarifs Compétitifs' : 'Competitive Pricing', desc: params.locale === 'fr' ? 'Meilleur rapport qualité-prix' : 'Best value for money' },
              { icon: '🤝', title: params.locale === 'fr' ? 'Support Dédié' : 'Dedicated Support', desc: params.locale === 'fr' ? 'Équipe disponible pour vous' : 'Team available for you' },
              { icon: '🚀', title: params.locale === 'fr' ? 'Technologie Moderne' : 'Modern Technology', desc: params.locale === 'fr' ? 'Stack technologique à jour' : 'Up-to-date tech stack' }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              {params.locale === 'fr' ? '💎 Grille Tarifaire OMA Digital 2025' : '💎 OMA Digital Pricing Grid 2025'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {params.locale === 'fr' 
                ? 'Solutions digitales complètes adaptées à vos besoins et à votre budget'
                : 'Complete digital solutions tailored to your needs and budget'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any) => (
              <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col">
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm flex-1">{service.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-blue-600">{service.price}</span>
                  </div>
                  
                  {/* Détails inclus */}
                  {service.includes && service.includes.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-3 text-gray-700 text-sm">
                        {params.locale === 'fr' ? '✓ Détails inclus :' : '✓ What\'s Included:'}
                      </h4>
                      <ul className="space-y-2">
                        {service.includes.map((item: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start">
                            <span className="text-blue-600 mr-2 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-gray-700 text-sm">
                      {params.locale === 'fr' ? '🔧 Technologies clés :' : '🔧 Key Technologies:'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.stack?.map((tech: string, index: number) => (
                        <span key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => alert(`${service.title} ajouté au panier`)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-center block w-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 mt-auto"
                  >
                    {params.locale === 'fr' ? 'Ajouter au panier' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              {params.locale === 'fr' ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-lg text-gray-600">
              {params.locale === 'fr' 
                ? 'Trouvez les réponses à vos questions sur nos services'
                : 'Find answers to your questions about our services'
              }
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: params.locale === 'fr' ? 'Quel est le délai de livraison ?' : 'What is the delivery timeline?',
                a: params.locale === 'fr' 
                  ? 'Les délais varient selon le service : Site vitrine (2-3 semaines), E-commerce (3-4 semaines), App mobile (4-8 semaines). Nous respectons toujours les délais convenus.'
                  : 'Timelines vary by service: Showcase website (2-3 weeks), E-commerce (3-4 weeks), Mobile app (4-8 weeks). We always respect agreed deadlines.'
              },
              {
                q: params.locale === 'fr' ? 'Proposez-vous une maintenance après le lancement ?' : 'Do you offer maintenance after launch?',
                a: params.locale === 'fr'
                  ? 'Oui ! Tous nos services incluent 2 mois de maintenance gratuits. Après cela, nous proposons des forfaits de maintenance à partir de 500 DH/mois.'
                  : 'Yes! All our services include 2 months of free maintenance. After that, we offer maintenance packages starting from 500 DH/month.'
              },
              {
                q: params.locale === 'fr' ? 'Quelles sont les modalités de paiement ?' : 'What are the payment terms?',
                a: params.locale === 'fr'
                  ? 'Nous proposons un paiement en 2 étapes : 50% à la signature du contrat, 50% à la livraison. Des arrangements peuvent être faits pour les gros projets.'
                  : 'We offer 2-step payment: 50% upon contract signature, 50% upon delivery. Arrangements can be made for large projects.'
              },
              {
                q: params.locale === 'fr' ? 'Puis-je modifier mon projet après le démarrage ?' : 'Can I modify my project after it starts?',
                a: params.locale === 'fr'
                  ? 'Absolument ! Les modifications mineures sont incluses. Pour les modifications majeures, nous ajustons le devis et le délai en conséquence.'
                  : 'Absolutely! Minor modifications are included. For major changes, we adjust the quote and timeline accordingly.'
              },
              {
                q: params.locale === 'fr' ? 'Offrez-vous une formation pour utiliser le site/app ?' : 'Do you provide training to use the site/app?',
                a: params.locale === 'fr'
                  ? 'Oui, une formation complète est incluse dans tous nos services. Nous vous montrons comment gérer votre site, ajouter des produits, gérer les commandes, etc.'
                  : 'Yes, complete training is included in all our services. We show you how to manage your site, add products, manage orders, etc.'
              },
              {
                q: params.locale === 'fr' ? 'Quel support technique est disponible ?' : 'What technical support is available?',
                a: params.locale === 'fr'
                  ? 'Nous offrons un support par email et WhatsApp. Pour les clients premium, un support téléphonique est disponible. Les temps de réponse sont généralement < 24h.'
                  : 'We offer support via email and WhatsApp. For premium clients, phone support is available. Response times are typically < 24h.'
              }
            ].map((faq, index) => (
              <details key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group">
                <summary className="font-semibold text-gray-800 flex items-center justify-between">
                  <span>{faq.q}</span>
                  <span className="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-600 mt-4 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-center">
            <h3 className="text-2xl font-bold mb-3">
              {params.locale === 'fr' ? 'Vous avez d\'autres questions ?' : 'Have more questions?'}
            </h3>
            <p className="mb-6">
              {params.locale === 'fr'
                ? 'Notre équipe est prête à discuter de votre projet et trouver la meilleure solution pour vous.'
                : 'Our team is ready to discuss your project and find the best solution for you.'
              }
            </p>
            <a
              href={`/${params.locale}/contact`}
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {params.locale === 'fr' ? 'Nous Contacter' : 'Contact Us'}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}