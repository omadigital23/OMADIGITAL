// Header amélioré avec changement de couleur par section
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X, ChevronDown, Phone, Mail, MessageCircle } from 'lucide-react';
import { trackEvent, generateWhatsAppLink } from '../utils/supabase/info';
import { useTranslation } from 'next-i18next';
import { NextI18nLanguageSwitcher } from './NextI18nLanguageSwitcher';
import { useScrollSpy, useScrollPosition } from '../hooks/useScrollSpy';

// Configuration des couleurs par section
const SECTION_THEMES = {
  hero: {
    bg: 'bg-white/95 backdrop-blur-md',
    text: 'text-gray-900',
    logo: 'brightness-100',
    border: 'border-gray-200/50'
  },
  offres: {
    bg: 'bg-orange-500/95 backdrop-blur-md',
    text: 'text-white',
    logo: 'brightness-0 invert',
    border: 'border-orange-400/50'
  },
  services: {
    bg: 'bg-blue-600/95 backdrop-blur-md',
    text: 'text-white',
    logo: 'brightness-0 invert',
    border: 'border-blue-500/50'
  },
  processus: {
    bg: 'bg-green-600/95 backdrop-blur-md',
    text: 'text-white',
    logo: 'brightness-0 invert',
    border: 'border-green-500/50'
  },
  temoignages: {
    bg: 'bg-purple-600/95 backdrop-blur-md',
    text: 'text-white',
    logo: 'brightness-0 invert',
    border: 'border-purple-500/50'
  },
  contact: {
    bg: 'bg-gray-900/95 backdrop-blur-md',
    text: 'text-white',
    logo: 'brightness-0 invert',
    border: 'border-gray-700/50'
  }
};

export function EnhancedHeader() {
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  
  const { t } = useTranslation();
  const { isScrolled } = useScrollPosition();
  
  // Sections à surveiller
  const sections = ['hero', 'offres', 'services', 'processus', 'temoignages', 'contact'];
  const activeSection = useScrollSpy(sections);
  
  // Thème actuel basé sur la section active
  const currentTheme = SECTION_THEMES[activeSection as keyof typeof SECTION_THEMES] || SECTION_THEMES.hero;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      trackEvent('navigation_click', {
        section: id,
        location: 'enhanced_header'
      });
      
      const element = document.getElementById(id);
      if (element) {
        const headerHeight = 80;
        const elementPosition = element['offsetTop'] - headerHeight;
        
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
        
        setIsMenuOpen(false);
        setIsServicesOpen(false);
      }
    }
  };

  const handleWhatsAppClick = () => {
    if (typeof window !== 'undefined') {
      trackEvent('cta_whatsapp_click', {
        context: 'enhanced_header'
      });
      const message = "Bonjour ! Je souhaite découvrir vos offres d'automatisation pour mon business.";
      const whatsappUrl = generateWhatsAppLink(message);
      
      try {
        const url = new URL(whatsappUrl);
        if (url.protocol === 'https:') {
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        }
      } catch (e) {
        console.error('Invalid WhatsApp URL:', e);
      }
    }
  };

  const navigationItems = [
    { id: 'hero', label: 'Accueil', href: '#hero' },
    { id: 'offres', label: 'Nos Offres', href: '#offres' },
    { id: 'services', label: 'Services', href: '#services' },
    { id: 'processus', label: 'Processus', href: '#processus' },
    { id: 'temoignages', label: 'Témoignages', href: '#temoignages' },
    { id: 'contact', label: 'Contact', href: '#contact' }
  ];

  if (!isClient) {
    return null;
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled ? `${currentTheme.bg} border-b ${currentTheme.border} shadow-lg` : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => scrollToSection('hero')}
              className="flex items-center space-x-2 group"
              aria-label="Retour à l'accueil"
            >
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/images/logo.webp"
                  alt="OMA Digital Logo"
                  fill
                  className={`object-contain transition-all duration-500 ${currentTheme.logo}`}
                  priority
                />
              </div>
              <div className={`hidden sm:block transition-colors duration-500 ${currentTheme.text}`}>
                <h1 className="text-xl md:text-2xl font-bold">OMA</h1>
                <p className="text-xs opacity-80">Digital Solutions</p>
              </div>
            </button>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeSection === item.id
                    ? 'bg-white/20 backdrop-blur-sm'
                    : 'hover:bg-white/10'
                } ${currentTheme.text}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <NextI18nLanguageSwitcher />
            
            {/* Contact rapide */}
            <div className="flex items-center space-x-2">
              <a
                href="tel:+212701193811"
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${currentTheme.text}`}
                aria-label="Appeler OMA Digital"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:omasenegal25@gmail.com"
                className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${currentTheme.text}`}
                aria-label="Envoyer un email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            {/* CTA WhatsApp */}
            <button
              onClick={handleWhatsAppClick}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Devis Gratuit</span>
            </button>
          </div>

          {/* Menu Mobile */}
          <div className="lg:hidden flex items-center space-x-2">
            <NextI18nLanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${currentTheme.text}`}
              aria-label="Menu de navigation"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMenuOpen && (
          <div className={`lg:hidden absolute top-full left-0 right-0 ${currentTheme.bg} border-t ${currentTheme.border} shadow-lg`}>
            <div className="px-4 py-6 space-y-4">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                    activeSection === item.id
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'hover:bg-white/10'
                  } ${currentTheme.text}`}
                >
                  {item.label}
                </button>
              ))}
              
              {/* Actions Mobile */}
              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <a
                    href="tel:+212701193811"
                    className={`p-3 rounded-lg hover:bg-white/10 transition-colors ${currentTheme.text}`}
                    aria-label="Appeler"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                  <a
                    href="mailto:omasenegal25@gmail.com"
                    className={`p-3 rounded-lg hover:bg-white/10 transition-colors ${currentTheme.text}`}
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
                
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Devis Gratuit WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Indicateur de section active */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </header>
  );
}