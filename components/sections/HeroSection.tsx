import HeroClient from './HeroClient'
import fs from 'fs'
import path from 'path'

interface HeroSectionProps {
  locale: string
}

interface ServiceSlide {
  title: string
  description: string
  image_path: string
}

interface HeroData {
  services_slider: ServiceSlide[]
  video_slider: string[]
}

function getHeroData(locale: string): HeroData {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', locale, 'common.json')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContent)
    
    return {
      services_slider: data?.hero?.services_slider || [],
      video_slider: data?.hero?.video_slider || []
    }
  } catch (error) {
    console.error('Error loading hero data:', error)
    return {
      services_slider: [
        {
          title: locale === 'fr' ? 'Développement Web' : 'Web Development',
          description: locale === 'fr' ? 'Sites web modernes et performants' : 'Modern and high-performance websites',
          image_path: '/images/logo.webp'
        }
      ],
      video_slider: ['/videos/hero1.mp4', '/videos/hero2.mp4', '/videos/hero3.mp4']
    }
  }
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const { services_slider: servicesData, video_slider: videosData } = getHeroData(locale)

  return <HeroClient servicesData={servicesData} videosData={videosData} locale={locale} />
}