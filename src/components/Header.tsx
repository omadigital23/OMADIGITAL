import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Menu, X, Search, Phone, Mail } from 'lucide-react';
import { trackEvent, trackConversion, trackEngagement } from '../lib/analytics';
import { useTranslation } from 'next-i18next';
import { NextI18nLanguageSwitcher } from './NextI18nLanguageSwitcher';
import { useScrollSpy, useScrollPosition, useSmoothScroll } from '../hooks/useScrollSpy';
import { motion, AnimatePresence } from 'framer-motion';

// Custom hook for throttled scroll handling
const useThrottledScroll = (throttleLimit: number = 10) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 10);
    setIsAtTop(window.scrollY === 0);
  }, []);

  useEffect(() => {
    let throttleTimeout: NodeJS.Timeout | null = null;
    
    const throttledScrollHandler = () => {
      if (throttleTimeout === null) {
        handleScroll();
        throttleTimeout = setTimeout(() => {
          throttleTimeout = null;
        }, throttleLimit);
      }
    };

    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    handleScroll(); // Initialize on mount
    
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [handleScroll, throttleLimit]);

  return { isScrolled, isAtTop };
};

// Utility function for URL validation
const isValidInternalUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    return parsedUrl.origin === window.location.origin;
  } catch (e) {
    return false;
  }
};

