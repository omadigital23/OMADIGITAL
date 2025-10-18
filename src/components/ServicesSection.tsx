import React, { useRef } from 'react';
import { MessageSquare, Globe, Palette, BarChart3, Bot, Shield, Zap, Smartphone } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from 'next-i18next';

export function ServicesSection() {
  const { t } = useTranslation('common');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const services = [
    {
      icon: MessageSquare,
      title: t('services.whatsapp.title'),
      description: t('services.whatsapp.description'),
      features: [t('services.whatsapp.feature1'), t('services.whatsapp.feature2'), t('services.whatsapp.feature3')],
      color: "bg-green-500",
      lightColor: "bg-green-50",
      popular: true,
      ctaText: "Automatiser WhatsApp"
    },
    {
      icon: Globe,
      title: t('services.website.title'),
      description: t('services.website.description'),
      features: [t('services.website.feature1'), t('services.website.feature2'), t('services.website.feature3')],
      color: "bg-blue-500",
      lightColor: "bg-blue-50",
      ctaText: "Créer mon site"
    },
    {
      icon: Palette,
      title: t('services.branding.title'),
      description: t('services.branding.description'),
      features: [t('services.branding.feature1'), t('services.branding.feature2'), t('services.branding.feature3')],
      color: "bg-purple-500",
      lightColor: "bg-purple-50",
      ctaText: "Créer mon identité"
    },
    {
      icon: BarChart3,
      title: t('services.analytics.title'),
      description: t('services.analytics.description'),
      features: [t('services.analytics.feature1'), t('services.analytics.feature2'), t('services.analytics.feature3')],
      color: "bg-orange-500",
      lightColor: "bg-orange-50",
      ctaText: "Voir les dashboards"
    },
    {
      icon: Bot,
      title: t('services.ai_assistant.title'),
      description: t('services.ai_assistant.description'),
      features: [t('services.ai_assistant.feature1'), t('services.ai_assistant.feature2'), t('services.ai_assistant.feature3')],
      color: "bg-indigo-500",
      lightColor: "bg-indigo-50",
      ctaText: "Découvrir l'IA"
    },
    {
      icon: Shield,
      title: t('services.security.title'),
      description: t('services.security.description'),
      features: [t('services.security.feature1'), t('services.security.feature2'), t('services.security.feature3')],
      color: "bg-red-500",
      lightColor: "bg-red-50",
      ctaText: "Sécuriser mes données"
    },
    {
      icon: Zap,
      title: t('services.automation.title'),
      description: t('services.automation.description'),
      features: [t('services.automation.feature1'), t('services.automation.feature2'), t('services.automation.feature3')],
      color: "bg-yellow-500",
      lightColor: "bg-yellow-50",
      ctaText: "Automatiser mon business"
    },
    {
      icon: Smartphone,
      title: t('services.mobile_apps.title'),
      description: t('services.mobile_apps.description'),
      features: [t('services.mobile_apps.feature1'), t('services.mobile_apps.feature2'), t('services.mobile_apps.feature3')],
      color: "bg-teal-500",
      lightColor: "bg-teal-50",
      ctaText: "Créer mon app"
    }
  ];

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('services.title')}
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t('services.description')}
          </motion.p>
        </motion.div>

        {/* Services Grid - Improved for better visibility */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            
            return (
              <motion.div 
                key={index} 
                className="relative group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.6 + index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -8,
                  transition: { type: "spring", stiffness: 300 }
                }}
              >
                {/* Popular Badge */}
                {service.popular && (
                  <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    {t('services.popular_badge')}
                  </div>
                )}

                {/* Icon */}
                <motion.div 
                  className={`inline-flex items-center justify-center w-14 h-14 ${service.lightColor} rounded-xl mb-4 group-hover:scale-110 transition-transform flex-shrink-0`}
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.5 }}
                >
                  <IconComponent className="w-7 h-7 text-current" style={{ color: service.color.includes('green') ? '#16a34a' : service.color.includes('blue') ? '#2563eb' : service.color.includes('purple') ? '#9333ea' : service.color.includes('orange') ? '#ea580c' : service.color.includes('indigo') ? '#4f46e5' : service.color.includes('red') ? '#dc2626' : service.color.includes('yellow') ? '#ca8a04' : '#0d9488' }} />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed flex-grow">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.button 
                  onClick={scrollToContact}
                  className="w-full text-center text-orange-600 hover:text-orange-700 font-medium text-sm border border-orange-200 hover:border-orange-300 py-2 rounded-lg transition-colors mt-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {service.ctaText}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Clear Value Proposition Section */}
        <motion.div 
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">{t('services.why_choose')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <span>{t('services.why_choose_benefits.roi')}</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <span>{t('services.why_choose_benefits.team')}</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <span>{t('services.why_choose_benefits.custom')}</span>
                </li>
                <li className="flex items-start">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <span>{t('services.why_choose_benefits.support')}</span>
                </li>
              </ul>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{t('services.satisfaction_rate')}</div>
              <div className="text-xl mb-4">{t('services.satisfied_clients')}</div>
              <button 
                onClick={scrollToContact}
                className="bg-white text-orange-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t('services.get_started')}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center bg-gray-50 rounded-2xl p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <motion.h3 
            className="text-2xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
          >
            {t('services.custom_solution')}
          </motion.h3>
          <motion.p 
            className="text-gray-600 mb-6 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
          >
            {t('services.custom_description')}
          </motion.p>
          <motion.button 
            onClick={scrollToContact}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, delay: 2.0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('services.free_consultation')}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}