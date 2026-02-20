import { Metadata } from 'next'
import { getCommonTranslations } from '../../../lib/translations'
import type { Locale } from '../../../lib/translations'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'
  const url = `${domain}/${locale}/about`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = getCommonTranslations(locale as Locale) as any
  const seo = t?.seo?.about || {}

  return {
    title: seo.title || 'About Us',
    description: seo.description || 'Innovative digital agency based in Casablanca (Morocco).',
    alternates: {
      canonical: url,
      languages: {
        fr: `${domain}/fr/about`,
        en: `${domain}/en/about`,
        'x-default': `${domain}/fr/about`,
      },
    },
  }
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = getCommonTranslations(locale as Locale) as any
  const ap = t?.about_page || {}

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {ap.title || 'About OMA Digital'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {ap.subtitle || 'Your trusted partner for digital transformation'}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {ap.story_title || 'Our Story'}
            </h2>
            <div className="prose prose-lg mx-auto">
              <p>
                {ap.story_text || 'OMA Digital was born from the vision of supporting African businesses in their digital transformation.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {ap.founder_title || 'Our Founder'}
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{ap.founder_name || 'Amadou Fall'}</h3>
                <p className="text-blue-600 font-semibold">
                  {ap.founder_role || 'Founder & CEO'}
                </p>
              </div>
              <div className="prose prose-lg mx-auto">
                <p>
                  {ap.founder_bio || 'Amadou Fall, digital technology expert with over 10 years of experience.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">
              {ap.contact_title || 'Contact Us'}
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    {ap.address_title || 'Address'}
                  </h3>
                  <p className="text-gray-600">
                    {ap.address_value || 'Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt 15, Maroc'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    {ap.contact_label || 'Contact'}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {ap.phone_value || '+212 701 193 811'}
                  </p>
                  <p className="text-gray-600">
                    {ap.email_value || 'omadigital23@gmail.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}