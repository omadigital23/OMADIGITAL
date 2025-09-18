import React, { useState, useEffect } from 'react';
import { X, Star, Zap, Users, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateWhatsAppLink } from '../utils/supabase/info';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomePopup({ isOpen, onClose }: WelcomePopupProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Amadou Diop",
      company: "Bakery Liberté",
      location: "Dakar",
      result: "+300% de CA en 6 mois",
      text: "OMA Digital a transformé notre boulangerie. Nos commandes WhatsApp sont maintenant automatisées et notre chiffre d'affaires a triplé !"
    },
    {
      name: "Fatima El Mansouri", 
      company: "Boutique Moderne",
      location: "Casablanca",
      result: "2x plus de clients",
      text: "Grâce à leur chatbot IA, nous répondons instantanément à nos clients 24h/24. Notre taux de conversion a doublé !"
    },
    {
      name: "Ibrahim Sall",
      company: "Tech Solutions",
      location: "Thiès", 
      result: "50h/mois économisées",
      text: "L'automatisation mise en place nous fait économiser 50 heures par mois. Nous pouvons enfin nous concentrer sur la croissance !"
    }
  ];

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, testimonials.length]);

  const handleGetQuote = () => {
    const message = "Bonjour ! Je viens de voir votre popup d'accueil et je suis intéressé(e) par vos solutions d'automatisation. Pouvez-vous me faire un devis personnalisé ?";
    window.open(generateWhatsAppLink(message), '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec logo */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <img 
                    src="/images/logo.webp" 
                    alt="OMA Digital" 
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-2">Bienvenue chez OMA Digital !</h2>
                <p className="text-orange-100">Votre partenaire transformation digitale</p>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="p-6">
              {/* Stats impressionnants */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">200+</div>
                  <div className="text-xs text-gray-600">PME Transformées</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">+300%</div>
                  <div className="text-xs text-gray-600">ROI Moyen</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Award className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-xl font-bold text-gray-900">98%</div>
                  <div className="text-xs text-gray-600">Satisfaction</div>
                </div>
              </div>

              {/* Témoignage rotatif */}
              <div className="bg-gray-50 rounded-2xl p-4 mb-6 min-h-[120px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTestimonial}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="ml-2 text-sm font-semibold text-green-600">
                        {testimonials[currentTestimonial].result}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2 italic">
                      "{testimonials[currentTestimonial].text}"
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>{testimonials[currentTestimonial].name}</strong> - {testimonials[currentTestimonial].company}, {testimonials[currentTestimonial].location}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Offre spéciale */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-800 mb-1">🎁 Offre Spéciale</div>
                  <div className="text-sm text-orange-700 mb-2">
                    <strong>Découverte de votre potentiel + Stratégie sur mesure</strong>
                  </div>
                  <div className="text-xs text-orange-600">
                    Découvrez comment automatiser votre business
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-3">
                <button
                  onClick={handleGetQuote}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>🚀 Obtenir Mon Devis Gratuit</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors text-sm"
                >
                  Peut-être plus tard
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}