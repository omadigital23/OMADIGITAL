
import { Metadata } from 'next'
import LayoutClient from './layout-client'
import './globals.css'
import { getCommonTranslations } from '../../lib/translations'
import type { Locale } from '../../lib/translations'

const SITE_URL = 'https://www.omadigital.net'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isFr = locale === 'fr'

  return {
    title: {
      template: '%s | OMA Digital',
      default: isFr
        ? 'OMA Digital — Agence Web & Marketing Digital à Casablanca, Maroc'
        : 'OMA Digital — Web Agency & Digital Marketing in Casablanca, Morocco'
    },
    metadataBase: new URL(SITE_URL),
    description: isFr
      ? 'Agence digitale OMA basée à Moustakbal, Casablanca. Création de sites web, applications mobiles, chatbot IA, marketing digital et automatisation WhatsApp pour les entreprises au Maroc.'
      : 'OMA Digital agency based in Moustakbal, Casablanca. Web design, mobile apps, AI chatbot, digital marketing and WhatsApp automation for businesses in Morocco.',
    keywords: isFr
      ? [
        'agence web Casablanca', 'création site web Casablanca', 'agence digitale Casablanca',
        'agence web Maroc', 'développeur Next.js Maroc', 'développeur freelance Casablanca',
        'agence web Moustakbal', 'agence digitale Moustakbal', 'Sidi Maarouf agence web',
        'application mobile Maroc', 'chatbot IA Maroc', 'automatisation WhatsApp Maroc',
        'marketing digital Maroc', 'agence SEO Casablanca', 'site e-commerce Maroc',
        'transformation digitale Maroc', 'OMA Digital', 'OMA agence Casablanca',
      ].join(', ')
      : [
        'web agency Casablanca', 'website creation Casablanca', 'digital agency Casablanca',
        'web agency Morocco', 'Next.js developer Morocco', 'freelance developer Casablanca',
        'mobile app Morocco', 'AI chatbot Morocco', 'WhatsApp automation Morocco',
        'digital marketing Morocco', 'SEO agency Casablanca', 'ecommerce Morocco',
        'digital transformation Morocco', 'OMA Digital', 'OMA agency Casablanca',
      ].join(', '),
    authors: [{ name: 'OMA Digital', url: SITE_URL }],
    creator: 'OMA Digital',
    publisher: 'OMA Digital',
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        'fr-MA': `${SITE_URL}/fr`,
        'en': `${SITE_URL}/en`,
        'x-default': `${SITE_URL}/fr`,
      }
    },
    openGraph: {
      type: 'website',
      locale: isFr ? 'fr_MA' : 'en_US',
      url: `${SITE_URL}/${locale}`,
      siteName: 'OMA Digital',
      title: isFr
        ? 'OMA Digital — Agence Web & Marketing Digital à Casablanca, Maroc'
        : 'OMA Digital — Web Agency & Digital Marketing in Casablanca, Morocco',
      description: isFr
        ? 'Agence digitale basée à Moustakbal, Casablanca. Sites web, apps mobiles, chatbot IA, marketing digital et automatisation WhatsApp.'
        : 'Digital agency based in Moustakbal, Casablanca. Web, mobile, AI chatbot, digital marketing and WhatsApp automation.',
      images: [
        {
          url: `${SITE_URL}/images/logo.webp`,
          width: 1200,
          height: 630,
          alt: 'OMA Digital — Agence Web Casablanca',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@omasenegal',
      creator: '@omasenegal',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    icons: {
      icon: [
        { url: '/images/logo.webp', sizes: '32x32', type: 'image/webp' },
        { url: '/images/logo.webp', sizes: '16x16', type: 'image/webp' },
      ],
      apple: [{ url: '/images/logo.webp', sizes: '180x180', type: 'image/webp' }],
      shortcut: '/images/logo.webp',
    },
    manifest: '/manifest.json',
    // Geo meta tags (via other)
    other: {
      'geo.region': 'MA-05',
      'geo.placename': 'Casablanca, Maroc',
      'geo.position': '33.5731;-7.5898',
      'ICBM': '33.5731, -7.5898',
    },
  }
}

// JSON-LD schemas
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'OMA Digital',
  description: 'Agence digitale spécialisée en création de sites web, applications mobiles, chatbot IA et marketing digital à Casablanca, Maroc.',
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.webp`,
  image: `${SITE_URL}/images/logo.webp`,
  telephone: '+212701193811',
  email: 'omadigital23@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Moustakbal / Sidi Maarouf',
    addressLocality: 'Casablanca',
    addressRegion: 'Grand Casablanca',
    addressCountry: 'MA',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 33.5731,
    longitude: -7.5898,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    }
  ],
  sameAs: [
    'https://web.facebook.com/profile.php?id=61579740432372',
    'https://www.instagram.com/oma.senegal/',
  ],
  priceRange: '$$',
  areaServed: [
    { '@type': 'City', name: 'Casablanca' },
    { '@type': 'Country', name: 'Maroc' },
  ],
  hasMap: 'https://maps.google.com/?q=Moustakbal,Casablanca,Maroc',
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'OMA Digital',
  url: SITE_URL,
  description: 'Agence digitale à Casablanca — Sites web, apps mobiles, chatbot IA, marketing digital.',
  inLanguage: ['fr', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/fr/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const translations = getCommonTranslations(locale as Locale)

  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <LayoutClient locale={locale} translations={translations}>
        {children}
      </LayoutClient>
    </>
  )
}

