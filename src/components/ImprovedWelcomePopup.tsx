import React, { useState, useEffect } from 'react';
import { X, Star, Zap, Clock, Gift, ArrowRight, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ImprovedWelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImprovedWelcomePopup({ isOpen, onClose }: ImprovedWelcomePopupProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [currentBenefit, setCurrentBenefit] = useState(0);

  const benefits = [
    { icon: "🚀", text: "Automatisation WhatsApp en 48h", color: "text-blue-600" },
    { icon: "💰", text: "+200% de CA garanti en 3 mois", color: "text-green-600" },
    { icon: "⚡", text: "Site ultra-rapide <1.5s", color: "text-orange-600" },
    { icon: "🤖", text: "IA qui parle français parfait", color: "text-purple-600" }
  ] as const;

  const currentBenefitItem = benefits[currentBenefit % benefits.length];

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, timeLeft]);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentBenefit((prev) => (prev + 1) % benefits.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen, benefits.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWhatsApp = () => {
    const message = "🎯 Bonjour ! Je viens de voir votre offre spéciale sur le site. Je veux doubler mon CA avec vos solutions IA. Quand peut-on discuter ?";
    window.open(`https://wa.me/221701193811?text=${encodeURIComponent(message)}`, '_blank');
    onClose();
  };

  const handleCall = () => {
    window.open('tel:+221701193811', '_self');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 100 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge urgence */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold animate-pulse">
                🔥 OFFRE LIMITÉE
              </div>
            </div>

            {/* Header avec gradient animé */}
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center relative z-10">
                <motion.div 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
                >
                  <Image src="/images/logo.webp" alt="OMA Digital" width={56} height={56} className="object-contain" />
                </motion.div>
                
                <h2 className="text-2xl font-bold mb-2">
                  🎯 Doublez Votre CA en 3 Mois !
                </h2>
                <p className="text-orange-100 text-sm">
                  200+ PME sénégalaises et marocaines nous font confiance
                </p>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="p-6">
              {/* Timer urgence */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-bold">Offre expire dans :</span>
                </div>
                <div className="text-3xl font-bold text-red-600 font-mono">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-red-600 mt-1">
                  ⏰ Consultation + Audit gratuits (valeur 500€)
                </div>
              </div>

              {/* Bénéfices rotatifs */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 mb-6 min-h-[80px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBenefit}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center space-x-3 w-full"
                  >
                    <div className="text-3xl">{currentBenefitItem.icon}</div>
                    <div>
                      <div className={`font-bold ${currentBenefitItem.color}`}>
                        {currentBenefitItem.text}
                      </div>
                      <div className="text-xs text-gray-600">
                        Résultat garanti ou remboursé
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Preuve sociale rapide */}
              <div className="flex items-center justify-center space-x-4 mb-6 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold">4.9/5</span>
                </div>
                <div className="text-gray-400">•</div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-600">+300% CA moyen</span>
                </div>
              </div>

              {/* Offre irrésistible */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Gift className="w-6 h-6 text-orange-600" />
                    <span className="text-lg font-bold text-orange-800">CADEAU EXCEPTIONNEL</span>
                  </div>
                  <div className="text-sm text-orange-700 mb-2">
                    ✅ Consultation stratégique (500€) → <strong>GRATUIT</strong><br/>
                    ✅ Audit complet de votre business → <strong>GRATUIT</strong><br/>
                    ✅ Plan d'action personnalisé → <strong>GRATUIT</strong>
                  </div>
                  <div className="text-xs text-orange-600 font-medium">
                    🎁 Valeur totale : 1500€ - Aujourd'hui : 0€
                  </div>
                </div>
              </div>

              {/* CTA principal */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsApp}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>💬</span>
                  <span>RÉCLAMER MON CADEAU MAINTENANT</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                
                <button
                  onClick={handleCall}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>📞</span>
                  <span>Appeler directement : +221 70 119 38 11</span>
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors text-sm"
                >
                  Non merci, je préfère rester dans la galère 😢
                </button>
              </div>

              {/* Garantie */}
              <div className="text-center mt-4 text-xs text-gray-600">
                🛡️ <strong>Garantie 100% satisfait ou remboursé</strong><br/>
                ⚡ Réponse garantie sous 2h • 🇸🇳🇲🇦 Équipe locale
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}