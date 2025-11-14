'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface ServiceSlide {
  title: string
  description: string
  image_path: string
}

type VideoSlide =
  | string
  | {
      webm?: string
      poster?: string
    }

interface HeroClientProps {
  servicesData: ServiceSlide[]
  videosData: VideoSlide[]
  locale: string
}

export default function HeroClient({ servicesData, videosData, locale }: HeroClientProps) {
  const [currentServiceSlide, setCurrentServiceSlide] = useState(0)
  const [currentVideoSlide, setCurrentVideoSlide] = useState(0)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (servicesData.length === 0) return
    const interval = setInterval(() => {
      setCurrentServiceSlide((prev) => (prev + 1) % servicesData.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [servicesData.length])

  useEffect(() => {
    if (videosData.length === 0) return
    const interval = setInterval(() => {
      setCurrentVideoSlide((prev) => (prev + 1) % videosData.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [videosData.length])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
    v.setAttribute('muted', '')
    v.setAttribute('autoplay', '')
    
    // Mobile-specific autoplay handling
    const handleUserInteraction = () => {
      const video = videoRef.current
      if (video && video.paused) {
        video.play().catch(() => {})
      }
    }
    
    // Try to play immediately
    const tryPlay = async () => {
      try {
        await v.play()
      } catch (_) {
        // If autoplay fails, wait for user interaction
        document.addEventListener('touchstart', handleUserInteraction, { once: true })
        document.addEventListener('click', handleUserInteraction, { once: true })
      }
    }
    
    // Add visibility change handling for mobile
    const handleVisibilityChange = () => {
      if (!document.hidden && v.paused) {
        v.play().catch(() => {})
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    tryPlay()
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('touchstart', handleUserInteraction)
      document.removeEventListener('click', handleUserInteraction)
    }
  }, [currentVideoSlide])

  const currentVideo = videosData[currentVideoSlide]
  const currentPoster = typeof currentVideo === 'string' ? undefined : currentVideo?.poster
  const srcs: { src: string; type: string }[] = (() => {
    if (!currentVideo) return []
    if (typeof currentVideo === 'string') {
      const lower = currentVideo.toLowerCase()
      const mime = lower.endsWith('.webm') ? 'video/webm' : 'video/webm'
      return [{ src: currentVideo, type: mime }]
    }
    const out: { src: string; type: string }[] = []
    if (currentVideo.webm) out.push({ src: currentVideo.webm, type: 'video/webm' })
    return out
  })()

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
      <div className="container mx-auto px-4 h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Side - Services Slider */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                {locale === 'fr' ? 'Transformez Votre' : 'Transform Your'}
                <span className="block text-yellow-400">
                  {locale === 'fr' ? 'Présence Digitale' : 'Digital Presence'}
                </span>
              </h1>
              
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-lg">
                {locale === 'fr' 
                  ? 'Agence digitale experte au Maroc & Sénégal. Solutions web, mobile et marketing sur mesure.'
                  : 'Expert digital agency in Morocco & Senegal. Custom web, mobile and marketing solutions.'
                }
              </p>
            </div>

            {/* Service Slide */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-start space-x-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={servicesData[currentServiceSlide]?.image_path || '/images/logo.webp'}
                    alt={servicesData[currentServiceSlide]?.title || ''}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {servicesData[currentServiceSlide]?.title}
                  </h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    {servicesData[currentServiceSlide]?.description}
                  </p>
                </div>
              </div>
              
              {/* Service Slide Indicators */}
              <div className="flex space-x-2 mt-4">
                {servicesData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentServiceSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentServiceSlide 
                        ? 'bg-yellow-400 w-8' 
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <a
                href={`/${locale}/contact`}
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-200 text-center cursor-pointer transform hover:scale-105 active:scale-95"
              >
                {locale === 'fr' ? 'Démarrer un Projet' : 'Start a Project'}
              </a>
              <a
                href={`/${locale}/services`}
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200 text-center cursor-pointer transform hover:scale-105 active:scale-95"
              >
                {locale === 'fr' ? 'Nos Services' : 'Our Services'}
              </a>
            </div>
          </div>

          {/* Right Side - Video Slider */}
          <div className="relative order-first lg:order-last" suppressHydrationWarning>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              {mounted ? (
              <video
                key={typeof currentVideo === 'string' ? currentVideo : `${currentVideo.webm || ''}`}
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                x-webkit-airplay="allow"
                webkit-playsinline="true"
                controls={false}
                preload="metadata"
                disablePictureInPicture
                poster={currentPoster}
                className="w-full h-full object-cover"
                onLoadedData={() => {
                  const v = videoRef.current
                  if (!v) return
                  v.muted = true
                  v.defaultMuted = true
                  v.play().catch(() => {})
                }}
                onCanPlay={() => {
                  const v = videoRef.current
                  if (!v) return
                  v.play().catch(() => {})
                }}
                onError={() => {
                  // Retry autoplay on error
                  setTimeout(() => {
                    const v = videoRef.current
                    if (v && v.paused) {
                      v.play().catch(() => {})
                    }
                  }, 1000)
                }}
              >
                {srcs.map((s) => (
                  <source key={`${s.type}-${s.src}`} src={s.src} type={s.type} />
                ))}
                {locale === 'fr' 
                  ? 'Votre navigateur ne supporte pas la vidéo.'
                  : 'Your browser does not support video.'
                }
              </video>
              ) : (
                <div className="w-full h-full bg-black/10" />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Left Arrow */}
              <button
                onClick={() => setCurrentVideoSlide((prev) => (prev - 1 + videosData.length) % videosData.length)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all duration-200 z-10 backdrop-blur-sm"
                aria-label={locale === 'fr' ? 'Vidéo précédente' : 'Previous video'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Right Arrow */}
              <button
                onClick={() => setCurrentVideoSlide((prev) => (prev + 1) % videosData.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full transition-all duration-200 z-10 backdrop-blur-sm"
                aria-label={locale === 'fr' ? 'Vidéo suivante' : 'Next video'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Video Slide Indicators */}
            <div className="flex justify-center space-x-3 mt-6">
              {videosData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentVideoSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentVideoSlide 
                      ? 'bg-yellow-400 scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"></div>
    </section>
  )
}
