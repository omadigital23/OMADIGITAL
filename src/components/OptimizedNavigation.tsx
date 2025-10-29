import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';

interface NavigationProps {
  activeSection: string;
  onNavClick: (item: any) => void;
  isMobile?: boolean;
  className?: string;
}

export function OptimizedNavigation({ 
  activeSection, 
  onNavClick, 
  isMobile = false, 
  className = '' 
}: NavigationProps) {
  const { t } = useTranslation('common');

  const navigationItems = [
    { label: t('header.home'), id: 'hero' },
    { label: t('header.services'), id: 'services' },
    { label: t('header.offers'), id: 'offers' },
    { label: t('header.process'), id: 'process' },
    { label: t('header.blog'), href: '/blog' },
    { label: t('header.contact'), id: 'contact' },
  ];

  return (
    <nav className={`${className}`} role="navigation" aria-label="Navigation principale">
      <ul className={`${isMobile ? 'flex flex-col space-y-4' : 'flex items-center space-x-8'}`}>
        {navigationItems.map((item, index) => {
          const isActive = activeSection === item.id;
          const isExternal = !!item.href;
          
          return (
            <li key={item.id || item.href} className="relative">
              <motion.button
                onClick={() => onNavClick(item)}
                className={`
                  relative px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out
                  ${isMobile ? 'w-full text-left' : 'text-center'}
                  ${isActive 
                    ? 'text-orange-600 font-semibold' 
                    : 'text-gray-700 hover:text-orange-500'
                  }
                  ${isExternal ? 'hover:text-blue-600' : ''}
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 rounded-lg
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${item.label}${isExternal ? ' (ouvre dans un nouvel onglet)' : ''}`}
              >
                {/* Texte du lien */}
                <span className="relative z-10">
                  {item.label}
                  {isExternal && (
                    <svg 
                      className="inline-block w-3 h-3 ml-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                      />
                    </svg>
                  )}
                </span>

                {/* Indicateur visuel pour section active */}
                {isActive && !isExternal && (
                  <>
                    {/* Barre animée sous le lien (desktop) */}
                    {!isMobile && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                        layoutId="activeIndicator"
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0, scaleX: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30,
                          duration: 0.3 
                        }}
                      />
                    )}

                    {/* Indicateur mobile (point coloré) */}
                    {isMobile && (
                      <motion.div
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full"
                        layoutId="mobileActiveIndicator"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 25 
                        }}
                      />
                    )}

                    {/* Effet de lueur subtile */}
                    <motion.div
                      className="absolute inset-0 bg-orange-100 rounded-lg opacity-20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    />
                  </>
                )}

                {/* Effet hover pour les liens non-actifs */}
                {!isActive && (
                  <motion.div
                    className="absolute inset-0 bg-gray-100 rounded-lg opacity-0 hover:opacity-10"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Composant CTA sticky optimisé
interface StickyCtaProps {
  onCtaClick: () => void;
  isVisible: boolean;
}

export function StickyCtaButton({ onCtaClick, isVisible }: StickyCtaProps) {
  const { t } = useTranslation('common');

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-4 right-4 z-50"
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 25 
      }}
    >
      <motion.button
        onClick={onCtaClick}
        className="
          bg-gradient-to-r from-orange-500 to-orange-600 
          text-white font-semibold px-6 py-3 rounded-full 
          shadow-lg hover:shadow-xl
          flex items-center space-x-2
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50
          transition-all duration-300
        "
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        whileTap={{ scale: 0.95 }}
        // Animation de pulsation subtile
        animate={{
          boxShadow: [
            "0 10px 15px -3px rgba(251, 146, 60, 0.3)",
            "0 15px 20px -3px rgba(251, 146, 60, 0.4)",
            "0 10px 15px -3px rgba(251, 146, 60, 0.3)"
          ]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        aria-label="Demander une démonstration gratuite"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 10V3L4 14h7v7l9-11h-7z" 
          />
        </svg>
        <span className="hidden sm:inline">{t('header.quote')}</span>
        <span className="sm:hidden">Demo</span>
      </motion.button>
    </motion.div>
  );
}

// Hook pour gérer la visibilité du CTA sticky
export function useStickyCtaVisibility(activeSection: string) {
  // Afficher le CTA sticky sauf sur la section hero et contact
  const isVisible = activeSection !== 'hero' && activeSection !== 'contact';
  return isVisible;
}