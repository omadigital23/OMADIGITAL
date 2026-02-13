import { Metadata } from 'next'
import ContactForm from '../../../components/forms/ContactForm'

interface ContactPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'
  const url = `${domain}/${locale}/contact`

  return {
    title: locale === 'fr' ? 'Contact' : 'Contact',
    description: locale === 'fr'
      ? 'Contactez OMA Digital pour vos projets digitaux au Maroc et Sénégal. Bureau à Casablanca (Maroc). Devis gratuit et consultation personnalisée.'
      : 'Contact OMA Digital for your digital projects in Morocco and Senegal. Office in Casablanca (Morocco). Free quote and personalized consultation.',
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
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {locale === 'fr' ? 'Contactez-nous' : 'Contact Us'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {locale === 'fr'
              ? 'Prêt à transformer votre entreprise ? Parlons de votre projet'
              : 'Ready to transform your business? Let\'s talk about your project'
            }
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
                {locale === 'fr' ? 'Envoyez-nous un message' : 'Send us a message'}
              </h2>
              <ContactForm locale={locale} />
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-8">
                {locale === 'fr' ? 'Informations de contact' : 'Contact Information'}
              </h2>

              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">
                    {locale === 'fr' ? 'Adresse' : 'Address'}
                  </h3>
                  <p className="text-gray-600">
                    Moustakbal / Sidi Maarouf<br />
                    Casablanca<br />
                    Maroc
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">
                    {locale === 'fr' ? 'Téléphone' : 'Phone'}
                  </h3>
                  <p className="text-gray-600">+212 701 193 811 | +221 77 143 01 37</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Email</h3>
                  <p className="text-gray-600">omasenegal25@gmail.com</p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-4">
                    {locale === 'fr' ? 'Horaires d\'ouverture' : 'Opening Hours'}
                  </h3>
                  <p className="text-gray-600">
                    {locale === 'fr' ? 'Lundi - Vendredi: 9h00 - 18h00' : 'Monday - Friday: 9:00 AM - 6:00 PM'}
                  </p>
                  <p className="text-gray-600">
                    {locale === 'fr' ? 'Samedi: 9h00 - 13h00' : 'Saturday: 9:00 AM - 1:00 PM'}
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
            {locale === 'fr' ? 'Notre localisation' : 'Our Location'}
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