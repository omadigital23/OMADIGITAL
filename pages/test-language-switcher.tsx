import React from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '../src/components/Header';
import { FloatingLanguageSwitcher } from '../src/components/FloatingLanguageSwitcher';
import { LanguageSwitcher } from '../src/components/LanguageSwitcher';

export default function TestLanguageSwitcher() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FloatingLanguageSwitcher />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t('test.page_title')}
          </h1>
          
          <p className="text-lg text-gray-700 mb-6">
            {t('test.page_description')}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-orange-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-orange-800 mb-3">
                {t('test.section1_title')}
              </h2>
              <p className="text-gray-700">
                {t('test.section1_content')}
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">
                {t('test.section2_title')}
              </h2>
              <p className="text-gray-700">
                {t('test.section2_content')}
              </p>
            </div>
          </div>
          
          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('test.language_switcher_demo')}
            </h2>
            <p className="text-gray-700 mb-4">
              {t('test.switcher_explanation')}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-2">{t('test.header_switcher')}</p>
                <div className="border border-gray-200 rounded p-2">
                  <LanguageSwitcher />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-2">{t('test.floating_switcher')}</p>
                <p className="text-gray-500 text-sm">{t('test.floating_note')}</p>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              {t('test.back_to_home')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add translations for this test page
// In a real implementation, these would be added to the i18n.ts file