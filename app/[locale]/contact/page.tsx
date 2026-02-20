import { Metadata } from 'next'
import ContactForm from '../../../components/forms/ContactForm'
import { getCommonTranslations } from '../../../lib/translations'
import type { Locale } from '../../../lib/translations'

interface ContactPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'
  const url = `${domain}/${locale}/contact`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = getCommonTranslations(locale as Locale) as any
  const seo = t?.seo?.contact || {}

  return {
    title: seo.title || 'Contact',
    description: seo.description || 'Contact OMA Digital for your digital projects.',
    alternates: {
      canonical: url,
      languages: {
        fr: `${domain}/fr/contact`,
        en: `${domain}/en/contact`,
        'x-default': `${domain}/fr/contact`,
      },
    },
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = getCommonTranslations(locale as Locale) as any
  const cp = t?.contact_page || {}

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {cp.title || 'Contact Us'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {cp.subtitle || 'Ready to transform your business? Let\'s talk about your project'}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-8">
                {cp.send_message || 'Send us a message'}
              </h2>
              <ContactForm locale={locale} />
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-8">
                {cp.contact_info || 'Contact Information'}
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">
                    {cp.address_title || 'Address'}
                  </h3>
                  <p className="text-gray-600">
                    Moustakbal / Sidi Maarouf<br />
                    Casablanca<br />
                    Maroc
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">
                    {cp.phone_title || 'Phone'}
                  </h3>
                  <p className="text-gray-600">{cp.phone_value || '+212 701 193 811 | +221 77 143 01 37'}</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">{cp.email_title || 'Email'}</h3>
                  <p className="text-gray-600">{cp.email_value || 'omadigital23@gmail.com'}</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">
                    {cp.hours_title || 'Business Hours'}
                  </h3>
                  <p className="text-gray-600">
                    {cp.hours_weekday || 'Monday - Friday: 9:00 AM - 6:00 PM'}
                  </p>
                  <p className="text-gray-600">
                    {cp.hours_weekend || 'Saturday: 9:00 AM - 1:00 PM'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {cp.map_title || 'Our Location'}
          </h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.8!2d-7.6!3d33.57!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDM0JzEyLjAiTiA3wrAzNicwMC4wIlc!5e0!3m2!1sen!2sma!4v1234567890"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  )
}