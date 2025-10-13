import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lng: string) => void;
  languages: Array<{ code: string; name: string; flag: string }>;
  forceUpdate: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const router = useRouter();
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Use router.locale as the source of truth for current language
  const currentLanguage = router.locale || i18n.language || 'fr';

  // After mount, detect preferred language from localStorage, cookie, or navigator
  useEffect(() => {
    // Ensure we run on client only
    if (typeof window === 'undefined') return;

    // next-i18next handles language detection, so we just need to update the document language
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = router.locale || i18n.language || 'fr';
      }
    } catch {}
  }, [i18n, router]);
  
  useEffect(() => {
    const handleLanguageChange = () => {
      setForceUpdate(prev => prev + 1);
      // Update <html lang> for accessibility/SEO
      try {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = router.locale || i18n.language || 'fr';
        }
      } catch {}
      // Force re-render of all components
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('languageChanged'));
        }
      }, 100);
    };
    
    // Listen for router events for language changes
    const handleRouteChange = () => {
      handleLanguageChange();
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, i18n]);
  
  const changeLanguage = async (lng: string) => {
    // Persist selection
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('i18nextLng', lng);
        document.cookie = `i18next=${lng}; path=/; SameSite=Strict`;
      }
    } catch {}

    // Use router.push instead of i18n.changeLanguage for next-i18next
    await router.push(router.asPath, router.asPath, { locale: lng });
    setForceUpdate(prev => prev + 1);
    try {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lng;
      }
    } catch {}
  };

  
  // Available languages with their display names
  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];
  
  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, languages, forceUpdate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}