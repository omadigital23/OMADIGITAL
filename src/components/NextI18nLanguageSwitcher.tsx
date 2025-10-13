import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Languages, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  isMobile?: boolean;
  isScrolled?: boolean;
}

export function NextI18nLanguageSwitcher({ isMobile = false, isScrolled = false }: LanguageSwitcherProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<string>(router.locale || router.defaultLocale || 'fr');
  
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷', short: 'FR' },
    { code: 'en', name: 'English', flag: '🇬🇧', short: 'EN' }
  ];
  
  // Update current locale when router.locale changes
  useEffect(() => {
    setCurrentLocale(router.locale || router.defaultLocale || 'fr');
  }, [router.locale, router.defaultLocale]);
  
  // Persist language choice
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', router.locale || router.defaultLocale || 'fr');
    }
  }, [router.locale, router.defaultLocale]);
  
  const changeLanguage = async (locale: string) => {
    try {
      setIsOpen(false);
      // Use Next.js router for proper i18n routing
      await router.push(router.asPath, router.asPath, { locale });
    } catch (error) {
      console.error('Error changing language:', error);
      // Fallback to page reload if router fails
      const currentPath = router.asPath === '/' ? '' : router.asPath;
      window.location.href = `/${locale}${currentPath}`;
    }
  };
  
  const currentLang = languages.find(lang => lang.code === currentLocale) || languages[0];
  
  // Mobile version
  if (isMobile) {
    return (
      <div className="w-full">
        <div className="px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wide">
          Langue
        </div>
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors ${
              currentLocale === language.code 
                ? 'bg-orange-50 text-orange-600 font-medium border-l-4 border-orange-500' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {currentLocale === language.code && (
              <span className="ml-auto text-orange-500">✓</span>
            )}
          </button>
        ))}
      </div>
    );
  }
  
  // Desktop version
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 min-w-[44px] ${
          isScrolled 
            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
        aria-label="Changer de langue"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span className="hidden lg:inline font-medium">{currentLang.short}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>
      
      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`w-full text-left px-4 py-3 text-sm flex items-center space-x-3 transition-colors ${
                  currentLocale === language.code 
                    ? 'bg-orange-50 text-orange-600 font-medium' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {currentLocale === language.code && (
                  <span className="ml-auto text-orange-500 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}