// Utility function for input sanitization
const sanitizeInput = (input: string): string => {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

export function Header() {
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const { t, i18n } = useTranslation();
  const { isScrolled, isAtTop } = useThrottledScroll(10); // 10ms throttle
  
  // ScrollSpy optimisé avec Intersection Observer
  const sectionIds = ['hero', 'services', 'offers', 'case-studies', 'process', 'contact'];
  const activeSection = useScrollSpy(sectionIds, {
    threshold: 0.3,
    rootMargin: '0px 0px -60% 0px',
    debounceMs: 150
  });
  const { scrollToSection: smoothScrollToSection } = useSmoothScroll();

  // Build a URL that preserves current language via ?lng=xx
  const buildUrlWithLang = useCallback((path: string) => {
    try {
      const [base, hash] = path.split('#');
      const lang = i18n?.language || 'fr';
      if (!lang || lang === 'fr' || !base) return path;
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${sep}lng=${lang}${hash ? `#${hash}` : ''}`;
    } catch {
      return path;
    }
  }, [i18n?.language]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('header')) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    if (isMenuOpen || isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isMenuOpen, isSearchOpen]);

  const scrollToSection = useCallback((id: string) => {
    if (typeof window !== 'undefined') {
      trackEvent('navigation_click', {
        section: id,
        location: 'header',
        event_category: 'Navigation'
      });
      
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
      }
    }
  }, []);

  const handleCTAClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      trackConversion('quote_request');
      trackEvent('cta_header_click', {
        event_label: 'header_devis_button',
        event_category: 'CTA'
      });
      
      // Check if we're on the homepage
      const isHomePage = window.location.pathname === '/' || window.location.pathname === '/fr' || window.location.pathname === '/en';
      
      if (isHomePage) {
        // On homepage, scroll to contact section
        scrollToSection('contact');
      } else {
        // On other pages, navigate to homepage with hash
        window.location.href = buildUrlWithLang('/#contact');
      }
      
      setIsMenuOpen(false);
    }
  }, [scrollToSection, buildUrlWithLang]);

  const handleWhatsAppClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      trackConversion('whatsapp_contact');
      trackEvent('cta_whatsapp_click', {
        context: 'header',
        event_category: 'Contact'
      });
      const message = "Bonjour ! Je souhaite obtenir un devis pour transformer mon business avec vos solutions IA au Sénégal ou au Maroc.";
      const whatsappUrl = `https://wa.me/221701193811?text=${encodeURIComponent(message)}`;
      
      // Security: Validate URL before opening
      if (isValidInternalUrl(whatsappUrl) || whatsappUrl.startsWith('https://wa.me/')) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
      
      setIsMenuOpen(false);
    }
  }, []);

  const handleSearchClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsSearchOpen(true);
      trackEvent('search_opened', {
        context: 'header',
        event_category: 'Search'
      });
    }
  }, []);

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleSearchChange = useCallback(async (query: string) => {
    // Security: Sanitize input to prevent XSS
    const sanitizedQuery = sanitizeInput(query);
    setSearchQuery(sanitizedQuery);
    
    if (sanitizedQuery.length > 2) {
      try {
        // Simuler une recherche API (vous pourrez remplacer par votre API Supabase)
        const mockResults = [
          { type: 'service', title: t('service.whatsapp.title'), description: t('service.whatsapp.description') },
          { type: 'blog', title: 'Guide IA pour PME', description: 'Comment intégrer l\'IA dans votre entreprise' },
          { type: 'case-study', title: 'Cas client - Restaurant Dakar', description: 'Transformation digitale d\'un restaurant' }
        ].filter(item => 
          item.title.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(sanitizedQuery.toLowerCase())
        );
        
        setSearchResults(mockResults);
        
        if (typeof window !== 'undefined') {
          trackEvent('search_query', {
            query: sanitizedQuery,
            results_count: mockResults.length,
            event_category: 'Search'
          });
        }
      } catch (error) {
        console.error('Erreur de recherche:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  }, [t]);

  // Navigation avec gestion du smooth scroll
  const handleNavClick = useCallback((item: any) => {
    if (item.href) {
      // For external links, use window.location for proper navigation
      if (item.href.startsWith('http')) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else {
        // For internal links, use Next.js router
        window.location.href = item.href;
      }
    } else if (item.id) {
      // Check if we're on the homepage
      const isHomePage = window.location.pathname === '/' || window.location.pathname === '/fr' || window.location.pathname === '/en';
      
      if (isHomePage) {
        // On homepage, scroll to section
        smoothScrollToSection(item.id, 80);
        trackEvent('navigation_click', {
          section: item.id,
          label: item.label,
          event_category: 'Navigation'
        });
      } else {
        // On other pages, navigate to homepage with hash
        const lang = i18n?.language || 'fr';
        const homeUrl = lang === 'fr' ? '/' : `/${lang}`;
        window.location.href = `${homeUrl}#${item.id}`;
      }
    }
    setIsMenuOpen(false);
  }, [smoothScrollToSection, i18n?.language]);

  const navigationItems = [
    { label: t('header.home'), id: 'hero' },
    { label: t('header.services'), id: 'services' },
    { label: t('header.offers'), id: 'offers' },
    { label: t('header.case_studies'), id: 'case-studies' },
    { label: t('header.process'), id: 'process' },
    { label: t('header.blog'), href: '/blog' },
    { label: t('header.contact'), id: 'contact' },
  ];

  // Don't render dropdown content on server to prevent hydration issues
  if (!isClient) {
    // Use default French labels for server-side rendering to ensure consistency
    const serverNavigationItems = [
      { label: t('header.home'), id: 'hero' },
      { label: t('header.services'), id: 'services' },
      { label: t('header.offers'), id: 'offers' },
      { label: t('header.case_studies'), id: 'case-studies' },
      { label: t('header.process'), id: 'process' },
      { label: t('header.blog'), href: '/blog' },
      { label: t('header.contact'), id: 'contact' },
    ];
    
    return (
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-xl py-2' 
            : 'bg-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
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
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center header-nav-container">
              {serverNavigationItems.map((item) => (
                <div key={item.id || item.href} className="relative">
                  <button
                    onClick={() => handleNavClick(item)}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                    className={`transition-all duration-300 font-medium rounded-lg flex items-center header-nav-item ${
                      isAtTop 
                        ? 'text-black hover:text-orange-600 hover:bg-gray-100 text-base' 
                        : isScrolled 
                          ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100 text-base' 
                          : 'text-white hover:text-orange-200 hover:bg-white/10 text-lg'
                    } ${activeSection === item.id ? 'text-orange-600' : ''}`}
                  >
                    {item.label}
                  </button>
                </div>
              ))}
            </nav>
            {/* Language Switcher */}
            <div className="hidden md:flex items-center mr-2">
              <NextI18nLanguageSwitcher />
            </div>

            {/* Search & CTA Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <div 
                onClick={handleSearchClick}
                className={`p-2.5 rounded-lg transition-all duration-300 cursor-pointer ${
                  isAtTop 
                    ? 'text-black hover:text-orange-600 hover:bg-gray-100' 
                    : isScrolled 
                      ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100' 
                      : 'text-white hover:text-orange-200 hover:bg-white/10'
                }`}
              >
                <Search className="w-5 h-5" />
              </div>
              <div 
                onClick={handleWhatsAppClick}
                className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 text-sm flex items-center space-x-2 cursor-pointer ${
                  isAtTop 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : isScrolled 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                <span>💬</span>
                <span className="hidden lg:inline">WhatsApp</span>
              </div>
              <div 
                onClick={handleCTAClick}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 text-sm cursor-pointer ${
                  isAtTop 
                    ? 'bg-black hover:bg-gray-800 text-white' 
                    : isScrolled 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-white text-orange-600 hover:bg-gray-100'
                }`}
              >
                Devis Gratuit
              </div>
            </div>

            {/* Mobile menu button */}
            <div
              onClick={() => setIsMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              role="button"
              tabIndex={0}
              className={`md:hidden p-2.5 rounded-lg transition-all duration-300 ${
                isAtTop 
                  ? 'text-black hover:text-orange-600 hover:bg-gray-100' 
                  : isScrolled 
                    ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100' 
                    : 'text-white hover:text-orange-200 hover:bg-white/10'
              }`}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsMenuOpen(prev => !prev); }}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-xl py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
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
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center header-nav-container">
            {navigationItems.map((item) => (
              <div key={item.id || item.href} className="relative">
                <button
                  onClick={() => handleNavClick(item)}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                  className={`transition-all duration-300 font-medium rounded-lg flex items-center header-nav-item ${
                    isAtTop 
                      ? 'text-black hover:text-orange-600 hover:bg-gray-100 text-base' 
                      : isScrolled 
                        ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100 text-base' 
                        : 'text-white hover:text-orange-200 hover:bg-white/10 text-lg'
                  } ${activeSection === item.id ? 'text-orange-600' : ''}`}
                >
                  {item.label}
                </button>
              </div>
            ))}
          </nav>

          {/* Language Switcher */}
          <div className="hidden md:flex items-center mr-2">
            <NextI18nLanguageSwitcher />
          </div>

          {/* Search & CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <div 
              onClick={handleSearchClick}
              className={`p-2.5 rounded-lg transition-all duration-300 cursor-pointer ${
                isAtTop 
                  ? 'text-black hover:text-orange-600 hover:bg-gray-100' 
                  : isScrolled 
                    ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100' 
                    : 'text-white hover:text-orange-200 hover:bg-white/10'
              }`}
            >
              <Search className="w-5 h-5" />
            </div>
            <div 
              onClick={handleWhatsAppClick}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 text-sm flex items-center space-x-2 cursor-pointer ${
                isAtTop 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : isScrolled 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <span>💬</span>
              <span className="hidden lg:inline">WhatsApp</span>
            </div>
            <div 
              onClick={handleCTAClick}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 text-sm cursor-pointer ${
                isAtTop 
                  ? 'bg-black hover:bg-gray-800 text-white' 
                  : isScrolled 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-white text-orange-600 hover:bg-gray-100'
              }`}
            >
              Devis Gratuit
            </div>
          </div>

          {/* Mobile menu button */}
          <div
            onClick={() => setIsMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
            role="button"
            tabIndex={0}
            className={`md:hidden p-2.5 rounded-lg transition-all duration-300 ${
              isAtTop 
                ? 'text-black hover:text-orange-600 hover:bg-gray-100' 
                : isScrolled 
                  ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100' 
                  : 'text-white hover:text-orange-200 hover:bg-white/10'
            }`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsMenuOpen(prev => !prev); }}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - only render on client */}
      {isClient && (
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 backdrop-blur-md shadow-lg"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigationItems.map((item) => (
                  <div key={item.id || item.href}>
                    <button
                      onClick={() => handleNavClick(item)}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-gray-50 w-full text-left"
                    >
                      {item.label}
                    </button>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <NextI18nLanguageSwitcher />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Search Modal - only render on client */}
      {isClient && isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={t('header.search_placeholder')}
                  className="ml-2 flex-1 border-0 focus:ring-0 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSearchClose}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            {searchResults.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="font-medium text-gray-900">{result.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{result.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
