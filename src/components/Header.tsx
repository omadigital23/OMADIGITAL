import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Menu, X, ChevronDown, Search, Phone, Mail } from 'lucide-react';
import { trackEvent, generateWhatsAppLink } from '../utils/supabase/info';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
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
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  
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
      if (!lang || lang === 'fr') return path;
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${sep}lng=${lang}${hash ? `#${hash}` : ''}`;
    } catch {
      return path;
    }
  }, [i18n?.language]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    if (typeof window !== 'undefined') {
      trackEvent({
        event_name: 'navigation_click',
        event_properties: {
          section: id,
          location: 'header'
        },
        timestamp: new Date().toISOString(),
        url: window.location.href
      } as any);
      
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMenuOpen(false);
        setIsServicesOpen(false);
      }
    }
  }, []);

  const handleCTAClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      trackEvent({
        event_name: 'cta_header_click',
        event_properties: {
          event_label: 'header_devis_button'
        },
        timestamp: new Date().toISOString(),
        url: window.location.href
      } as any);
      
      // Check if we're on the blog page and need to navigate to home first
      if (window.location.pathname === '/blog') {
        window.location.href = buildUrlWithLang('/#contact');
      } else {
        scrollToSection('contact');
      }
    }
  }, [scrollToSection]);

  const handleWhatsAppClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      trackEvent({
        event_name: 'cta_whatsapp_click',
        event_properties: {
          context: 'header'
        },
        timestamp: new Date().toISOString(),
        url: window.location.href
      } as any);
      const message = "Bonjour ! Je souhaite obtenir un devis pour transformer mon business avec vos solutions IA au Sénégal ou au Maroc.";
      const whatsappUrl = `https://wa.me/221701193811?text=${encodeURIComponent(message)}`;
      
      // Security: Validate URL before opening
      if (isValidInternalUrl(whatsappUrl) || whatsappUrl.startsWith('https://wa.me/')) {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }, []);

  const handleSearchClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsSearchOpen(true);
      trackEvent({
        event_name: 'search_opened',
        event_properties: {
          context: 'header'
        },
        timestamp: new Date().toISOString(),
        url: window.location.href
      } as any);
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
          trackEvent({
            event_name: 'search_query',
            event_properties: {
              query: sanitizedQuery,
              results_count: mockResults.length
            },
            timestamp: new Date().toISOString(),
            url: window.location.href
          } as any);
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
      // Navigation externe (blog)
      window.location.href = item.href;
    } else if (item.id) {
      // Scroll vers section avec tracking
      smoothScrollToSection(item.id, 80);
      trackEvent({
        event_name: 'navigation_click',
        section: item.id,
        label: item.label
      });
    }
    setIsMenuOpen(false);
  }, [smoothScrollToSection]);

  const navigationItems = [
    { label: t('header.home'), id: 'hero' },
    { 
      label: t('header.services'), 
      id: 'services',
      hasDropdown: true
    },
    { label: t('header.offers'), id: 'offers' },
    { label: t('header.case_studies'), id: 'case-studies' },
    { label: t('header.process'), id: 'process' },
    { label: t('header.blog'), href: buildUrlWithLang('/blog') },
    { label: t('header.contact'), id: 'contact' },
  ];

  // Don't render dropdown content on server to prevent hydration issues
  if (!isClient) {
    // Use default French labels for server-side rendering to ensure consistency
    const serverNavigationItems = [
      { label: 'Accueil', id: 'hero' },
      { 
        label: 'Services', 
        id: 'services',
        hasDropdown: true
      },
      { label: 'Offres', id: 'offers' },
      { label: 'Études de cas', id: 'case-studies' },
      { label: 'Processus', id: 'process' },
      { label: 'Blog IA', href: buildUrlWithLang('/blog') },
      { label: 'Contact', id: 'contact' },
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
                    className={`transition-all duration-300 font-medium rounded-lg flex items-center header-nav-item ${
                      isAtTop 
                        ? 'text-black hover:text-orange-600 hover:bg-gray-100 text-base' 
                        : isScrolled 
                          ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100 text-base' 
                          : 'text-white hover:text-orange-200 hover:bg-white/10 text-lg'
                    }`}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-300`} />
                    )}
                  </button>
                </div>
              ))}
            </nav>

            {/* Search & CTA Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              <div className={`p-2.5 rounded-lg transition-all duration-300 ${
                isAtTop 
                  ? 'text-black hover:text-orange-600 hover:bg-gray-100' 
                  : isScrolled 
                    ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100' 
                    : 'text-white hover:text-orange-200 hover:bg-white/10'
              }`}>
                <Search className="w-5 h-5" />
              </div>
              <div className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 text-sm flex items-center space-x-2 ${
                isAtTop 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : isScrolled 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
              }`}>
                <span>💬</span>
                <span className="hidden lg:inline">WhatsApp</span>
              </div>
              <div className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 text-sm ${
                isAtTop 
                  ? 'bg-black hover:bg-gray-800 text-white' 
                  : isScrolled 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-white text-orange-600 hover:bg-gray-100'
              }`}>
                Devis Gratuit
              </div>
            </div>

            {/* Mobile menu button */}
            <div className={`md:hidden p-2.5 rounded-lg transition-all duration-300 ${
              isAtTop 
                ? 'text-black hover:text-orange-600 hover:bg-gray-100' 
                : isScrolled 
                  ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100' 
                  : 'text-white hover:text-orange-200 hover:bg-white/10'
            }`}>
              <Menu size={24} />
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
            <button 
              onClick={() => {
                if (window.location.pathname === '/blog') {
                  window.location.href = '/';
                } else {
                  scrollToSection('hero');
                }
              }}
              className="flex items-center space-x-3 group focus:outline-none"
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
                <span className={`text-xl font-bold group-hover:text-orange-500 transition-colors duration-300 ${
                  isAtTop 
                    ? 'text-black' 
                    : isScrolled 
                      ? 'text-gray-900' 
                      : 'text-white'
                }`}>
                  OMA Digital
                </span>
                <div className={`text-xs -mt-1 transition-colors duration-300 ${
                  isAtTop 
                    ? 'text-gray-700' 
                    : isScrolled 
                      ? 'text-gray-600' 
                      : 'text-gray-300'
                }`}>
                  IA & Automatisation Sénégal & Maroc
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          {/* SEO Enhancement: Added proper nav element with aria-label */}
          <nav 
            className="hidden md:flex items-center header-nav-container"
            role="navigation"
            aria-label="Menu principal"
          >
            {navigationItems.map((item) => (
              <div key={item.id || item.href} className="relative">
                {item.href ? (
                  // For external links, use anchor tag with href for better SEO
                  <a
                    href={item.href}
                    className={`transition-all duration-300 font-medium rounded-lg flex items-center header-nav-item ${
                      activeSection === item.id
                        ? 'text-orange-500 border-b-2 border-orange-500' // Active state styling
                        : isAtTop 
                          ? 'text-black hover:text-orange-600 hover:bg-gray-100 text-base' 
                          : isScrolled 
                            ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100 text-base' 
                            : 'text-white hover:text-orange-200 hover:bg-white/10 text-lg'
                    }`}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-300`} />
                    )}
                  </a>
                ) : (
                  // For internal sections, use button with onClick
                  <button
                    onClick={() => {
                      if (item.id) {
                        // Check if we're on the blog page and need to navigate to home first
                        if (window.location.pathname === '/blog' && item.id !== 'blog') {
                          window.location.href = `/#${item.id}`;
                        } else {
                          scrollToSection(item.id);
                        }
                      }
                    }}
                    onMouseEnter={() => {
                      if (item.hasDropdown) {
                        setIsServicesOpen(true);
                      }
                    }}
                    onMouseLeave={() => {
                      if (item.hasDropdown) {
                        setIsServicesOpen(false);
                      }
                    }}
                    // SEO Enhancement: Added aria-current for active section
                    className={`transition-all duration-300 font-medium rounded-lg flex items-center header-nav-item ${
                      activeSection === item.id
                        ? 'text-orange-500 border-b-2 border-orange-500' // Active state styling
                        : isAtTop 
                          ? 'text-black hover:text-orange-600 hover:bg-gray-100 text-base' 
                          : isScrolled 
                            ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100 text-base' 
                            : 'text-white hover:text-orange-200 hover:bg-white/10 text-lg'
                    }`}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <ChevronDown className={`ml-1 w-4 h-4 transition-transform duration-300 ${isServicesOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                )}
                
                {/* Services Dropdown */}
                {item.hasDropdown && isServicesOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Nos Services</h3>
                      <p className="text-sm text-gray-600">Solutions complètes pour votre transformation digitale au Sénégal et au Maroc</p>
                    </div>
                    <div className="grid grid-cols-1 gap-1 px-2 py-2">
                      <button
                        onClick={() => {
                          scrollToSection('services');
                          setIsServicesOpen(false);
                        }}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-colors text-left"
                      >
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <Phone className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Automatisation WhatsApp</div>
                          <div className="text-sm text-gray-600">Chatbots intelligents pour WhatsApp Business</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          scrollToSection('services');
                          setIsServicesOpen(false);
                        }}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-colors text-left"
                      >
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Sites Ultra-Rapides</div>
                          <div className="text-sm text-gray-600">Performance {'<1.5s'} optimisée pour Google</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          scrollToSection('services');
                          setIsServicesOpen(false);
                        }}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-orange-50 transition-colors text-left"
                      >
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Search className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">IA Conversationnelle</div>
                          <div className="text-sm text-gray-600">Chatbots multilingues et analytics avancés</div>
                        </div>
                      </button>
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          scrollToSection('services');
                          setIsServicesOpen(false);
                        }}
                        className="w-full text-center text-orange-600 hover:text-orange-700 font-medium text-sm"
                      >
                        Voir tous les services →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search & CTA Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <LanguageSwitcher />
            <button 
              onClick={handleSearchClick}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                isAtTop 
                  ? 'text-black hover:text-orange-600 hover:bg-gray-100' 
                  : isScrolled 
                    ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100' 
                    : 'text-white hover:text-orange-200 hover:bg-white/10'
              }`}
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={handleWhatsAppClick}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 text-sm flex items-center space-x-2 ${
                isAtTop 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : isScrolled 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <span>💬</span>
              <span className="hidden lg:inline">{t('header.whatsapp')}</span>
            </button>
            <button 
              onClick={handleCTAClick}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 text-sm ${
                isAtTop 
                  ? 'bg-black hover:bg-gray-800 text-white' 
                  : isScrolled 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-white text-orange-600 hover:bg-gray-100'
              }`}
            >
              {t('header.quote')}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className={`md:hidden p-2.5 rounded-lg transition-all duration-300 ${
              isAtTop 
                ? 'text-black hover:text-orange-600 hover:bg-gray-100' 
                : isScrolled 
                  ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100' 
                  : 'text-white hover:text-orange-200 hover:bg-white/10'
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className={`md:hidden transition-all duration-300 ${
          isScrolled ? 'bg-white border-t shadow-lg' : isAtTop ? 'bg-white border-t shadow-lg' : 'bg-white/95 backdrop-blur-md border-t border-white/20 shadow-xl'
        }`}>
          {/* Mobile Logo */}
          <div className="px-4 py-3 border-b border-gray-100">
            <button 
              onClick={() => {
                if (window.location.pathname === '/blog') {
                  window.location.href = '/';
                } else {
                  scrollToSection('hero');
                }
                setIsMenuOpen(false);
              }}
              className="flex items-center space-x-3"
            >
              <div className="relative w-10 h-10 rounded-lg flex items-center justify-center bg-orange-500">
                <Image
                  src="/images/logo.webp"
                  alt="OMA Digital Logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority={false}
                />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">
                  OMA Digital
                </span>
                <div className="text-xs text-gray-600">
                  IA & Automatisation Sénégal & Maroc
                </div>
              </div>
            </button>
          </div>
          
          <div className="px-4 py-2 space-y-1">
            {navigationItems.map((item) => (
              <div key={item.id || item.href}>
                {item.href ? (
                  // For external links, use anchor tag with href for better SEO
                  <a
                    href={item.href}
                    className={`w-full text-left rounded-lg transition-all duration-300 font-medium header-nav-item ${
                      activeSection === item.id
                        ? 'text-orange-500 font-bold border-l-4 border-orange-500 pl-4' // Active state styling for mobile
                        : isAtTop 
                          ? 'text-black hover:text-orange-600 hover:bg-gray-100' 
                          : isScrolled 
                            ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100' 
                            : 'text-gray-900 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                ) : (
                  // For internal sections, use button with onClick
                  <button
                    onClick={() => {
                      if (item.id) {
                        // Check if we're on the blog page and need to navigate to home first
                        if (window.location.pathname === '/blog' && item.id !== 'blog') {
                          window.location.href = `/#${item.id}`;
                        } else {
                          scrollToSection(item.id);
                        }
                        setIsMenuOpen(false);
                      }
                    }}
                    // SEO Enhancement: Added aria-current for active section in mobile menu
                    className={`w-full text-left rounded-lg transition-all duration-300 font-medium header-nav-item ${
                      activeSection === item.id
                        ? 'text-orange-500 font-bold border-l-4 border-orange-500 pl-4' // Active state styling for mobile
                        : isAtTop 
                          ? 'text-black hover:text-orange-600 hover:bg-gray-100' 
                          : isScrolled 
                            ? 'text-gray-700 hover:text-orange-500 hover:bg-gray-100' 
                            : 'text-gray-900 hover:text-orange-600 hover:bg-orange-50'
                    }`}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {item.label}
                  </button>
                )}
                
                {item.hasDropdown && (
                  <div className="pl-8 space-y-1 border-l-2 border-orange-200 ml-6">
                    <button
                      onClick={() => {
                        scrollToSection('services');
                        setIsMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        isAtTop 
                          ? 'text-gray-700 hover:text-orange-600 hover:bg-gray-100' 
                          : isScrolled 
                            ? 'text-gray-600 hover:text-orange-500 hover:bg-gray-100' 
                            : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      Automatisation WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        scrollToSection('services');
                        setIsMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        isAtTop 
                          ? 'text-gray-700 hover:text-orange-600 hover:bg-gray-100' 
                          : isScrolled 
                            ? 'text-gray-600 hover:text-orange-500 hover:bg-gray-100' 
                            : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      Sites Ultra-Rapides
                    </button>
                    <button
                      onClick={() => {
                        scrollToSection('services');
                        setIsMenuOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        isAtTop 
                          ? 'text-gray-700 hover:text-orange-600 hover:bg-gray-100' 
                          : isScrolled 
                            ? 'text-gray-600 hover:text-orange-500 hover:bg-gray-100' 
                            : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      IA Conversationnelle
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Mobile CTA Buttons */}
            <div className="pt-4 space-y-3 border-t border-gray-100">
              <button 
                onClick={() => {
                  handleWhatsAppClick();
                  setIsMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                  isAtTop 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : isScrolled 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <span>💬</span>
                <span>{t('header.whatsapp')}</span>
              </button>
              <button 
                onClick={() => {
                  handleCTAClick();
                  setIsMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isAtTop 
                    ? 'bg-black hover:bg-gray-800 text-white' 
                    : isScrolled 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {t('header.quote')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal - Enhanced security */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-start justify-center pt-20" aria-modal="true" role="dialog">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden">
            {/* Search Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des services, articles, études de cas..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="flex-1 text-lg border-none outline-none"
                  autoFocus
                  // Security: Prevent XSS by sanitizing input
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                  }}
                />
                <button
                  onClick={handleSearchClose}
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label="Fermer la recherche"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {searchQuery.length > 2 ? (
                searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            trackEvent({
                              event_name: 'search_result_click',
                              event_properties: {
                                result_type: result.type,
                                result_title: result.title
                              },
                              timestamp: new Date().toISOString(),
                              url: window.location.href
                            } as any);
                          }
                          handleSearchClose();
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                            result.type === 'service' ? 'bg-orange-100 text-orange-600' :
                            result.type === 'blog' ? 'bg-blue-100 text-blue-600' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {result.type === 'service' ? '⚙️' : result.type === 'blog' ? '📝' : '📊'}
                          </div>
                          <div className="flex-1">
                            {/* Security: Sanitize displayed content */}
                            <div 
                              className="font-medium text-gray-900"
                              dangerouslySetInnerHTML={{ __html: result.title.replace(/</g, "&lt;").replace(/>/g, "&gt;") }}
                            ></div>
                            <div 
                              className="text-sm text-gray-600"
                              dangerouslySetInnerHTML={{ __html: result.description.replace(/</g, "&lt;").replace(/>/g, "&gt;") }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun résultat trouvé pour "{searchQuery}"
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tapez au moins 3 caractères pour rechercher...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}