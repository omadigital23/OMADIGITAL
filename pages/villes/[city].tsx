/**
 * City Landing Page
 * Dynamic page for each city (Dakar, Thiès, Casablanca, Rabat, Marrakech)
 * Uses ISR for optimal performance and local SEO
 * @module pages/villes/[city]
 */

import { GetStaticProps, GetStaticPaths } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Star, TrendingUp, Users, Award } from 'lucide-react';
import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { SocialMediaLinks } from '../../src/components/SocialMediaLinks';

interface CityPageProps {
  city: string;
  locale: string;
}

/**
 * City Landing Page Component
 * 
 * Features:
 * - Local SEO optimized
 * - City-specific services and pricing
 * - Local testimonials
 * - Contact information
 * - Accessible (WCAG 2.1 AA)
 */
export default function CityPage({ city, locale }: CityPageProps) {
  const { t } = useTranslation('cities');

  // Get city data
  const cityData = t(`cities.${city}`, { returnObjects: true }) as any;

  if (!cityData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ville non trouvée</h1>
          <Link href="/" className="text-orange-600 hover:text-orange-700">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const pageTitle = t('page_title_template').replace('{city}', cityData.name);
  const pageDescription = t('page_description_template').replace('{city}', cityData.name);
  const heroTitle = t('hero_title_template').replace('{city}', cityData.name);
  const heroSubtitle = t('hero_subtitle_template').replace('{city}', cityData.name);
  const pageUrl = `https://www.omadigital.net/${locale}/villes/${city}`;

  // Structured Data for Local SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `OMA Digital ${cityData.name}`,
    description: cityData.description,
    url: pageUrl,
    telephone: cityData.contact.phone,
    email: cityData.contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: cityData.contact.address,
      addressLocality: cityData.name,
      addressRegion: cityData.region,
      addressCountry: cityData.country === 'Sénégal' ? 'SN' : 'MA',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city === 'dakar' ? '14.6928' : city === 'thies' ? '14.7646' : city === 'casablanca' ? '33.5731' : city === 'rabat' ? '34.0209' : '31.6295',
      longitude: city === 'dakar' ? '-17.4467' : city === 'thies' ? '-16.9394' : city === 'casablanca' ? '-7.5898' : city === 'rabat' ? '-6.8416' : '-7.9811',
    },
    openingHours: cityData.contact.hours,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      bestRating: '5',
      worstRating: '1',
      ratingCount: parseInt(cityData.stats.clients.replace('+', '')) || 50,
      reviewCount: parseInt(cityData.stats.clients.replace('+', '')) || 50,
    },
    priceRange: '$$',
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />

        {/* Local SEO */}
        <meta name="geo.region" content={cityData.country === 'Sénégal' ? 'SN' : 'MA'} />
        <meta name="geo.placename" content={cityData.name} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:locale" content={locale === 'fr' ? 'fr_FR' : 'en_US'} />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="pt-20 md:pt-24">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center">
                <div className="flex items-center justify-center mb-6">
                  <MapPin size={32} className="mr-3" />
                  <span className="text-xl font-semibold">{cityData.name}, {cityData.country}</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  {heroTitle}
                </h1>
                <p className="text-xl md:text-2xl text-orange-100 mb-8">
                  {heroSubtitle}
                </p>
                <p className="text-lg text-orange-50 mb-8 max-w-3xl mx-auto">
                  {cityData.description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="inline-block px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {t('cta.button_primary')}
                  </Link>
                  <a
                    href={`tel:${cityData.contact.phone}`}
                    className="inline-block px-8 py-4 bg-orange-700 text-white font-bold rounded-lg hover:bg-orange-800 transition-colors"
                  >
                    {t('cta.button_secondary')}
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="bg-white py-12 border-b border-gray-200">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <Users size={32} className="mx-auto text-orange-600 mb-2" />
                  <div className="text-3xl font-bold text-gray-900">{cityData.stats.clients}</div>
                  <div className="text-gray-600">Clients</div>
                </div>
                <div className="text-center">
                  <Award size={32} className="mx-auto text-orange-600 mb-2" />
                  <div className="text-3xl font-bold text-gray-900">{cityData.stats.projects}</div>
                  <div className="text-gray-600">Projets</div>
                </div>
                <div className="text-center">
                  <Star size={32} className="mx-auto text-orange-600 mb-2" />
                  <div className="text-3xl font-bold text-gray-900">{cityData.stats.satisfaction}</div>
                  <div className="text-gray-600">Satisfaction</div>
                </div>
                <div className="text-center">
                  <TrendingUp size={32} className="mx-auto text-orange-600 mb-2" />
                  <div className="text-3xl font-bold text-gray-900">{cityData.stats.average_roi}</div>
                  <div className="text-gray-600">ROI moyen</div>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
                {t('services_title').replace('{city}', cityData.name)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {cityData.services.map((service: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="text-2xl font-bold text-orange-600 mb-4">{service.price}</div>
                    <ul className="space-y-2">
                      {service.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start text-sm text-gray-700">
                          <span className="text-orange-600 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="bg-gray-100 py-16 md:py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
                {t('testimonials_title').replace('{city}', cityData.name)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {cityData.testimonials.map((testimonial: any, index: number) => (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={20} className="text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="font-bold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm text-orange-600">{testimonial.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 md:py-20">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
                {t('contact_title').replace('{city}', cityData.name)}
              </h2>
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin size={24} className="text-orange-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Adresse</div>
                      <div className="text-gray-700">{cityData.contact.address}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone size={24} className="text-orange-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Téléphone</div>
                      <a href={`tel:${cityData.contact.phone}`} className="text-orange-600 hover:text-orange-700">
                        {cityData.contact.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail size={24} className="text-orange-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Email</div>
                      <a href={`mailto:${cityData.contact.email}`} className="text-orange-600 hover:text-orange-700">
                        {cityData.contact.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock size={24} className="text-orange-600 mr-4 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Horaires</div>
                      <div className="text-gray-700">{cityData.contact.hours}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={`https://wa.me/${cityData.contact.whatsapp}`}
                      className="flex-1 inline-block px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors text-center"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('cta.button_whatsapp')}
                    </a>
                    <Link
                      href="/contact"
                      className="flex-1 inline-block px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors text-center"
                    >
                      Formulaire de contact
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Social Media */}
          <section className="bg-white py-12 border-t border-gray-200">
            <div className="container mx-auto px-4 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Suivez-nous sur les réseaux sociaux
              </h3>
              <SocialMediaLinks variant="horizontal" showLabels={true} className="justify-center" />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

/**
 * Generate static paths for all cities
 */
export const getStaticPaths: GetStaticPaths = async () => {
  const cities = ['dakar', 'thies', 'casablanca', 'rabat', 'marrakech'];
  const locales = ['fr', 'en'];
  const paths: { params: { city: string }; locale: string }[] = [];

  cities.forEach((city) => {
    locales.forEach((locale) => {
      paths.push({ params: { city }, locale });
    });
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

/**
 * Static Props with ISR
 */
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const city = params?.city as string;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'fr', ['common', 'cities'])),
      city,
      locale: locale ?? 'fr',
    },
    revalidate: 3600,
  };
};
