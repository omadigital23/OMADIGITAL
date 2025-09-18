import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from './HeroSection';
import { EnhancedOffersSection } from './EnhancedOffersSection';
import { ServicesSection } from './ServicesSection';
import { CaseStudiesSection } from './CaseStudiesSection';
import { ProcessTimeline } from './ProcessTimeline';
import { TestimonialsSection } from './TestimonialsSection';
import { CTASection } from './CTASection';
import { EnhancedWelcomePopup } from './EnhancedWelcomePopup';
import { 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Award, 
  Shield, 
  Zap, 
  Clock,
  Target,
  Star,
  Globe
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

// Composant de section de confiance amélioré
function TrustSection() {
  const { t } = useTranslation();
  
  const trustMetrics = [
    {
      icon: CheckCircle,
      value: "200+",
      label: t('benefits.clients.title'),
      description: t('benefits.clients.description')
    },
    {
      icon: TrendingUp,
      value: "98%",
      label: t('hero.stats.satisfaction_rate'),
      description: t('benefits.guarantee.description')
    },
    {
      icon: Users,
      value: "24/7",
      label: t('benefits.delivery.title'),
      description: t('benefits.delivery.description')
    },
    {
      icon: Award,
      value: "3 mois",
      label: t('benefits.roi.title'),
      description: t('benefits.roi.description')
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
            <Shield className="w-4 h-4 mr-2" />
            {t('benefits.guarantee.title')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('benefits.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('benefits.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {trustMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow duration-300">
                    <IconComponent className="w-10 h-10 text-orange-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{metric.label}</h3>
                <p className="text-gray-600 text-sm">{metric.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Composant de section "Pourquoi Nous"
function WhyChooseUsSection() {
  const { t } = useTranslation();
  
  const advantages = [
    {
      icon: Zap,
      title: t('benefits.delivery.title'),
      description: t('benefits.delivery.description'),
      color: "yellow"
    },
    {
      icon: Shield,
      title: t('benefits.guarantee.title'),
      description: t('benefits.guarantee.description'),
      color: "blue"
    },
    {
      icon: Target,
      title: t('benefits.roi.title'),
      description: t('benefits.roi.description'),
      color: "green"
    },
    {
      icon: Globe,
      title: t('services.title'),
      description: t('services.description'),
      color: "orange"
    }
  ];

  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
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
            {t('benefits.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              OMA Digital
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('benefits.description')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantages.map((advantage, index) => {
            const IconComponent = advantage.icon;
            const colorClasses = {
              yellow: 'from-yellow-400 to-yellow-500',
              blue: 'from-blue-400 to-blue-500',
              green: 'from-green-400 to-green-500',
              orange: 'from-orange-400 to-orange-500'
            };
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${colorClasses[advantage.color as keyof typeof colorClasses]} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{advantage.title}</h3>
                <p className="text-gray-300 leading-relaxed">{advantage.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Structure de landing page améliorée
export function ImprovedLandingStructure() {
  const { t } = useTranslation();
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);
  const { forceUpdate } = useLanguage(); // Force re-render on language change

  useEffect(() => {
    // Afficher le popup après 3 secondes
    const timer = setTimeout(() => {
      setShowWelcomePopup(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="overflow-hidden">
      {/* 1. Hero Section - Accroche immédiate */}
      <section id="hero">
        <HeroSection />
      </section>
      
      {/* 2. Trust Section - Crédibilité immédiate */}
      <TrustSection />
      
      {/* 3. Services Section - Détails techniques */}
      <section id="services">
        <ServicesSection />
      </section>
      
      {/* 4. Offers Section - Offres claires et attractives */}
      <section id="offers">
        <EnhancedOffersSection />
      </section>
      
      {/* 5. Why Choose Us - Différenciation */}
      <WhyChooseUsSection />
      
      {/* 6. Case Studies - Preuves sociales */}
      <section id="case-studies">
        <CaseStudiesSection />
      </section>
      
      {/* 7. Process - Comment ça marche */}
      <section id="process">
        <ProcessTimeline />
      </section>
      
      {/* 8. Testimonials - Validation sociale */}
      <section id="testimonials">
        <TestimonialsSection />
      </section>
      
      {/* 9. Final CTA - Conversion */}
      <section id="contact">
        <CTASection />
      </section>

      {/* Popup amélioré avec compte à rebours 48h */}
      <EnhancedWelcomePopup 
        isOpen={showWelcomePopup} 
        onClose={() => setShowWelcomePopup(false)} 
      />
    </main>
  );
}