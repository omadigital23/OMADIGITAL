import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Play, ArrowRight, Star, Users, TrendingUp, MessageSquare, Globe, Bot } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { trackEvent, generateWhatsAppLink } from '../utils/supabase/info';
import { useABTest, useRecordConversion } from '../hooks/useABTest';
import { useABTestSimple } from '../hooks/useABTestSimple';
import { useTranslation } from 'next-i18next';
import { getConnectionSpeed, getAdaptiveVideoQuality } from '../lib/performance';

export function HeroSection() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(!!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  
  // A/B Testing hooks
  const heroCtaVariant = useABTest('hero_cta_button');
  const recordConversion = useRecordConversion('hero_cta_button', heroCtaVariant);
  const { variant: ctaVariant, trackConversion } = useABTestSimple('hero_cta_text');

  const slides = [
    {
      title: t('hero.slide1.title'),
      subtitle: t('hero.slide1.subtitle'),
      description: t('hero.slide1.description'),
      cta: t('hero.slide1.cta'),
      video: "/videos/hero1.webm",
      duration: 6000, // 6 seconds
      stats: [
        { label: t('hero.stats.pme_transformed'), value: "200+" },
        { label: t('hero.stats.satisfaction_rate'), value: "98%" },
        { label: t('hero.stats.productivity_gain'), value: "75%" }
      ]
    },
    {
      title: t('hero.slide2.title'),
      subtitle: t('hero.slide2.subtitle'),
      description: t('hero.slide2.description'),
      cta: t('hero.slide2.cta'),
      video: "/videos/hero2.webm",
      duration: 6000, // 6 seconds
      stats: [
        { label: t('hero.stats.chatbots_deployed'), value: "150+" },
        { label: t('hero.stats.cost_reduction'), value: "60%" },
        { label: t('hero.stats.response_time'), value: "<5min" }
      ]
    },
    {
      title: t('hero.slide3.title'),
      subtitle: t('hero.slide3.subtitle'),
      description: t('hero.slide3.description'),
      cta: t('hero.slide3.cta'),
      video: "/videos/hero3.webm",
      duration: 6000, // 6 seconds
      stats: [
        { label: t('hero.stats.average_speed'), value: "1.2s" },
        { label: t('hero.stats.seo_improvement'), value: "95+" },
        { label: t('hero.stats.mobile_score'), value: "180+" }
      ]
    },
    {
      title: t('hero.slide4.title'),
      subtitle: t('hero.slide4.subtitle'),
      description: t('hero.slide4.description'),
      cta: t('hero.slide4.cta'),
      video: "/videos/hero4.webm",
      duration: 6000, // 6 seconds
      stats: [
        { label: t('hero.stats.projects_completed'), value: "300+" },
        { label: t('hero.stats.average_roi'), value: "+200%" },
        { label: t('hero.stats.support_247'), value: "100%" }
      ]
    },
    {
      title: t('hero.slide5.title'),
      subtitle: t('hero.slide5.subtitle'),
      description: t('hero.slide5.description'),
      cta: t('hero.slide5.cta'),
      video: "/videos/hero5.webm",
      duration: 6000, // 6 seconds
      stats: [
        { label: t('hero.stats.patents'), value: "12" },
        { label: t('hero.stats.tech_partners'), value: "25+" },
        { label: t('hero.stats.rd_budget'), value: "30%" }
      ]
    },
    {
      title: t('hero.slide6.title'),
      subtitle: t('hero.slide6.subtitle'),
      description: t('hero.slide6.description'),
      cta: t('hero.slide6.cta'),
      video: "/videos/hero6.webm",
      duration: 10000, // 10 seconds
      stats: [
        { label: t('hero.stats.clients_satisfied'), value: "200+" },
        { label: t('hero.stats.countries'), value: "2" },
        { label: t('hero.stats.years_experience'), value: "9+" }
      ]
    }
  ];

  // Add a new section to highlight key offers right after the hero
  const keyOffers = [
    {
      icon: MessageSquare,
      title: t('hero.key_offers.whatsapp.title'),
      description: t('hero.key_offers.whatsapp.description'),
      cta: t('hero.key_offers.whatsapp.cta'),
      targetSection: 'contact-form'
    },
    {
      icon: Globe,
      title: t('hero.key_offers.website.title'),
      description: t('hero.key_offers.website.description'),
      cta: t('hero.key_offers.website.cta'),
      targetSection: 'contact-form'
    },
    {
      icon: Bot,
      title: t('hero.key_offers.ai.title'),
      description: t('hero.key_offers.ai.description'),
      cta: t('hero.key_offers.ai.cta'),
      targetSection: 'contact-form'
    }
  ];

  // Ensure currentSlideData is properly defined with a fallback
  const currentSlideData = slides[currentSlide] || slides[0];
  
  // Clear existing interval and set up new one when slides change
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Function to schedule next slide transition
    const scheduleNextSlide = () => {
      const currentSlideDuration = slides[currentSlide]?.duration || 6000;
      
      intervalRef.current = setTimeout(() => {
        setCurrentSlide((prev) => {
          const nextSlide = (prev + 1) % slides.length;
          
          // Pause previous video and play current one
          if (videoRefs.current[prev]) {
            videoRefs.current[prev]!.pause();
          }
          if (videoRefs.current[nextSlide]) {
            videoRefs.current[nextSlide]!.play().catch(() => {
              // Ignore autoplay errors
            });
          }
          
          return nextSlide;
        });
      }, currentSlideDuration);
    };
    
    // Schedule the next slide
    scheduleNextSlide();

    // Cleanup function to clear timeout
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentSlide, slides.length]); // Depend on currentSlide to reschedule with correct duration

  // Play first video on mount
  useEffect(() => {
    if (videoRefs.current[0]) {
      // Add loading optimization
      videoRefs.current[0].preload = 'metadata';
      videoRefs.current[0].play().catch(() => {
        // Ignore autoplay errors
      });
    }
    
    // Cleanup function
    return () => {
      // Pause all videos when component unmounts
      videoRefs.current.forEach(video => {
        if (video) {
          video.pause();
        }
      });
    };
  }, []);

  // Add function to optimize video loading
  const optimizeVideoLoading = (videoElement: HTMLVideoElement | null, index: number) => {
    if (videoElement) {
      // Set loading attributes for better performance
      videoElement.preload = index === currentSlide ? 'auto' : 'metadata';
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.controls = false; // Remove controls for better UX
      
      // Adaptive quality based on connection speed
      const connectionSpeed = getConnectionSpeed();
      if (connectionSpeed === 'slow') {
        videoElement.setAttribute('data-connection-speed', 'slow');
      }
      
      // Add event listeners for better performance tracking
      videoElement.addEventListener('loadstart', () => {
        // Sanitize index before logging
        const sanitizedIndex = String(index).replace(/[\r\n\t]/g, '');
        console.log(`Video ${sanitizedIndex} load started`);
      });
      
      videoElement.addEventListener('loadeddata', () => {
        // Sanitize index before logging
        const sanitizedIndex = String(index).replace(/[\r\n\t]/g, '');
        console.log(`Video ${sanitizedIndex} loaded data`);
      });
      
      // Add error handling
      videoElement.addEventListener('error', (e) => {
        // Sanitize error message before logging
        const sanitizedIndex = String(index).replace(/[\r\n\t]/g, '');
        const sanitizedError = String(e.type).replace(/[\r\n\t]/g, '');
        console.error(`Video ${sanitizedIndex} loading error: ${sanitizedError}`);
        // Try to reload the video
        setTimeout(() => {
          if (videoElement) {
            videoElement.load();
          }
        }, 5000);
      });
    }
  };

  const scrollToContact = async () => {
    trackEvent('cta_primary_click', {
      event_label: 'hero_cta_main',
      slide_content: currentSlideData?.title || '',
      slide_index: currentSlide,
      ab_test_variant: heroCtaVariant
    });
    
    // Record conversion for A/B test
    await recordConversion();
    
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDemoClick = () => {
    trackEvent('cta_secondary_click', {
      event_label: 'hero_demo_button',
      slide_content: currentSlideData?.title || '',
      slide_index: currentSlide
    });
  };

  const handleWhatsAppClick = () => {
    trackEvent('cta_whatsapp_click', {
      event_label: 'hero_whatsapp_direct',
      slide_content: currentSlideData?.title || '',
      phone_number: '+212701193811'
    });
    
    const message = "Salut ! Je souhaite en savoir plus sur vos solutions d'automatisation IA pour mon business au Sénégal ou au Maroc.";
    const whatsappUrl = generateWhatsAppLink(message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section ref={heroRef as any} id="hero" className="relative min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16 md:pt-20">
      {/* Background Pattern with parallax */}
      <motion.div style={{ y }} className="absolute inset-0 opacity-5 will-change-transform">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.orange.500),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,theme(colors.orange.400),transparent_50%)]"></div>
      </motion.div>
      {/* Breathing halos (respect reduced motion) */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-orange-300/10 blur-3xl -top-24 -left-24"
          animate={reducedMotion ? { opacity: 0.06 } : { scale: [1, 1.08, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={reducedMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full bg-orange-400/10 blur-3xl bottom-0 right-0"
          animate={reducedMotion ? { opacity: 0.06 } : { scale: [1, 1.06, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={reducedMotion ? undefined : { duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
          {/* Content */}
          <motion.div 
            className="space-y-8 lg:pr-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge with scroll-linked rotation */}
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.span style={{ rotate }} className="mr-2 inline-flex">
                <Star className="w-4 h-4" />
              </motion.span>
              {t('hero.badge')}
            </motion.div>

            {/* Main Content - Optimisé Mobile */}
            <div className="space-y-4 md:space-y-6">
              <motion.h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                {currentSlideData?.title || ''}
              </motion.h1>
              
              <motion.p 
                className="text-lg sm:text-xl md:text-2xl text-orange-600 font-semibold"
                key={`subtitle-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {currentSlideData?.subtitle || ''}
              </motion.p>
              
              <motion.p 
                className="text-base sm:text-lg text-gray-800 leading-relaxed max-w-2xl"
                key={`description-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {currentSlideData?.description || ''}
              </motion.p>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-4"
                key={`stats-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {currentSlideData?.stats?.map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-white/50 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="text-2xl font-bold text-orange-600">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                )) || []}
              </motion.div>

              {/* CTA Buttons - Optimisé Mobile (min 44px tactile) */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4"
                key={`buttons-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <button
                  onClick={() => {
                    scrollToContact();
                    trackConversion('cta_click');
                  }}
                  className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-6 sm:px-8 py-4 min-h-[48px] rounded-xl font-semibold transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center space-x-2 touch-manipulation"
                >
                  <span className="text-base sm:text-lg">{ctaVariant === 'A' ? (currentSlideData?.cta || '') : t('hero.cta_alternative')}</span>
                  <ArrowRight className="w-5 h-5 flex-shrink-0" />
                </button>
                <button
                  onClick={handleDemoClick}
                  className="w-full sm:flex-1 bg-white/90 hover:bg-white active:bg-gray-50 text-gray-800 px-6 sm:px-8 py-4 min-h-[48px] rounded-xl font-semibold transition-all duration-300 hover:shadow-lg active:scale-95 border-2 border-gray-200 flex items-center justify-center space-x-2 touch-manipulation"
                >
                  <Play className="w-5 h-5 flex-shrink-0" />
                  <span className="text-base sm:text-lg">{t('hero.demo')}</span>
                </button>
              </motion.div>
            </div>
          </motion.div>

          {/* Video Carousel */}
          <motion.div 
            className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                    optimizeVideoLoading(el, index);
                  }}
                  src={slide.video}
                  muted
                  playsInline
                  loop
                  className="w-full h-full object-cover"
                  onLoadedData={() => {
                    // Ensure the current video plays when loaded
                    if (index === currentSlide && videoRefs.current[index]) {
                      // Add small delay to ensure smooth transition
                      setTimeout(() => {
                        videoRefs.current[index]?.play().catch(() => {
                          // Ignore autoplay errors
                        });
                      }, 100);
                    }
                  }}
                  onError={(e) => {
                    // Sanitize error data before logging
                    const sanitizedIndex = String(index).replace(/[\r\n\t]/g, '');
                    const sanitizedError = String(e.type).replace(/[\r\n\t]/g, '');
                    console.error(`Video ${sanitizedIndex} error: ${sanitizedError}`);
                    // Try to reload the video after a delay
                    setTimeout(() => {
                      if (videoRefs.current[index]) {
                        videoRefs.current[index]?.load();
                        if (index === currentSlide) {
                          videoRefs.current[index]?.play().catch(() => {
                            // Ignore autoplay errors
                          });
                        }
                      }
                    }, 3000);
                  }}
                />
                {/* Video Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            ))}

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 z-20"
              aria-label="Previous slide"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-300 z-20"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Key Offers Section - Recréé complètement */}
      <div className="pb-16 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('hero.key_offers.title')}</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {keyOffers.map((offer, index) => {
                const IconComponent = offer.icon;
                return (
                  <motion.div 
                    key={index} 
                    className="flex flex-col items-center text-center space-y-4 bg-white rounded-xl p-6 border border-gray-100 hover:shadow-xl transition-shadow"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">{offer.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{offer.description}</p>
                    <motion.button 
                      type="button"
                      aria-label={offer.cta}
                      onClick={() => {
                        console.log('Button clicked:', offer.title);
                        const element = document.getElementById(offer.targetSection);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                          setTimeout(() => {
                            const firstInput = element.querySelector('input[name="name"]') as HTMLInputElement;
                            if (firstInput) {
                              firstInput.focus();
                            }
                          }, 800);
                        }
                        trackEvent('key_offer_cta_click', {
                          event_label: 'hero_key_offers',
                          offer_title: offer.title,
                          offer_cta: offer.cta,
                          offer_index: index,
                          target_section: offer.targetSection
                        });
                      }}
                      className="group inline-flex items-center justify-center p-3 sm:p-4 md:p-5 rounded-full text-orange-600 hover:bg-orange-50 transition-colors"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowRight className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-orange-600 group-hover:translate-x-1.5 transition-transform duration-300" strokeWidth={2.4} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronRight className="w-6 h-6 text-gray-400 rotate-90" />
      </div>
    </section>
  );
}

export function HeroVideoSlider() {
  const [currentVideo, setCurrentVideo] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Video files for the slider
  const videos = [
    { src: "/videos/hero1.webm", title: "Automatisation WhatsApp" },
    { src: "/videos/hero2.webm", title: "Intelligence Artificielle" },
    { src: "/videos/hero3.webm", title: "Sites Web Ultra-Rapides" },
    { src: "/videos/hero4.webm", title: "Transformation Digitale" },
    { src: "/videos/hero5.webm", title: "Innovation IA Made in Afrique" },
    { src: "/videos/hero6.webm", title: "Solutions Complètes" }
  ];

  // Clear existing interval and set up new one when videos length changes
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set up new interval
    intervalRef.current = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, 4000); // Change video every 4 seconds

    // Cleanup function to clear interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videos.length]); // Only depend on videos.length

  // Play first video on mount
  useEffect(() => {
    if (videoRefs.current[0]) {
      videoRefs.current[0].play().catch(() => {
        // Ignore autoplay errors
      });
    }
    
    // Cleanup function
    return () => {
      // Pause all videos when component unmounts
      videoRefs.current.forEach(video => {
        if (video) {
          video.pause();
        }
      });
    };
  }, []);

  // Add function to safely get video title
  const getCurrentVideoTitle = () => {
    if (videos && videos[currentVideo]) {
      return videos[currentVideo].title;
    }
    return '';
  };

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-2xl shadow-xl">
      {/* Video elements */}
      {videos.map((video, index) => (
        <video
          key={index}
          ref={el => { if (el) videoRefs.current[index] = el; }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentVideo ? 'opacity-100' : 'opacity-0'
          }`}
          muted
          loop
          playsInline
          // Improved preloading strategy for better performance
          preload={index === currentVideo ? "auto" : index === (currentVideo + 1) % videos.length ? "metadata" : "none"}
        >
          <source src={video.src} type="video/webm" />
          {/* Fallback content */}
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
            <div className="text-center text-orange-600">
              <div className="text-4xl mb-2">🎬</div>
              <div className="text-lg font-semibold">{video.title}</div>
            </div>
          </div>
        </video>
      ))}
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      
      {/* Video title */}
      <div className="absolute bottom-4 left-4 right-4">
        <motion.div 
          key={currentVideo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white font-semibold text-lg"
        >
          {getCurrentVideoTitle()}
        </motion.div>
      </div>
      
      {/* Video indicators */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentVideo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentVideo 
                ? 'bg-white w-6' 
                : 'bg-white/50'
            }`}
            aria-label={`Vidéo ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}