import { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Dynamically import client components to avoid hydration mismatches
const HeroSection = dynamic(() => import('../../components/sections/HeroSection'), { ssr: true })
const ServicesOverview = dynamic(() => import('../../components/sections/ServicesOverview'), { ssr: true })
const BlogOverview = dynamic(() => import('../../components/sections/BlogOverview'), { ssr: true })
const AgencyInfo = dynamic(() => import('../../components/sections/AgencyInfo'), { ssr: true })
const SmartChatbot = dynamic(() => import('../../components/chatbot/SmartChatbot'), { ssr: false })
const ScrollAnimations = dynamic(() => import('../../components/ScrollAnimations'), { ssr: false })

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
      <div className="blog-section">
        <BlogOverview locale={params.locale} />
      </div>
      <div className="agency-info-section">
        <AgencyInfo locale={params.locale} />
      </div>
      <SmartChatbot />
    </main>
  )
}