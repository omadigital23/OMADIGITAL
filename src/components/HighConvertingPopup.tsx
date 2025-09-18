import React, { useState, useEffect } from 'react';
import { X, Star, Clock, TrendingUp, Users, Zap, Gift, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface HighConvertingPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HighConvertingPopup({ isOpen, onClose }: HighConvertingPopupProps) {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [currentProof, setCurrentProof] = useState(0);

  const socialProofs = [
    { text: "Amadou vient de gagner 2.5M FCFA ce mois", time: "Il y a 2 min", location: "Dakar" },
    { text: "Fatima a automatisé 500 commandes/jour", time: "Il y a 5 min", location: "Casablanca" },
    { text: "Ibrahim économise 40h/semaine maintenant", time: "Il y a 8 min", location: "Thiès" }
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
    const message = "🚨 URGENT ! Je veux profiter de votre offre spéciale avant qu'elle expire. Combien je peux gagner avec mes 10 000 FCFA ?";
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 15 }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.4 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative border-4 border-red-500 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Badge URGENT qui pulse */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg"
              >
                🚨 ALERTE OPPORTUNITÉ
              </motion.div>
            </div>

            {/* Header avec gradient qui bouge */}
            <div className="bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500 p-6 text-white relative overflow-hidden">
              <motion.div 
                animate={{ x: [-100, 100] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center relative z-10">
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
                >
                  <Image src="/images/logo.webp" alt="OMA Digital" width={48} height={48} className="object-contain" />
                </motion.div>
                
                <h2 className="text-xl font-bold mb-2">
                  ⚡ DERNIÈRE CHANCE ⚡
                </h2>
                <p className="text-sm text-orange-100">
                  Seulement 3 places restantes aujourd'hui
                </p>
              </div>
            </div>

            {/* Contenu principal */}
            <div className="p-4">
              {/* Timer d'urgence plus agressif */}
              <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-3 mb-4 text-center relative overflow-hidden">
                <motion.div 
                  animate={{ x: [-20, 20] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute inset-0 bg-red-200/30"
                />
                <div className="relative z-10">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-red-700" />
                    <span className="text-red-800 font-bold text-sm">Cette offre EXPIRE dans :</span>
                  </div>
                  <div className="text-3xl font-bold text-red-700 font-mono mb-1">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xs text-red-600 font-semibold">
                    ⏰ Après ça, retour au prix normal (+500%)
                  </div>
                </div>
              </div>

              {/* Proposition de valeur choc */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-3 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800 mb-2">
                    💰 TRANSFORMEZ 10 000 FCFA
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    EN 2 000 000 FCFA/MOIS
                  </div>
                  <div className="text-sm text-green-700">
                    ✅ Résultat garanti en 90 jours<br/>
                    ✅ Ou on vous rembourse 200%
                  </div>
                </div>
              </div>

              {/* Preuve sociale en temps réel */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 mb-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentProof}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
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

              {/* Offre irrésistible */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-2xl p-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-800 mb-2">
                    🎁 CADEAU EXCEPTIONNEL AUJOURD'HUI
                  </div>
                  <div className="space-y-1 text-sm text-orange-700">
                    <div>✅ Setup complet WhatsApp IA → <span className="line-through">500 000 FCFA</span> <strong>GRATUIT</strong></div>
                    <div>✅ Formation 1-on-1 (3h) → <span className="line-through">200 000 FCFA</span> <strong>GRATUIT</strong></div>
                    <div>✅ Support 24/7 (1 mois) → <span className="line-through">150 000 FCFA</span> <strong>GRATUIT</strong></div>
                    <div>✅ Garantie succès → <span className="line-through">Inestimable</span> <strong>INCLUSE</strong></div>
                  </div>
                  <div className="mt-2 text-xs text-orange-600 font-bold">
                    💎 Valeur totale : 850 000 FCFA → Aujourd'hui : 10 000 FCFA
                  </div>
                </div>
              </div>

              {/* Stats qui impressionnent */}
              <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="font-bold text-lg text-gray-900">847%</div>
                  <div className="text-gray-600">ROI moyen</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="font-bold text-lg text-gray-900">48h</div>
                  <div className="text-gray-600">Setup</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="font-bold text-lg text-gray-900">0%</div>
                  <div className="text-gray-600">Échecs</div>
                </div>
              </div>

              {/* CTA ultra-persuasif */}
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  animate={{ boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0.7)", "0 0 0 10px rgba(34, 197, 94, 0)", "0 0 0 0 rgba(34, 197, 94, 0)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  onClick={handleWhatsApp}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl text-lg"
                >
                  <span>💬</span>
                  <span>OUI ! JE VEUX MES 2M FCFA/MOIS</span>
                </motion.button>
                
                <div className="text-center text-xs text-gray-600">
                  🔒 <strong>Paiement sécurisé</strong> • ⚡ <strong>Réponse immédiate</strong> • 🇸🇳🇲🇦 <strong>Équipe locale</strong>
                </div>
                
                <button
                  onClick={onClose}
                  className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 transition-colors text-sm"
                >
                  Non merci, je préfère rester pauvre 😢
                </button>
              </div>

              {/* Urgence finale */}
              <div className="mt-4 text-center">
                <div className="text-xs text-red-600 font-semibold animate-pulse">
                  ⚠️ ATTENTION : Plus que {Math.max(0, Math.floor(timeLeft / 60))} minutes pour profiter de cette offre
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}