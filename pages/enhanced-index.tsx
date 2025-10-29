// Page d'accueil améliorée avec structure optimisée
import Head from 'next/head';
import { EnhancedHeader } from '../src/components/EnhancedHeader';
import { HeroSection } from '../src/components/HeroSection';
import { OffersSection } from '../src/components/OffersSection';
import { ServicesSection } from '../src/components/ServicesSection';
import { ProcessTimeline } from '../src/components/ProcessTimeline';
import { CTASection } from '../src/components/CTASection';
import { Footer } from '../src/components/Footer';
import dynamic from 'next/dynamic';

import { CheckCircle, TrendingUp, Users, Award, Zap, Shield, Clock } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

// Dynamically import SmartChatbotNext with SSR disabled
const SmartChatbotNext = dynamic(
  () => import('../src/components/SmartChatbotNext').then(mod => mod.SmartChatbotNext),
  { ssr: false }
);

export default function EnhancedHome() {
  const { t } = useTranslation();
  
  const keyBenefits = [
    {
      icon: TrendingUp,
      titleKey: 'benefits.roi.title',
      descriptionKey: 'benefits.roi.description',
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: Zap,
      titleKey: 'benefits.delivery.title',
      descriptionKey: 'benefits.delivery.description',
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: Shield,
      titleKey: 'benefits.guarantee.title',
      descriptionKey: 'benefits.guarantee.description',
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Users,
      titleKey: 'benefits.clients.title',
      descriptionKey: 'benefits.clients.description',
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const socialProof = [
    {
      metric: "98%",
      labelKey: 'benefits.metrics.satisfied_clients',
      descriptionKey: 'benefits.metrics.satisfaction_rate'
    },
    {
      metric: "+300%",
      labelKey: 'benefits.metrics.whatsapp_conversions',
      descriptionKey: 'benefits.metrics.sales_improvement'
    },
    {
      metric: "24h/24",
      labelKey: 'benefits.metrics.automation',
      descriptionKey: 'benefits.metrics.systems_work'
    },
    {
      metric: "< 1s",
      labelKey: 'benefits.metrics.loading_time',
      descriptionKey: 'benefits.metrics.ultra_fast_sites'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>OMA Digital - Solutions d'Automatisation IA pour PME | WhatsApp, Sites Web, IA</title>
        <meta 
          name="description" 
          content="Transformez votre PME avec nos solutions d'automatisation WhatsApp, sites web ultra-rapides et IA personnalisée. ROI garanti +200% en 6 mois. Spécialistes Sénégal & Maroc." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta 
          name="keywords" 
          content="automatisation WhatsApp Sénégal, IA PME Maroc, chatbot WhatsApp, site web rapide, transformation digitale Afrique, automatisation business" 
        />
        <meta name="author" content="OMA Digital" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://omadigital.com/" />
        <meta property="og:title" content="OMA Digital - Solutions d'Automatisation IA pour PME" />
        <meta property="og:description" content="Transformez votre PME avec nos solutions d'automatisation WhatsApp, sites web ultra-rapides et IA personnalisée. ROI garanti +200% en 6 mois." />
        <meta property="og:image" content="/images/og-homepage.svg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://omadigital.com/" />
        <meta property="twitter:title" content="OMA Digital - Solutions d'Automatisation IA pour PME" />
        <meta property="twitter:description" content="Transformez votre PME avec nos solutions d'automatisation WhatsApp, sites web ultra-rapides et IA personnalisée." />
        <meta property="twitter:image" content="/images/og-homepage.svg" />

        {/* Security headers */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "OMA Digital",
              "description": "Solutions d'automatisation et transformation digitale pour PME",
              "url": "https://omadigital.com",
              "logo": "https://omadigital.com/images/logo.webp",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+212701193811",
                "contactType": "customer service",
                "availableLanguage": ["French", "English"]
              },
              "areaServed": ["Senegal", "Morocco"],
              "serviceType": ["WhatsApp Automation", "Web Development", "AI Solutions"]
            })
          }}
        />
      </Head>

      <EnhancedHeader />
      
      {/* Main content area */}
      <main className="overflow-hidden">
        {/* Hero Section */}
        <section id="hero">
          <HeroSection />
        </section>
        
        {/* Benefits Section - Immédiatement après le hero */}
        <section className="py-16 bg-gradient-to-r from-gray-50 to-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('benefits.title').split(' ').slice(0, 2).join(' ')} <span className="text-orange-600">{t('benefits.title').split(' ').slice(2).join(' ')}</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('benefits.description')}
              </p>
            </div>

            {/* Key Benefits Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {keyBenefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div 
                    key={index} 
                    className="text-center group hover:transform hover:scale-105 transition-all duration-300"
                  >
                    <div className={`w-16 h-16 ${benefit.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow`}>
                      <IconComponent className={`w-8 h-8 ${benefit.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t(benefit.titleKey)}</h3>
                    <p className="text-gray-600">{t(benefit.descriptionKey)}</p>
                  </div>
                );
              })}
            </div>

            {/* Social Proof Metrics */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {socialProof.map((proof, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                      {proof.metric}
                    </div>
                    <div className="text-lg font-semibold text-gray-900 mb-1">
                      {t(proof.labelKey)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t(proof.descriptionKey)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Offers Section - Section principale mise en avant */}
        <OffersSection />
        
        {/* Services Section */}
        <section id="services">
          <ServicesSection />
        </section>
        
        {/* Process Section */}
        <section id="processus">
          <ProcessTimeline />
        </section>
        
        {/* Final CTA Section */}
        <section id="contact">
          <CTASection />
        </section>
      </main>
      
      <Footer />
      
      {/* Smart Chatbot */}
      <SmartChatbotNext />

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: radial-gradient(circle, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}

export async function getStaticProps({ locale }: { locale: string }) {
  const { serverSideTranslations } = await import('next-i18next/serverSideTranslations');
  
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}