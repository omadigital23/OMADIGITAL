import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  
  // Find current language
  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];
  
  return (
    <div className="relative group">
      <button 
        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Changer de langue"
      >
        <Languages className="w-5 h-5" />
        <span className="hidden md:inline">{currentLang.flag} {currentLang.name}</span>
      </button>
      
      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${
              currentLanguage === language.code 
                ? 'bg-orange-50 text-orange-600 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}