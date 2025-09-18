/**
 * Popup d'accueil amélioré avec compte à rebours 48h
 */

import React, { useState, useEffect } from 'react';
import { X, Star, Zap, Users, Award, Clock, Gift, ArrowRight, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWhatsAppLink } from '../utils/supabase/info';

interface EnhancedWelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
}

export function EnhancedWelcomePopup({ isOpen, onClose }: EnhancedWelcomePopupProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [countdown, setCountdown] = useState<CountdownTime>({ hours: 48, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  const testimonials = [
    {
      name: "Amadou Diop",
      company: "Bakery Liberté",
      location: "Dakar",
      result: "+300% de CA en 6 mois",
      text: "OMA Digital a transformé notre boulangerie. Nos commandes WhatsApp sont maintenant automatisées et notre chiffre d'affaires a triplé !",
      stars: 5
    },
    {
      name: "Fatima El Mansouri", 
      company: "Boutique Moderne",
      location: "Casablanca",
      result: "2x plus de clients",
      text: "Grâce à leur chatbot IA, nous répondons instantanément à nos clients 24h/24. Notre taux de conversion a doublé !",
      stars: 5
    },
    {
      name: "Ibrahim Sall",
      company: "Tech Solutions",
      location: "Thiès", 
      result: "50h/mois économisées",
      text: "L'automatisation mise en place nous fait économiser 50 heures par mois. Nous pouvons enfin nous concentrer sur la croissance !",
      stars: 5
    },
    {
      name: "Aisha Traoré",
      company: "Restaurant Le Palmier",
      location: "Bamako",
      result: "+200% commandes",
      text: "Depuis l'automatisation WhatsApp, nous gérons 3x plus de commandes avec la même équipe. Révolutionnaire !",
      stars: 5
    }
  ];

  // Gestion du compte à rebours 48h
  useEffect(() => {
    if (!isOpen) return;

    // Vérifier s'il y a déjà un timestamp sauvegardé
    const savedEndTime = localStorage.getItem('oma_offer_end_time');
    let endTime: number;

    if (savedEndTime) {
      endTime = parseInt(savedEndTime);
    } else {
      // Créer nouveau timestamp pour 48h
      endTime = Date.now() + (48 * 60 * 60 * 1000);
      localStorage.setItem('oma_offer_end_time', endTime.toString());
    }

    const updateCountdown = () => {
      const now = Date.now();
      const timeLeft = Math.max(0, endTime - now);
      
      if (timeLeft === 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      setCountdown({ hours, minutes, seconds });
      
      // Devenir urgent quand il reste moins de 6h
      setIsUrgent(hours < 6);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Rotation des témoignages
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, testimonials.length]);

  const handleGetOffer = () => {
    const message = `🎁 Bonjour ! Je viens de voir votre offre spéciale limitée 48h et je suis très intéressé(e) par vos solutions d'automatisation WhatsApp. Pouvez-vous me faire un devis personnalisé avant la fin de l'offre ? Temps restant: ${countdown.hours}h${countdown.minutes}m`;
    window.open(generateWhatsAppLink(message), '_blank');
    
    // Marquer l'offre comme utilisée
    localStorage.setItem('oma_offer_claimed', 'true');
    onClose();
  };

  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge urgent */}
            {isUrgent && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-lg"
              >
                🔥 URGENT !
              </motion.div>
            )}

            {/* Header avec compte à rebours */}
            <div className={`${isUrgent ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-orange-500 to-red-500'} p-4 sm:p-6 text-white relative overflow-hidden`}>
              {/* Effet de brillance animé */}
              <motion.div
                animate={{ x: [-100, 400] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
              />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-all duration-200 z-20 bg-black/20 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm"
                aria-label="Fermer le popup"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center relative z-10">
                <motion.div
                  animate={{ rotate: isUrgent ? [0, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
                >
                  <img 
                    src="/images/logo.webp" 
                    alt="OMA Digital" 
                    className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                  />
                </motion.div>
                
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  🎁 Offre Spéciale Limitée !
                </h2>
                <p className="text-orange-100 mb-3 sm:mb-4 text-sm sm:text-base">
                  Automatisation WhatsApp + Audit Digital
                </p>

                {/* Compte à rebours */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Timer className={`w-5 h-5 mr-2 ${isUrgent ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-medium">
                      {isUrgent ? 'DERNIÈRES HEURES !' : 'Offre expire dans:'}
                    </span>
                  </div>
                  
                  <div className="flex justify-center space-x-2 text-center">
                    <div className="bg-white/30 rounded-lg p-2 min-w-[50px]">
                      <div className={`text-2xl font-bold ${isUrgent ? 'text-red-100' : ''}`}>
                        {formatTime(countdown.hours)}
                      </div>
                      <div className="text-xs opacity-80">heures</div>
                    </div>
                    <div className="text-2xl font-bold self-center">:</div>
                    <div className="bg-white/30 rounded-lg p-2 min-w-[50px]">
                      <div className={`text-2xl font-bold ${isUrgent ? 'text-red-100' : ''}`}>
                        {formatTime(countdown.minutes)}
                      </div>
                      <div className="text-xs opacity-80">min</div>
                    </div>
                    <div className="text-2xl font-bold self-center">:</div>
                    <div className="bg-white/30 rounded-lg p-2 min-w-[50px]">
                      <div className={`text-2xl font-bold ${isUrgent ? 'text-red-100 animate-pulse' : ''}`}>
                        {formatTime(countdown.seconds)}
                      </div>
                      <div className="text-xs opacity-80">sec</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu principal - Scrollable */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {/* Statistiques améliorées */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-2 sm:p-3"
                >
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-900">500+</div>
                  <div className="text-xs text-gray-600">PME</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3"
                >
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">+400%</div>
                  <div className="text-xs text-gray-600">ROI Moyen</div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3"
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">99%</div>
                  <div className="text-xs text-gray-600">Satisfaction</div>
                </motion.div>
              </div>

              {/* Témoignage dynamique */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 min-h-[120px] sm:min-h-[140px] relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex text-yellow-400">
                        {[...Array(testimonials[currentTestimonial].stars)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        {testimonials[currentTestimonial].result}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 text-sm mb-3 italic leading-relaxed">
                      "{testimonials[currentTestimonial].text}"
                    </p>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        {testimonials[currentTestimonial].name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {testimonials[currentTestimonial].name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {testimonials[currentTestimonial].company}, {testimonials[currentTestimonial].location}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Indicateurs de témoignage */}
                <div className="flex justify-center space-x-1 mt-3">
                  {testimonials.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentTestimonial ? 'bg-orange-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Offre marketing intelligente */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Gift className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="text-lg font-bold text-orange-800">
                      🚀 Pack Transformation Express
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-sm text-orange-700">
                    <div className="text-center">
                      <span className="text-xl font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                        🎁 PACK EXCLUSIF LIMITÉ
                      </span>
                    </div>
                    
                    <ul className="text-left space-y-1 sm:space-y-2 max-w-xs mx-auto text-xs sm:text-sm">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        <span className="font-semibold">Audit digital complet</span> - Découvrez votre potentiel caché
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        <span className="font-semibold">Stratégie personnalisée</span> - Plan d'action sur mesure
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        <span className="font-semibold">Installation chatbot WhatsApp</span> - Automatisation immédiate
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        <span className="font-semibold">Formation équipe complète</span> - Maîtrise garantie
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        <span className="font-semibold">Support VIP 30 jours</span> - Accompagnement premium
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-2 sm:space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetOffer}
                  className={`w-full ${isUrgent ? 'bg-gradient-to-r from-red-500 to-red-600 animate-pulse' : 'bg-gradient-to-r from-orange-500 to-red-500'} hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl text-sm sm:text-base`}
                >
                  <Gift className="w-5 h-5" />
                  <span>🚀 Découvrir Mon Potentiel Caché</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <div className="text-center">
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
                  >
                    Je préfère rester dans ma zone de confort
                  </button>
                </div>

                {/* Garantie */}
                <div className="text-center text-xs text-gray-500 mt-3">
                  🔒 Satisfaction garantie ou remboursé • ⚡ Résultats en 30 jours
                </div>
              </div>
            </div>

            {/* Badge de confiance en bas */}
            <div className="bg-gray-50 px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-center space-x-2 sm:space-x-4 text-xs text-gray-600 flex-shrink-0">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                500+ clients satisfaits
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                Support 24/7
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                Résultats garantis
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}