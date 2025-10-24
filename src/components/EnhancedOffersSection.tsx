import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Globe, 
  Bot, 
  TrendingUp, 
  CheckCircle, 
  Star,
  ArrowRight,
  Zap,
  Shield,
  Clock,
  Users,
  Award,
  Sparkles,
  Target,
  Rocket
} from 'lucide-react';
import { trackEvent, generateWhatsAppLink } from '../utils/supabase/info';
import { useTranslation } from 'next-i18next';
import { useLanguage } from '../contexts/LanguageContext';

export function EnhancedOffersSection() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('starter');
  const [hoveredOffer, setHoveredOffer] = useState<string | null>(null);

  // Offres structurées avec approche marketing
  const offers = {
    starter: {
      id: 'starter',
      name: t('offers.starter.name'),
      tagline: t('offers.starter.tagline'),
      valueProposition: t('offers.starter.value_proposition'),
      popular: false,
      description: t('offers.starter.description'),
      features: [
        t('offers.starter.feature1'),
        t('offers.starter.feature2'),
        t('offers.starter.feature3'),
        t('offers.starter.feature4'),
        t('offers.starter.feature5'),
        t('offers.starter.feature6')
      ],
      benefits: [
        t('offers.starter.benefit1'),
        t('offers.starter.benefit2'),
        t('offers.starter.benefit3')
      ],
      icon: Rocket,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    professional: {
      id: 'professional',
      name: t('offers.professional.name'),
      tagline: t('offers.professional.tagline'),
      valueProposition: t('offers.professional.value_proposition'),
      popular: true,
      description: t('offers.professional.description'),
      features: [
        t('offers.professional.feature1'),
        t('offers.professional.feature2'),
        t('offers.professional.feature3'),
        t('offers.professional.feature4'),
        t('offers.professional.feature5'),
        t('offers.professional.feature6'),
        t('offers.professional.feature7'),
        t('offers.professional.feature8')
      ],
      benefits: [
        t('offers.professional.benefit1'),
        t('offers.professional.benefit2'),
        t('offers.professional.benefit3')
      ],
      icon: Target,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    },
    enterprise: {
      id: 'enterprise',
      name: t('offers.enterprise.name'),
      tagline: t('offers.enterprise.tagline'),
      valueProposition: t('offers.enterprise.value_proposition'),
      popular: false,
      description: t('offers.enterprise.description'),
      features: [
        t('offers.enterprise.feature1'),
        t('offers.enterprise.feature2'),
        t('offers.enterprise.feature3'),
        t('offers.enterprise.feature4'),
        t('offers.enterprise.feature5'),
        t('offers.enterprise.feature6'),
        t('offers.enterprise.feature7'),
        t('offers.enterprise.feature8')
      ],
      benefits: [
        t('offers.enterprise.benefit1'),
        t('offers.enterprise.benefit2'),
        t('offers.enterprise.benefit3')
      ],
      icon: Award,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    }
  };

  const tabs = [
    { id: 'starter', label: t('offers.tab.starter'), icon: Rocket },
    { id: 'professional', label: t('offers.tab.professional'), icon: Target },
    { id: 'enterprise', label: t('offers.tab.enterprise'), icon: Award }
  ];

  const handleOfferClick = (offerId: string) => {
    const offer = offers[offerId as keyof typeof offers];
    trackEvent({
      event_name: 'offer_selected',
      offer_id: offerId,
      offer_name: offer.name,
      price: offer.price
    });

    const message = t('offers.whatsapp_message', { offerName: offer.name });
    window.open(generateWhatsAppLink(message), '_blank');
  };

  const currentOffer = offers[activeTab as keyof typeof offers];

  return (
    <section id="offers" className="py-20 bg-gradient-to-br from-gray-50 via-white to-orange-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,theme(colors.orange.100),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,theme(colors.blue.100),transparent_70%)]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('offers.special_badge')}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('offers.title')}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('offers.subtitle')}
          </p>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div 
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative px-6 py-3 rounded-xl font-medium transition-all duration-300
                      ${isActive 
                        ? 'text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute inset-0 bg-gradient-to-r ${offers[tab.id as keyof typeof offers].gradient} rounded-xl`}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <div className="relative flex items-center space-x-2">
                      <IconComponent className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Offer Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div 
              className={`
                relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2
                ${currentOffer.popular ? 'border-orange-200' : 'border-gray-200'}
              `}
              onMouseEnter={() => setHoveredOffer(currentOffer.id)}
              onMouseLeave={() => setHoveredOffer(null)}
            >
              {/* Popular Badge */}
              {currentOffer.popular && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                    <Star className="w-4 h-4 inline mr-1" />
                    {t('offers.popular_badge')}
                  </div>
                </div>
              )}

              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  {/* Left Column - Info */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${currentOffer.gradient} rounded-2xl flex items-center justify-center mr-4`}>
                        <currentOffer.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{currentOffer.name}</h3>
                        <p className="text-gray-600">{currentOffer.tagline}</p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                      {currentOffer.description}
                    </p>

                    {/* Benefits */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                        {t('offers.results_guaranteed')}
                      </h4>
                      <div className="space-y-3">
                        {currentOffer.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-8">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
                        <div className="text-lg font-bold text-green-800 mb-2">🎯 {t('offers.guaranteed_result')}</div>
                        <div className="text-2xl font-bold text-green-900 mb-3">{currentOffer.valueProposition}</div>
                        <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                          💬 {t('offers.personalized_analysis')}
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => handleOfferClick(currentOffer.id)}
                      className={`
                        w-full bg-gradient-to-r ${currentOffer.gradient} text-white font-bold py-4 px-8 rounded-2xl
                        shadow-lg hover:shadow-xl transition-all duration-300
                        flex items-center justify-center space-x-2
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{t('offers.start_now')}</span>
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Right Column - Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-6 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-blue-500" />
                      {t('offers.everything_included')}
                    </h4>
                    <div className="space-y-4">
                      {currentOffer.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Trust Indicators */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">98%</div>
                          <div className="text-sm text-gray-600">{t('offers.satisfaction')}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">200+</div>
                          <div className="text-sm text-gray-600">{t('offers.pme_helped')}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-orange-600">24/7</div>
                          <div className="text-sm text-gray-600">Support</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-6">
            {t('offers.not_sure')}
          </p>
          <button
            onClick={() => {
              trackEvent({ event_name: 'consultation_request' });
              window.open(generateWhatsAppLink(t('offers.consultation_message')), '_blank');
            }}
            className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-orange-200"
          >
            <Users className="w-5 h-5 mr-2" />
            {t('offers.discovery_call')}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}