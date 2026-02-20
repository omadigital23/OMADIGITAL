import HeroClient from './HeroClient'
import { getHeroData } from '../../lib/content'

interface HeroSectionProps {
  locale: string
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const heroData = getHeroData(locale)

  return <HeroClient servicesData={heroData.services_slider} videosData={heroData.video_slider} locale={locale} />
}