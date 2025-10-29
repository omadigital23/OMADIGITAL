import React, { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { Menu, X, ChevronDown, Search, Phone, Mail, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { NextI18nLanguageSwitcher } from './NextI18nLanguageSwitcher';
import { useScrollSpy, useSmoothScroll } from '../hooks/useScrollSpy';

// Hook optimisé pour le scroll avec throttling
const useOptimizedScroll = () => {
  const [scrollState, setScrollState] = useState({
    isScrolled: false,
    isAtTop: true,
    scrollY: 0
  });

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setScrollState({
      isScrolled: currentScrollY > 10,
      isAtTop: currentScrollY === 0,
      scrollY: currentScrollY
    });
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    handleScroll(); // Initialize
    
    return () => window.removeEventListener('scroll', throttledScrollHandler);
  }, [handleScroll]);

  return scrollState;
};

// Validation sécurisée des URLs
const validateUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    const allowedDomains = ['wa.me', 'whatsapp.com', window.location.hostname];
    return allowedDomains.some(domain => parsedUrl.hostname.includes(domain));
  } catch {
    return false;
  }
};

// Sanitisation des entrées utilisateur
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .slice(0, 100); // Limite de longueur
};

// Composant de navigation sécurisé
const SecureNavigation = memo(({ 
  items, 
  activeSection, 
  onNavigate, 
  className = "" 
}: {
  items: Array<{ label: string; id?: string; href?: string; hasDropdown?: boolean }>;
  activeSection: string;
  onNavigate: (item: any) => void;
  className?: string;
}) => (
  <nav className={`flex items-center ${className}`} role="navigation" aria-label="Navigation principale">
    {items.map((item) => (
      <div key={item.id || item.href} className="relative">
        {item.href ? (
          <a
            href={item.href}
            className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            {item.label}
          </a>
        ) : (
          <button
            onClick={() => onNavigate(item)}
            className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
            aria-current={activeSection === item.id ? 'page' : undefined}
          >
            {item.label}
            {item.hasDropdown && <ChevronDown className="ml-1 w-4 h-4" />}
          </button>
        )}
      </div>
    ))}
  </nav>
));

// Composant de recherche sécurisé
const SecureSearch = memo(({ 
  isOpen, 
  onClose, 
  onSearch 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    const sanitizedQuery = sanitizeInput(searchQuery);
    setQuery(sanitizedQuery);
    
    if (sanitizedQuery.length > 2) {
      // Simulation de recherche sécurisée
      const mockResults = [
        { type: 'service', title: 'Automatisation WhatsApp', description: 'Chatbots intelligents' },
        { type: 'blog', title: 'Guide IA PME', description: 'Intégration IA entreprise' }
      ].filter(item => 
        item.title.toLowerCase().includes(sanitizedQuery.toLowerCase())
      );
      setResults(mockResults);
      onSearch(sanitizedQuery);
    } else {
      setResults([]);
    }
  }, [onSearch]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-start justify-center pt-20"
        aria-modal="true"
        role="dialog"
        aria-label="Recherche"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 text-lg border-none outline-none"
                autoFocus
                maxLength={100}
              />
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Fermer la recherche"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={onClose}
                  >
                    <div className="font-medium text-gray-900">{result.title}</div>
                    <div className="text-sm text-gray-600">{result.description}</div>
                  </div>
                ))}
              </div>
            ) : query.length > 2 ? (
              <div className="text-center py-8 text-gray-500">
                Aucun résultat trouvé
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Tapez au moins 3 caractères...
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

// Composant principal du header sécurisé
export const SecureHeader = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  
  const { t } = useTranslation();
  const { isScrolled, isAtTop } = useOptimizedScroll();
  
  const sectionIds = ['hero', 'services', 'offers', 'process', 'contact'];
  const activeSection = useScrollSpy(sectionIds, {
    threshold: 0.3,
    rootMargin: '0px 0px -60% 0px'
  });
  const { scrollToSection } = useSmoothScroll();

  // Navigation sécurisée
  const handleNavigation = useCallback((item: any) => {
    if (item.href && validateUrl(item.href)) {
      window.location.href = item.href;
    } else if (item.id) {
      scrollToSection(item.id, 80);
    }
    setIsMenuOpen(false);
    setIsServicesOpen(false);
  }, [scrollToSection]);

  // WhatsApp sécurisé
  const handleWhatsApp = useCallback(() => {
    const message = encodeURIComponent("Bonjour ! Je souhaite obtenir un devis pour transformer mon business.");
    const whatsappUrl = `https://wa.me/221701193811?text=${message}`;
    
    if (validateUrl(whatsappUrl)) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  // Recherche sécurisée
  const handleSearch = useCallback((query: string) => {
    // Analytics sécurisé
    console.log('Recherche:', sanitizeInput(query));
  }, []);

  const navigationItems = [
    { label: t('header.home'), id: 'hero' },
    { label: t('header.services'), id: 'services', hasDropdown: true },
    { label: t('header.offers'), id: 'offers' },
    { label: t('header.process'), id: 'process' },
    { label: t('header.blog'), href: '/blog' },
    { label: t('header.contact'), id: 'contact' }
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-xl py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo sécurisé */}
            <button 
              onClick={() => handleNavigation({ id: 'hero' })}
              className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg"
              aria-label="Retour à l'accueil"
            >
              <div className={`relative w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500 ${
                isScrolled ? 'bg-white shadow-md' : 'bg-white/20'
              }`}>
                <Image
                  src="/images/logo.webp"
                  alt="OMA Digital Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  isAtTop ? 'text-black' : isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  OMA Digital
                </span>
                <div className={`text-xs -mt-1 transition-colors duration-300 ${
                  isAtTop ? 'text-gray-700' : isScrolled ? 'text-gray-600' : 'text-gray-300'
                }`}>
                  <Shield className="inline w-3 h-3 mr-1" />
                  IA Sécurisée Sénégal & Maroc
                </div>
              </div>
            </button>

            {/* Navigation desktop */}
            <div className="hidden md:block">
              <SecureNavigation
                items={navigationItems}
                activeSection={activeSection}
                onNavigate={handleNavigation}
                className="space-x-1"
              />
            </div>

            {/* Actions sécurisées */}
            <div className="hidden md:flex items-center space-x-2">
              <NextI18nLanguageSwitcher />
              
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-lg transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button 
                onClick={handleWhatsApp}
                className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <span>💬</span>
                <span className="hidden lg:inline">{t('header.whatsapp')}</span>
              </button>
              
              <button 
                onClick={() => handleNavigation({ id: 'contact' })}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {t('header.quote')}
              </button>
            </div>

            {/* Menu mobile */}
            <button
              className="md:hidden p-2.5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t shadow-lg"
            >
              <div className="px-4 py-2 space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id || item.href}
                    onClick={() => handleNavigation(item)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === item.id 
                        ? 'text-orange-500 bg-orange-50 font-semibold' 
                        : 'text-gray-700 hover:text-orange-500 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                
                <div className="pt-4 space-y-3 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      handleWhatsApp();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium flex items-center justify-center space-x-2"
                  >
                    <span>💬</span>
                    <span>{t('header.whatsapp')}</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      handleNavigation({ id: 'contact' });
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium"
                  >
                    {t('header.quote')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Recherche sécurisée */}
      <SecureSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />

      <style jsx>{`
        .nav-link {
          @apply px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500;
        }
        .nav-link.active {
          @apply text-orange-500 bg-orange-50 font-semibold;
        }
      `}</style>
    </>
  );
});

SecureHeader.displayName = 'SecureHeader';