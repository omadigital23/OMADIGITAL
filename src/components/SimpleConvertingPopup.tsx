import React, { useState, useEffect } from 'react';
import { X, Star, Clock, TrendingUp, Zap, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface SimpleConvertingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SimpleConvertingPopup({ isOpen, onClose }: SimpleConvertingPopupProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [currentProof, setCurrentProof] = useState(0);

  const socialProofs = [
    { text: "Amadou a doublé son CA ce mois", time: "Il y a 2 min", location: "Dakar" },
    { text: "Fatima automatise 500 commandes/jour", time: "Il y a 5 min", location: "Casablanca" },
    { text: "Ibrahim économise 40h/semaine", time: "Il y a 8 min", location: "Thiès" }
  ] as const;

  const currentSocialProof = socialProofs[currentProof % socialProofs.length];

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, timeLeft]);

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentProof((prev) => (prev + 1) % socialProofs.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, socialProofs.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWhatsApp = () => {
    const message = "🚀 Bonjour ! Je viens de voir votre offre spéciale. Je veux transformer mon business avec vos solutions IA. Quand peut-on discuter ?";
    window.open(`https://wa.me/221701193811?text=${encodeURIComponent(message)}`, '_blank');
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
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header avec gradient */}
            <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Image src="/images/logo.webp" alt="OMA Digital" width={48} height={48} className="object-contain" />
                </div>
                
                <div className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold mb-3 animate-pulse">
                  🔥 OFFRE SPÉCIALE
                </div>
                
                <h2 className="text-xl font-bold mb-2">
                  🚀 Transformez Votre Business !
                </h2>
                <p className="text-sm text-orange-100">
                  Rejoignez 200+ PME qui ont doublé leur CA
                </p>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="p-5">
              {/* Timer d'urgence */}
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 mb-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span className="text-red-800 font-bold text-sm">Offre expire dans :</span>
                </div>
                <div className="text-2xl font-bold text-red-600 font-mono">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-red-600 mt-1">
                  ⏰ Découverte exclusive limitée
                </div>
              </div>

              {/* Bénéfices clés */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-800 mb-2">
                    💰 Doublez Votre Chiffre d'Affaires
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>✅ Automatisation WhatsApp complète</div>
                    <div>✅ Site ultra-rapide qui convertit</div>
                    <div>✅ IA qui parle français parfait</div>
                    <div>✅ Support 24/7 inclus</div>
                  </div>
                </div>
              </div>

              {/* Preuve sociale */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentProof}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-blue-800">
                        {currentSocialProof.text}
                      </div>
                      <div className="text-xs text-blue-600">
                        {currentSocialProof.location} • {currentSocialProof.time}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Offre gratuite */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Gift className="w-5 h-5 text-orange-600" />
                    <span className="text-lg font-bold text-orange-800">CADEAU AUJOURD'HUI</span>
                  </div>
                  <div className="text-sm text-orange-700 space-y-1">
                    <div>🎁 Consultation stratégique → <strong>GRATUIT</strong></div>
                    <div>🎁 Audit complet de votre business → <strong>GRATUIT</strong></div>
                    <div>🎁 Plan d'action personnalisé → <strong>GRATUIT</strong></div>
                  </div>
                  <div className="text-xs text-orange-600 font-medium mt-2">
                    💎 Normalement payant - Aujourd'hui offert
                  </div>
                </div>
              </div>

              {/* Stats impressionnantes */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="font-bold text-lg text-gray-900">+200%</div>
                  <div className="text-gray-600">CA moyen</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="font-bold text-lg text-gray-900">48h</div>
                  <div className="text-gray-600">Setup</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="font-bold text-lg text-gray-900">98%</div>
                  <div className="text-gray-600">Satisfait</div>
                </div>
              </div>

              {/* CTA principal */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsApp}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>💬</span>
                  <span>OUI ! JE VEUX MON AUDIT GRATUIT</span>
                </motion.button>
                
                <div className="text-center text-xs text-gray-600">
                  🔒 <strong>100% Gratuit</strong> • ⚡ <strong>Réponse sous 2h</strong> • 🇸🇳🇲🇦 <strong>Équipe locale</strong>
                </div>
                
                <button
                  onClick={onClose}
                  className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors text-sm"
                >
                  Plus tard
                </button>
              </div>

              {/* Garantie */}
              <div className="mt-3 text-center">
                <div className="text-xs text-gray-600">
                  🛡️ <strong>Garantie satisfaction</strong> • ⏰ <strong>Sans engagement</strong>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}