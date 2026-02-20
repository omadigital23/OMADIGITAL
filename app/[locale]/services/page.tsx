import { Metadata } from 'next'
import ServicesGrid from '../../../components/ServicesGrid'
import { getCommonTranslations } from '../../../lib/translations'
import type { Locale } from '../../../lib/translations'
import { getServicesData } from '../../../lib/content'

interface ServicesPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const { locale } = await params
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'
  const url = `${domain}/${locale}/services`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = getCommonTranslations(locale as Locale) as any
  const seo = t?.seo?.services || {}

  return {
    title: seo.title || 'Our Services | OMA Digital Casablanca',
    description: seo.description || 'Discover our digital services in Casablanca, Morocco.',
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

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params
  const { services } = getServicesData(locale)
  const translations = getCommonTranslations(locale as Locale)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sp = (translations as any)?.services_page || {}
  const faqItems = Array.isArray(sp.faq) ? sp.faq : []

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {sp.title || 'Our Services'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {sp.subtitle || 'Digital agency based in Casablanca, Morocco.'}
          </p>
        </div>
      </section>

      {/* Why Choose OMA Digital */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              {sp.why_title || 'Why Choose OMA Digital?'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: '⚡', title: sp.why_fast_title || 'Fast & Efficient', desc: sp.why_fast_desc || 'Deadlines met, quality guaranteed' },
              { icon: '💰', title: sp.why_price_title || 'Competitive Pricing', desc: sp.why_price_desc || 'Best value for money' },
              { icon: '🤝', title: sp.why_support_title || 'Dedicated Support', desc: sp.why_support_desc || 'Team available for you' },
              { icon: '🚀', title: sp.why_tech_title || 'Modern Technology', desc: sp.why_tech_desc || 'Up-to-date tech stack' }
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
              {sp.pricing_title || '💎 OMA Digital Pricing Grid 2025'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {sp.pricing_subtitle || 'Complete digital solutions tailored to your needs and budget'}
            </p>
          </div>

          <ServicesGrid services={services} uiTranslations={translations.services_ui} />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              {sp.faq_title || 'Frequently Asked Questions'}
            </h2>
            <p className="text-lg text-gray-600">
              {sp.faq_subtitle || 'Find answers to your questions about our services'}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((faq: { q: string; a: string }, index: number) => (
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
              {sp.faq_more_title || 'Have more questions?'}
            </h3>
            <p className="mb-6">
              {sp.faq_more_desc || 'Our team is ready to discuss your project and find the best solution for you.'}
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {sp.faq_cta || 'Contact Us'}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}