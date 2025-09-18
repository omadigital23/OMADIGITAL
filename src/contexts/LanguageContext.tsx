import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lng: string) => void;
  languages: Array<{ code: string; name: string; flag: string }>;
  forceUpdate: number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'fr');
  const [forceUpdate, setForceUpdate] = useState(0);

  // After mount, detect preferred language from localStorage, cookie, or navigator
  useEffect(() => {
    // Ensure we run on client only
    if (typeof window === 'undefined') return;

    const detectPreferred = (): string | null => {
      try {
        const qs = new URLSearchParams(window.location.search);
        const fromQuery = qs.get('lng');
        if (fromQuery) return fromQuery;

        const fromLocal = window.localStorage?.getItem('i18nextLng');
        if (fromLocal) return fromLocal;

        const fromCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('i18next='))?.split('=')[1];
        if (fromCookie) return fromCookie;

        const nav = navigator.language?.split('-')[0];
        if (nav) return nav;
      } catch {}
      return null;
    };

    const preferred = detectPreferred();
    if (preferred && preferred !== i18n.language) {
      // change after hydration to avoid mismatch
      i18n.changeLanguage(preferred).then(() => {
        setCurrentLanguage(preferred);
        setForceUpdate((prev) => prev + 1);
        try {
          if (typeof document !== 'undefined') {
            document.documentElement.lang = preferred;
          }
        } catch {}
      });
    }
  }, [i18n]);
  
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      setForceUpdate(prev => prev + 1);
      // Update <html lang> for accessibility/SEO
      try {
        if (typeof document !== 'undefined') {
          document.documentElement.lang = lng;
        }
      } catch {}
      // Force re-render of all components
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('languageChanged'));
        }
      }, 100);
    };
    
    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);
  
  const changeLanguage = async (lng: string) => {
    // Persist selection
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.setItem('i18nextLng', lng);
        document.cookie = `i18next=${lng}; path=/; SameSite=Strict`;
      }
    } catch {}

    await i18n.changeLanguage(lng);
    setCurrentLanguage(lng);
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