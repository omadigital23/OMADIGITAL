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

type VideoSlide = string | { webm?: string; mp4?: string; poster?: string }

interface HeroData {
  services_slider: ServiceSlide[]
  video_slider: VideoSlide[]
}

function getHeroData(locale: string): HeroData {
  try {
    const filePath = path.join(process.cwd(), 'public', 'locales', locale, 'common.json')
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(fileContent)

    const rawVideos: VideoSlide[] = data?.hero?.video_slider || []
    return {
      services_slider: data?.hero?.services_slider || [],
      video_slider: rawVideos
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
      video_slider: ['/videos/hero1.webm', '/videos/hero2.webm', '/videos/hero3.webm']
    }
  }
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const { services_slider: servicesData, video_slider: videosData } = getHeroData(locale)

  return <HeroClient servicesData={servicesData} videosData={videosData} locale={locale} />
}