// Section des offres mise en avant
import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { trackEvent, generateWhatsAppLink } from '../utils/supabase/info';
import { useTranslation } from 'react-i18next';

interface Offer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  valueProposition: string;
  features: string[];
  highlights: string[];
  icon: React.ComponentType<any>;
  gradient: string;
  popular?: boolean;
  cta: string;
  deliveryTime: string;
  guarantee: string;
}

const offers: Offer[] = [
  {
    id: 'whatsapp-automation',
    title: 'Automatisation WhatsApp',
    subtitle: 'Solution IA Complète',
    description: 'Transformez votre WhatsApp en machine à vendre 24h/24 avec notre IA conversationnelle avancée.',
    valueProposition: 'ROI garanti 300% en 30 jours',
    features: [
      'Chatbot IA multilingue (FR/EN)',
      'Réponses automatiques intelligentes',
      'Gestion des commandes automatisée',
      'Intégration catalogue produits',
      'Analytics et rapports détaillés',
      'Formation équipe incluse'
    ],
    highlights: ['+300% de conversions', 'ROI en 30 jours', '24h/24 disponible'],
    icon: MessageCircle,
    gradient: 'from-green-500 to-emerald-600',
    popular: true,
    cta: 'Automatiser WhatsApp',
    deliveryTime: '7 jours',
    guarantee: 'Satisfait ou remboursé 30 jours'
  },
  {
    id: 'website-ultra-fast',
    title: 'Site Web Ultra-Rapide',
    subtitle: 'Performance & SEO',
    description: 'Site web professionnel optimisé pour la conversion avec temps de chargement < 1 seconde.',
    valueProposition: 'Multipliez votre trafic par 3',
    features: [
      'Design responsive moderne',
      'Optimisation SEO avancée',
      'Temps de chargement < 1s',
      'Hébergement 1 an inclus',
      'SSL et sécurité renforcée',
      'Maintenance 6 mois offerte'
    ],
    highlights: ['+250% de trafic', 'Top 3 Google', 'Mobile-first'],
    icon: Globe,
    gradient: 'from-blue-500 to-cyan-600',
    cta: 'Créer Mon Site',
    deliveryTime: '5 jours',
    guarantee: 'Performance garantie'
  },
  {
    id: 'ai-assistant',
    title: 'Assistant IA Personnalisé',
    subtitle: 'Intelligence Artificielle',
    description: 'Assistant IA sur mesure pour automatiser vos processus métier et améliorer la productivité.',
    valueProposition: 'Économisez 50h/mois de travail',
    features: [
      'IA entraînée sur vos données',
      'Intégration multi-plateformes',
      'Automatisation des tâches',
      'Analyse prédictive',
      'API personnalisée',
      'Support technique dédié'
    ],
    highlights: ['+400% productivité', 'Économie 50h/mois', 'ROI 200%'],
    icon: Bot,
    gradient: 'from-purple-500 to-pink-600',
    cta: 'Créer Mon IA',
    deliveryTime: '14 jours',
    guarantee: 'Performance mesurable'
  }
];

export function OffersSection() {
  const { t } = useTranslation();
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null);

  const handleOfferClick = (offer: Offer) => {
    trackEvent('offer_interest', {
      offer_id: offer.id,
      offer_title: offer.title,
      value_proposition: offer.valueProposition
    });

    // Scroll to the contact form instead of opening WhatsApp
    const contactFormElement = document.getElementById('contact-form');
    if (contactFormElement) {
      contactFormElement.scrollIntoView({ behavior: 'smooth' });
      // Focus on the first input field
      const firstInput = contactFormElement.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  };

  const handleLearnMore = (offerId: string) => {
    setSelectedOffer(selectedOffer === offerId ? null : offerId);
    trackEvent('offer_learn_more', { offer_id: offerId });
  };

  return (
    <section id="offres" className="py-20 bg-gradient-to-br from-orange-50 via-white to-orange-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4 mr-2" />
            {t('offers.special_badge')}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('offers.title').split(' ').slice(0, 1).join(' ')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">{t('offers.title').split(' ').slice(1).join(' ')}</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {t('offers.subtitle')}
          </p>

          {/* Stats rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: '150+', label: 'Clients Satisfaits' },
              { number: '+200%', label: 'ROI Moyen' },
              { number: '98%', label: 'Taux de Satisfaction' },
              { number: '24h/24', label: 'Support Disponible' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-orange-600">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Grille des offres */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {offers.map((offer, index) => {
            const IconComponent = offer.icon;
            const isExpanded = selectedOffer === offer.id;
            
            return (
              <div
                key={offer.id}
                className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                  offer.popular ? 'ring-2 ring-orange-500 scale-105' : ''
                } ${isExpanded ? 'lg:col-span-3' : ''}`}
              >
                {/* Badge populaire */}
                {offer.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      PLUS POPULAIRE
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header de l'offre */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${offer.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                    <p className="text-orange-600 font-semibold">{offer.subtitle}</p>
                    <p className="text-gray-600 mt-2">{offer.description}</p>
                  </div>

                  {/* Proposition de valeur */}
                  <div className="text-center mb-6">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                      <div className="text-lg font-bold text-green-800 mb-1">🎯 Résultat Garanti</div>
                      <div className="text-xl font-bold text-green-900">{offer.valueProposition}</div>
                      <div className="text-sm text-green-700 mt-2">
                        <span className="bg-green-100 px-3 py-1 rounded-full font-semibold">
                          Devis personnalisé gratuit
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {offer.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  {/* Features principales */}
                  <div className="space-y-3 mb-6">
                    {offer.features.slice(0, isExpanded ? offer.features.length : 4).map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    
                    {!isExpanded && offer.features.length > 4 && (
                      <button
                        onClick={() => handleLearnMore(offer.id)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-semibold flex items-center"
                      >
                        Voir {offer.features.length - 4} fonctionnalités de plus
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    )}
                  </div>

                  {/* Garanties */}
                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm text-gray-600">Livraison: {offer.deliveryTime}</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-gray-600">{offer.guarantee}</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleOfferClick(offer)}
                    className={`w-full bg-gradient-to-r ${offer.gradient} text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center`}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {offer.cta}
                  </button>

                  {/* Bouton en savoir plus */}
                  {!isExpanded && (
                    <button
                      onClick={() => handleLearnMore(offer.id)}
                      className="w-full mt-3 text-gray-600 hover:text-gray-800 py-2 text-sm font-medium transition-colors"
                    >
                      En savoir plus
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section garanties */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Nos Garanties</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Satisfaction Garantie',
                description: 'Satisfait ou remboursé sous 30 jours'
              },
              {
                icon: Clock,
                title: 'Livraison Rapide',
                description: 'Projets livrés dans les délais convenus'
              },
              {
                icon: TrendingUp,
                title: 'ROI Garanti',
                description: 'Retour sur investissement mesurable'
              }
            ].map((guarantee, index) => {
              const IconComponent = guarantee.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{guarantee.title}</h4>
                  <p className="text-gray-600 text-sm">{guarantee.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}