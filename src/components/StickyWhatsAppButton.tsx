/**
 * Bouton WhatsApp Sticky pour Mobile
 * Visible en permanence sur mobile pour faciliter le contact
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackEvent } from '../lib/analytics';

export function StickyWhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Afficher le bouton après un scroll de 300px
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 300;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_sticky_click', {
      event_label: 'sticky_button_mobile',
      phone_number: '+212701193811'
    });

    const message = encodeURIComponent(
      "Salut ! Je souhaite en savoir plus sur vos solutions d'automatisation IA pour mon business."
    );
    const whatsappUrl = `https://wa.me/212701193811?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 right-4 z-40 md:hidden"
        >
          {/* Bouton principal */}
          <button
            onClick={handleWhatsAppClick}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all duration-300 group"
            aria-label="Contacter via WhatsApp"
          >
            <div className="flex items-center px-4 py-3">
              <MessageCircle className="w-6 h-6" />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 'auto', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="ml-2 font-semibold whitespace-nowrap overflow-hidden"
                  >
                    WhatsApp
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </button>

          {/* Pulse animation */}
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 pointer-events-none"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
