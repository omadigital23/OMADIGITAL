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
              <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="p-8">
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{service.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-blue-600">{service.price}</span>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-gray-700">
                      {params.locale === 'fr' ? 'Technologies clés :' : 'Key Technologies:'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.stack?.map((tech: string, index: number) => (
                        <span key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <a
                    href={`/${params.locale}/contact`}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-center block hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    {params.locale === 'fr' ? 'Demander un devis' : 'Request Quote'}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}