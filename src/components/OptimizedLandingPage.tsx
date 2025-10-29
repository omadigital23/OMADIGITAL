import React, { Suspense, lazy, memo } from 'react';
import Head from 'next/head';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

// Lazy load des composants pour améliorer les performances
const HeroSection = lazy(() => import('./HeroSection').then(m => ({ default: m.HeroSection })));
const EnhancedOffersSection = lazy(() => import('./EnhancedOffersSection').then(m => ({ default: m.EnhancedOffersSection })));
const ServicesSection = lazy(() => import('./ServicesSection').then(m => ({ default: m.ServicesSection })));
const ProcessTimeline = lazy(() => import('./ProcessTimeline').then(m => ({ default: m.ProcessTimeline })));
const CTASection = lazy(() => import('./CTASection').then(m => ({ default: m.CTASection })));

// Composant de fallback pour le chargement
const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
  </div>
));

// Composant d'erreur
const ErrorFallback = memo(({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => (
  <div className="text-center py-20">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">Une erreur s'est produite</h2>
    <p className="text-gray-600 mb-4">Nous nous excusons pour ce désagrément.</p>
    <button 
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
    >
      Réessayer
    </button>
  </div>
));

// Section de confiance optimisée avec métriques sécurisées
const TrustMetrics = memo(() => {
  const { t } = useTranslation();
  const metrics = [
    { value: t('metrics.clients.value'), label: t('metrics.clients.label'), icon: "🏢" },
    { value: t('metrics.satisfaction.value'), label: t('metrics.satisfaction.label'), icon: "⭐" },
    { value: t('metrics.support.value'), label: t('metrics.support.label'), icon: "🛟" },
    { value: t('metrics.roi.value'), label: t('metrics.roi.label'), icon: "📈" }
  ];

  return (
    <section className="py-14 sm:py-16 bg-gradient-to-r from-orange-50 via-white to-blue-50" aria-label="Métriques de confiance">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {t('benefits.title')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {t('benefits.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group p-4"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-2xl sm:text-3xl">{metric.icon}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{metric.value}</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{metric.label}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Section avantages concurrentiels
const CompetitiveAdvantages = memo(() => {
  const { t } = useTranslation();
  const advantages = [
    {
      title: t('advantages.rapid_deployment.title'),
      description: t('advantages.rapid_deployment.description'),
      icon: "⚡",
      color: "yellow"
    },
    {
      title: t('advantages.security.title'),
      description: t('advantages.security.description'),
      icon: "🛡️",
      color: "blue"
    },
    {
      title: t('advantages.measurable_roi.title'),
      description: t('advantages.measurable_roi.description'),
      icon: "🎯",
      color: "green"
    },
    {
      title: t('advantages.local_expertise.title'),
      description: t('advantages.local_expertise.description'),
      icon: "🌍",
      color: "orange"
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gray-900 text-white relative overflow-hidden" aria-label="Nos avantages">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.orange.500),transparent_50%)] opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            🚀 Garantie{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              +200% de CA
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            <strong>Ou on vous rembourse 200%</strong> - Rejoignez les PME qui explosent leurs ventes grâce à l'IA
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group p-4"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl sm:text-2xl">{advantage.icon}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{advantage.title}</h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{advantage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Composant principal optimisé
export const OptimizedLandingPage = memo(() => {
  return (
    <>
      <Head>
        {/* Préchargement des ressources critiques */}
        <link rel="preload" href="/images/logo.webp" as="image" type="image/webp" />
        <link rel="preload" href="/videos/hero1.webm" as="video" type="video/webm" />
        
        {/* DNS prefetch pour les domaines externes */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        
        {/* Structured Data pour le SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "OMA Digital",
              "url": "https://oma-digital.sn",
              "logo": "https://oma-digital.sn/images/logo.webp",
              "description": "Solutions IA et automatisation pour PME au Sénégal et au Maroc",
              "address": [
                {
                  "@type": "PostalAddress",
                  "streetAddress": "Hersent Rue 15",
                  "addressLocality": "Thies",
                  "addressCountry": "SN"
                },
                {
                  "@type": "PostalAddress", 
                  "streetAddress": "Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt15",
                  "addressLocality": "Casablanca",
                  "addressCountry": "MA"
                }
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+212701193811",
                "contactType": "customer service"
              }
            })
          }}
        />
      </Head>

      <main className="overflow-hidden" role="main">
        {/* Hero Section - Chargement prioritaire */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <section id="hero" aria-label="Section d'accueil">
              <HeroSection />
            </section>
          </Suspense>
        </ErrorBoundary>

        {/* Trust Metrics - Chargement immédiat */}
        <TrustMetrics />

        {/* Services Section */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <section id="services" aria-label="Nos services">
              <ServicesSection />
            </section>
          </Suspense>
        </ErrorBoundary>

        {/* Offers Section */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <section id="offers" aria-label="Nos offres">
              <EnhancedOffersSection />
            </section>
          </Suspense>
        </ErrorBoundary>

        {/* Competitive Advantages */}
        <CompetitiveAdvantages />

        {/* Process Timeline */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <section id="process" aria-label="Notre processus">
              <ProcessTimeline />
            </section>
          </Suspense>
        </ErrorBoundary>

        {/* Final CTA */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <section id="contact" aria-label="Nous contacter">
              <CTASection />
            </section>
          </Suspense>
        </ErrorBoundary>
      </main>
    </>
  );
});

OptimizedLandingPage.displayName = 'OptimizedLandingPage';