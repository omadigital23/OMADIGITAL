import { Metadata } from 'next'
import ServicesGrid from '../../../components/ServicesGrid'

interface ServicesPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const { locale } = await params
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
  const { locale } = await params
  const services = await getServices(locale)

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {locale === 'fr' ? 'Nos Services' : 'Our Services'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {locale === 'fr'
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
              {locale === 'fr' ? 'Pourquoi Choisir OMA Digital ?' : 'Why Choose OMA Digital?'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: '⚡', title: locale === 'fr' ? 'Rapide & Efficace' : 'Fast & Efficient', desc: locale === 'fr' ? 'Délais respectés, qualité garantie' : 'Respected deadlines, guaranteed quality' },
              { icon: '💰', title: locale === 'fr' ? 'Tarifs Compétitifs' : 'Competitive Pricing', desc: locale === 'fr' ? 'Meilleur rapport qualité-prix' : 'Best value for money' },
              { icon: '🤝', title: locale === 'fr' ? 'Support Dédié' : 'Dedicated Support', desc: locale === 'fr' ? 'Équipe disponible pour vous' : 'Team available for you' },
              { icon: '🚀', title: locale === 'fr' ? 'Technologie Moderne' : 'Modern Technology', desc: locale === 'fr' ? 'Stack technologique à jour' : 'Up-to-date tech stack' }
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
              {locale === 'fr' ? '💎 Grille Tarifaire OMA Digital 2025' : '💎 OMA Digital Pricing Grid 2025'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {locale === 'fr'
                ? 'Solutions digitales complètes adaptées à vos besoins et à votre budget'
                : 'Complete digital solutions tailored to your needs and budget'
              }
            </p>
          </div>

          <ServicesGrid services={services} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              {locale === 'fr' ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-lg text-gray-600">
              {locale === 'fr'
                ? 'Trouvez les réponses à vos questions sur nos services'
                : 'Find answers to your questions about our services'
              }
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: locale === 'fr' ? 'Quel est le délai de livraison ?' : 'What is the delivery timeline?',
                a: locale === 'fr'
                  ? 'Les délais varient selon le service : Site vitrine (2-3 semaines), E-commerce (3-4 semaines), App mobile (4-8 semaines). Nous respectons toujours les délais convenus.'
                  : 'Timelines vary by service: Showcase website (2-3 weeks), E-commerce (3-4 weeks), Mobile app (4-8 weeks). We always respect agreed deadlines.'
              },
              {
                q: locale === 'fr' ? 'Proposez-vous une maintenance après le lancement ?' : 'Do you offer maintenance after launch?',
                a: locale === 'fr'
                  ? 'Oui ! Tous nos services incluent 2 mois de maintenance gratuits. Après cela, nous proposons des forfaits de maintenance à partir de 500 DH/mois.'
                  : 'Yes! All our services include 2 months of free maintenance. After that, we offer maintenance packages starting from 500 DH/month.'
              },
              {
                q: locale === 'fr' ? 'Quelles sont les modalités de paiement ?' : 'What are the payment terms?',
                a: locale === 'fr'
                  ? 'Nous proposons un paiement en 2 étapes : 50% à la signature du contrat, 50% à la livraison. Des arrangements peuvent être faits pour les gros projets.'
                  : 'We offer 2-step payment: 50% upon contract signature, 50% upon delivery. Arrangements can be made for large projects.'
              },
              {
                q: locale === 'fr' ? 'Puis-je modifier mon projet après le démarrage ?' : 'Can I modify my project after it starts?',
                a: locale === 'fr'
                  ? 'Absolument ! Les modifications mineures sont incluses. Pour les modifications majeures, nous ajustons le devis et le délai en conséquence.'
                  : 'Absolutely! Minor modifications are included. For major changes, we adjust the quote and timeline accordingly.'
              },
              {
                q: locale === 'fr' ? 'Offrez-vous une formation pour utiliser le site/app ?' : 'Do you provide training to use the site/app?',
                a: locale === 'fr'
                  ? 'Oui, une formation complète est incluse dans tous nos services. Nous vous montrons comment gérer votre site, ajouter des produits, gérer les commandes, etc.'
                  : 'Yes, complete training is included in all our services. We show you how to manage your site, add products, manage orders, etc.'
              },
              {
                q: locale === 'fr' ? 'Quel support technique est disponible ?' : 'What technical support is available?',
                a: locale === 'fr'
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
              {locale === 'fr' ? 'Vous avez d\'autres questions ?' : 'Have more questions?'}
            </h3>
            <p className="mb-6">
              {locale === 'fr'
                ? 'Notre équipe est prête à discuter de votre projet et trouver la meilleure solution pour vous.'
                : 'Our team is ready to discuss your project and find the best solution for you.'
              }
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {locale === 'fr' ? 'Nous Contacter' : 'Contact Us'}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}