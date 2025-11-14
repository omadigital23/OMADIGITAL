import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import LayoutClient from './layout-client'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale
  
  return {
    title: {
      template: '%s | OMA Digital',
      default: locale === 'fr' 
        ? 'OMA Digital - Agence Web & Marketing Digital au Maroc & Sénégal'
        : 'OMA Digital - Web Agency & Digital Marketing in Morocco & Senegal'
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_DOMAIN || 'https://www.omadigital.net'),
    description: locale === 'fr'
      ? 'Agence digitale experte basée à Casablanca (Maroc) servant le Maroc et le Sénégal. Solutions web, mobile et marketing digital sur mesure pour votre croissance.'
      : 'Expert digital agency based in Casablanca (Morocco) serving Morocco and Senegal. Custom web, mobile and digital marketing solutions for your growth.',
    keywords: locale === 'fr'
      ? 'agence web maroc, création site web casablanca, développeur freelance maroc, application mobile maroc, chatbot ia maroc, agence digitale casablanca, site e-commerce maroc, marketing digital maroc, agence seo maroc, agence web sénégal, création site web dakar, développeur next.js sénégal, bot whatsapp maroc sénégal, automatisation marketing, community management, transformation digitale afrique, solutions digitales afrique, agence panafricaine digitale'
      : 'web agency morocco, website creation casablanca, freelance developer morocco, mobile application morocco, ai chatbot morocco, digital agency casablanca, ecommerce site morocco, digital marketing morocco, seo agency morocco, web agency senegal, website creation dakar, nextjs developer senegal, whatsapp bot morocco senegal, marketing automation, community management, digital transformation africa, digital solutions africa, panafrican digital agency',
    authors: [{ name: 'OMA Digital' }],
    creator: 'OMA Digital',
    publisher: 'OMA Digital',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/${locale}`,
      languages: {
        'fr-MA': `${process.env.NEXT_PUBLIC_DOMAIN}/fr`,
        'en': `${process.env.NEXT_PUBLIC_DOMAIN}/en`,
        'x-default': `${process.env.NEXT_PUBLIC_DOMAIN}/fr`
      }
    },
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_MA' : 'en_US',
      url: `${process.env.NEXT_PUBLIC_DOMAIN}/${locale}`,
      siteName: 'OMA Digital',
      title: locale === 'fr' 
        ? 'OMA Digital - Agence Web & Marketing Digital au Maroc & Sénégal'
        : 'OMA Digital - Web Agency & Digital Marketing in Morocco & Senegal',
      description: locale === 'fr'
        ? 'Agence digitale experte basée à Casablanca (Maroc) servant le Maroc et le Sénégal.'
        : 'Expert digital agency based in Casablanca (Morocco) serving Morocco and Senegal.',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_DOMAIN}/images/logo.webp`,
          width: 1200,
          height: 630,
          alt: 'OMA Digital'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@omadigital',
      creator: '@omadigital'
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION
    }
  }
}

export default function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <html lang={params.locale}>
      <body className={inter.className} suppressHydrationWarning>
        <LayoutClient locale={params.locale}>
          {children}
        </LayoutClient>
      </body>
    </html>
  )
}