import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import HomePageClient from './HomePageClient'
import { getAgencyData } from '../../lib/content'
import { getCommonTranslations } from '../../lib/translations'
import type { Locale } from '../../lib/translations'

// Dynamically import client components to avoid hydration mismatches
const HeroSection = dynamic(() => import('../../components/sections/HeroSection'), { ssr: true })
const ServicesOverview = dynamic(() => import('../../components/sections/ServicesOverview'), { ssr: true })
const BlogOverview = dynamic(() => import('../../components/sections/BlogOverview'), { ssr: true })
const AgencyInfo = dynamic(() => import('../../components/sections/AgencyInfo'), { ssr: true })

interface HomePageProps {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = getCommonTranslations(locale as Locale)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seoHome = (t as any)?.seo?.home || {}

  return {
    title: seoHome.title || 'OMA Digital - Web Agency & Digital Marketing in Morocco & Senegal',
    description: seoHome.description || 'Expert digital agency based in Casablanca (Morocco) serving Morocco and Senegal.',
    alternates: {
      canonical: `https://www.omadigital.net/${locale}`,
      languages: {
        'fr-MA': 'https://www.omadigital.net/fr',
        'en': 'https://www.omadigital.net/en',
        'x-default': 'https://www.omadigital.net/fr'
      }
    }
  }
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params
  const agencyData = getAgencyData(locale)
  const translations = getCommonTranslations(locale as Locale)

  return (
    <main>
      <HomePageClient />
      <div className="hero-content">
        <HeroSection locale={locale} />
      </div>
      <div className="services-section">
        <ServicesOverview locale={locale} />
      </div>
      <div className="blog-section">
        <BlogOverview locale={locale} translations={translations} />
      </div>
      <div className="agency-info-section">
        <AgencyInfo locale={locale} data={agencyData} translations={translations} />
      </div>
    </main>
  )
}