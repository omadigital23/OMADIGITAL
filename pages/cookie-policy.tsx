import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import { NextI18nLanguageSwitcher } from '../src/components/NextI18nLanguageSwitcher';

export default function CookiePolicy() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col legal-page">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-gray-50 to-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-orange-500 px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      {t('cookies_policy')}
                    </h1>
                    <p className="mt-2 text-orange-100">
                      {t('last_updated', { date: 'January 01, 2025' })}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <NextI18nLanguageSwitcher />
                  </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <div className="prose prose-orange max-w-none">
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('cookies_introduction')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('cookies_intro_desc')}
                      </p>
                      <p>
                        {t('cookies_consent')}
                      </p>
                      <p>
                        {t('cookies_policy_intro')}
                      </p>
                      <div className="mt-4 space-y-3 text-gray-700">
                        <p>
                          {t('cookies_intro_details1')}
                        </p>
                        <p>
                          {t('cookies_intro_details2')}
                        </p>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('what_are_cookies')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('what_are_cookies_details1')}
                      </p>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('cookies_technical_functioning')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('cookies_technical_functioning_p1')}
                          </p>
                          <p>
                            {t('cookies_technical_functioning_p2')}
                          </p>
                          <p>
                            {t('cookies_technical_functioning_p3')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('tracking_technologies_types')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('tracking_technologies_types_p1')}
                          </p>
                          <p>
                            {t('tracking_technologies_types_p2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('cookies_we_use')}
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('essential_cookies')}
                        </h3>
                        <div className="space-y-2 text-gray-700">
                          <p><span className="font-medium">{t('purpose')}:</span> {t('essential_purpose')}</p>
                          <p><span className="font-medium">{t('retention')}:</span> {t('session_duration')}</p>
                          <p><span className="font-medium">{t('provider')}:</span> {t('first_party')}</p>
                        </div>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('essential_cookies_details')}
                          </p>
                          <p>
                            {t('essential_cookies_details2')}
                          </p>
                          <p>
                            {t('essential_cookies_details3')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('performance_cookies')}
                        </h3>
                        <div className="space-y-2 text-gray-700">
                          <p><span className="font-medium">{t('purpose')}:</span> {t('performance_purpose')}</p>
                          <p><span className="font-medium">{t('retention')}:</span> {t('performance_duration')}</p>
                          <p><span className="font-medium">{t('provider')}:</span> {t('third_party')}</p>
                        </div>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('performance_cookies_details')}
                          </p>
                          <p>
                            {t('performance_cookies_details2')}
                          </p>
                          <p>
                            {t('performance_cookies_details3')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('functionality_cookies')}
                        </h3>
                        <div className="space-y-2 text-gray-700">
                          <p><span className="font-medium">{t('purpose')}:</span> {t('functionality_purpose')}</p>
                          <p><span className="font-medium">{t('retention')}:</span> {t('functionality_duration')}</p>
                          <p><span className="font-medium">{t('provider')}:</span> {t('first_party')}</p>
                        </div>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('cookies_functionality_details1')}
                          </p>
                          <p>
                            {t('cookies_functionality_details2')}
                          </p>
                          <p>
                            {t('cookies_functionality_details3')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('marketing_cookies')}
                        </h3>
                        <div className="space-y-2 text-gray-700">
                          <p><span className="font-medium">{t('purpose')}:</span> {t('marketing_purpose')}</p>
                          <p><span className="font-medium">{t('retention')}:</span> {t('marketing_duration')}</p>
                          <p><span className="font-medium">{t('provider')}:</span> {t('third_party')}</p>
                        </div>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('marketing_cookies_details')}
                          </p>
                          <p>
                            {t('marketing_cookies_details2')}
                          </p>
                          <p>
                            {t('marketing_cookies_details3')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('third_party_cookies')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('third_party_desc')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('analytics_services')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>Google Analytics</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('third_party_services_details1')}
                          </p>
                          <p>
                            {t('third_party_services_details2')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('third_party_management')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('third_party_management_details1')}
                          </p>
                          <p>
                            {t('third_party_management_details2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('cookie_management')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('cookie_management_desc')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('how_to_manage')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('browser_settings')}</li>
                          <li>{t('cookie_banner')}</li>
                          <li>{t('third_party_tools')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('cookie_management_options_details1')}
                          </p>
                          <p>
                            {t('cookie_management_options_details2')}
                          </p>
                          <p>
                            {t('cookie_management_options_details3')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('recommended_settings')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('recommended_settings_details1')}
                          </p>
                          <p>
                            {t('recommended_settings_details2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('changes_to_policy')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('policy_updates')}
                      </p>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('update_process')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('update_process_details1')}
                          </p>
                          <p>
                            {t('update_process_details2')}
                          </p>
                          <p>
                            {t('update_process_details3')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('update_communication')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('update_communication_details1')}
                          </p>
                          <p>
                            {t('update_communication_details2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('contact_us')}
                    </h2>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        {t('cookie_questions')}
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li><span className="font-medium">{t('email')}:</span> {t('privacy_email')}</li>
                        <li><span className="font-medium">{t('address')}:</span> {t('address_value')}</li>
                        <li><span className="font-medium">{t('phone')}:</span> {t('phone_value')}</li>
                      </ul>
                      <div className="mt-4 space-y-3 text-gray-700">
                        <p>
                          {t('contact_details1')}
                        </p>
                        <p>
                          {t('contact_details2')}
                        </p>
                        <p>
                          {t('contact_details3')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        {t('additional_resources')}
                      </h3>
                      <div className="space-y-3 text-gray-700">
                        <p>
                          {t('additional_resources_details')}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['legal'])),
    },
  };
};