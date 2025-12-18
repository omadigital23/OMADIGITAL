import { Metadata } from 'next'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params
  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'
  const url = `${domain}/${locale}/about`

  return {
    title: locale === 'fr' ? 'À Propos' : 'About Us',
    description: locale === 'fr'
      ? 'Agence digitale innovante basée à Casablanca (Maroc) servant le Maroc et le Sénégal. Notre équipe d\'experts vous accompagne dans votre transformation digitale.'
      : 'Innovative digital agency based in Casablanca (Morocco) serving Morocco and Senegal. Our expert team supports your digital transformation.',
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
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {locale === 'fr' ? 'À Propos d\'OMA Digital' : 'About OMA Digital'}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            {locale === 'fr'
              ? 'Votre partenaire de confiance pour la transformation digitale au Maroc et Sénégal'
              : 'Your trusted partner for digital transformation in Morocco and Senegal'
            }
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {locale === 'fr' ? 'Notre Histoire' : 'Our Story'}
            </h2>
            <div className="prose prose-lg mx-auto">
              <p>
                {locale === 'fr'
                  ? 'OMA Digital est née de la vision d\'accompagner les entreprises africaines dans leur transformation digitale. Basée à Casablanca, notre agence étend ses services au Maroc et au Sénégal, offrant des solutions technologiques innovantes adaptées aux besoins locaux.'
                  : 'OMA Digital was born from the vision of supporting African businesses in their digital transformation. Based in Casablanca, our agency extends its services to Morocco and Senegal, offering innovative technological solutions adapted to local needs.'
                }
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
              {locale === 'fr' ? 'Notre Fondateur' : 'Our Founder'}
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Amadou Fall</h3>
                <p className="text-blue-600 font-semibold">
                  {locale === 'fr' ? 'Fondateur & CEO' : 'Founder & CEO'}
                </p>
              </div>
              <div className="prose prose-lg mx-auto">
                <p>
                  {locale === 'fr'
                    ? 'Amadou Fall, expert en technologies digitales avec plus de 10 ans d\'expérience, a fondé OMA Digital avec la mission de démocratiser l\'accès aux technologies modernes pour les entreprises africaines. Passionné par l\'innovation et l\'entrepreneuriat, il guide notre équipe vers l\'excellence technique et l\'innovation continue.'
                    : 'Amadou Fall, digital technology expert with over 10 years of experience, founded OMA Digital with the mission to democratize access to modern technologies for African businesses. Passionate about innovation and entrepreneurship, he guides our team towards technical excellence and continuous innovation.'
                  }
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
              {locale === 'fr' ? 'Nous Contacter' : 'Contact Us'}
            </h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    {locale === 'fr' ? 'Adresse' : 'Address'}
                  </h3>
                  <p className="text-gray-600">
                    {process.env.COMPANY_ADDRESS || 'Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt 15, Maroc'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    {locale === 'fr' ? 'Contact' : 'Contact'}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    {process.env.COMPANY_PHONE || '+212 701 193 811'}
                  </p>
                  <p className="text-gray-600">
                    {process.env.COMPANY_EMAIL || 'omadigital23@gmail.com'}
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