import { Metadata } from 'next'
import HeroSection from '@/components/sections/HeroSection'
import ServicesOverview from '@/components/sections/ServicesOverview'
import LocalSEO from '@/components/sections/LocalSEO'
import BlogOverview from '@/components/sections/BlogOverview'
import SmartChatbot from '@/components/chatbot/SmartChatbot'
import ScrollAnimations from '@/components/ScrollAnimations'

interface HomePageProps {
  params: { locale: string }
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = params.locale
  
  return {
    title: locale === 'fr' 
      ? 'OMA Digital - Agence Web & Marketing Digital au Maroc & Sénégal'
      : 'OMA Digital - Web Agency & Digital Marketing in Morocco & Senegal',
    description: locale === 'fr'
      ? 'Agence digitale experte basée à Casablanca (Maroc) servant le Maroc et le Sénégal. Solutions web, mobile et marketing digital sur mesure pour votre croissance.'
      : 'Expert digital agency based in Casablanca (Morocco) serving Morocco and Senegal. Custom web, mobile and digital marketing solutions for your growth.',
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/${locale}`,
      languages: {
        'fr-MA': `${process.env.NEXT_PUBLIC_DOMAIN}/fr`,
        'en': `${process.env.NEXT_PUBLIC_DOMAIN}/en`,
        'x-default': `${process.env.NEXT_PUBLIC_DOMAIN}/fr`
      }
    }
  }
}

export default function HomePage({ params }: HomePageProps) {
  return (
    <main>
      <ScrollAnimations />
      <div className="hero-content">
        <HeroSection locale={params.locale} />
      </div>
      <div className="services-section">
        <ServicesOverview locale={params.locale} />
      </div>
      <div className="local-seo-section">
        <LocalSEO locale={params.locale} />
      </div>
      <div className="blog-section">
        <BlogOverview locale={params.locale} />
      </div>
      <SmartChatbot />
    </main>
  )
}