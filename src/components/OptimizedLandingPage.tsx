import React, { Suspense, lazy, memo } from 'react';
import Head from 'next/head';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

// Lazy load des composants pour améliorer les performances
const HeroSection = lazy(() => import('./HeroSection').then(m => ({ default: m.HeroSection })));
const EnhancedOffersSection = lazy(() => import('./EnhancedOffersSection').then(m => ({ default: m.EnhancedOffersSection })));
const ServicesSection = lazy(() => import('./ServicesSection').then(m => ({ default: m.ServicesSection })));
const CaseStudiesSection = lazy(() => import('./CaseStudiesSection').then(m => ({ default: m.CaseStudiesSection })));
const ProcessTimeline = lazy(() => import('./ProcessTimeline').then(m => ({ default: m.ProcessTimeline })));
const TestimonialsSection = lazy(() => import('./TestimonialsSection').then(m => ({ default: m.TestimonialsSection })));
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
    { value: "200+", label: t('benefits.clients.title'), icon: "🏢" },
    { value: "98%", label: t('hero.stats.satisfaction_rate'), icon: "⭐" },
    { value: "24/7", label: 'Support dédié', icon: "🛟" },
    { value: "3 mois", label: 'ROI garanti', icon: "📈" }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 via-white to-blue-50" aria-label="Métriques de confiance">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('benefits.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('benefits.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow duration-300">
                <span className="text-3xl">{metric.icon}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
              <h3 className="text-lg font-semibold text-gray-900">{metric.label}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
});

// Section avantages concurrentiels
const CompetitiveAdvantages = memo(() => {
  const advantages = [
    {
      title: "Déploiement Rapide",
      description: "Solution opérationnelle en 48h maximum",
      icon: "⚡",
      color: "yellow"
    },
    {
      title: "Sécurité Garantie", 
      description: "Données protégées, conformité RGPD assurée",
      icon: "🛡️",
      color: "blue"
    },
    {
      title: "ROI Mesurable",
      description: "Tableaux de bord temps réel pour suivre vos gains",
      icon: "🎯",
      color: "green"
    },
    {
      title: "Expertise Locale",
      description: "Équipe basée au Sénégal et Maroc",
      icon: "🌍",
      color: "orange"
    }
  ];

  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden" aria-label="Nos avantages">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.orange.500),transparent_50%)] opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            🚀 Garantie{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              +200% de CA
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            <strong>Ou on vous rembourse 200%</strong> - Rejoignez les PME qui explosent leurs ventes grâce à l'IA
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">{advantage.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{advantage.title}</h3>
              <p className="text-gray-300 leading-relaxed">{advantage.description}</p>
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
                "telephone": "+221701193811",
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

        {/* Case Studies */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <section id="case-studies" aria-label="Études de cas">
              <CaseStudiesSection />
            </section>
          </Suspense>
        </ErrorBoundary>

        {/* Process Timeline */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <section id="process" aria-label="Notre processus">
              <ProcessTimeline />
            </section>
          </Suspense>
        </ErrorBoundary>

        {/* Testimonials */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <section id="testimonials" aria-label="Témoignages clients">
              <TestimonialsSection />
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