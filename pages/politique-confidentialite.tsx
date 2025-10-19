import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import { NextI18nLanguageSwitcher } from '../src/components/NextI18nLanguageSwitcher';

export default function PolitiqueConfidentialite() {
  const { t } = useTranslation('legal');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-28">
        <div className="bg-gradient-to-br from-gray-50 to-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-orange-500 px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      {t('privacy_policy')}
                    </h1>
                    <p className="mt-2 text-orange-100">
                      {t('last_updated', { date: '01 Janvier 2025' })}
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
                      {t('introduction')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('privacy_intro')}
                      </p>
                      <p>
                        {t('privacy_commitment')}
                      </p>
                      <p>
                        {t('privacy_policy_details1')}
                      </p>
                      <p>
                        {t('privacy_policy_details2')}
                      </p>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('data_collection')}
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-4 text-gray-700">
                        <p>
                          {t('data_collection_details1')}
                        </p>
                        <p>
                          {t('data_collection_details2')}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('personal_data_collected')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('identification_data')}</li>
                          <li>{t('contact_info')}</li>
                          <li>{t('professional_info')}</li>
                          <li>{t('navigation_data')}</li>
                          <li>{t('communication_data')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('identification_data_details')}
                          </p>
                          <p>
                            {t('contact_info_details')}
                          </p>
                          <p>
                            {t('professional_info_details')}
                          </p>
                          <p>
                            {t('navigation_data_details')}
                          </p>
                          <p>
                            {t('communication_data_details')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('collection_methods')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('direct_collection')}</li>
                          <li>{t('automatic_collection')}</li>
                          <li>{t('third_party_collection')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('direct_collection_details')}
                          </p>
                          <p>
                            {t('automatic_collection_details')}
                          </p>
                          <p>
                            {t('third_party_collection_details')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('data_usage')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('data_usage_purpose')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('usage_purposes')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('service_provision')}</li>
                          <li>{t('communication')}</li>
                          <li>{t('commercial_purposes')}</li>
                          <li>{t('analytics')}</li>
                          <li>{t('legal_compliance')}</li>
                          <li>{t('security')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('data_usage_main_purpose')}
                          </p>
                          <p>
                            {t('data_usage_communication')}
                          </p>
                          <p>
                            {t('data_usage_commercial')}
                          </p>
                          <p>
                            {t('data_usage_analytics')}
                          </p>
                          <p>
                            {t('data_usage_legal')}
                          </p>
                          <p>
                            {t('data_usage_security')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('data_sharing')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('data_sharing_policy')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('third_parties')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('service_providers')}</li>
                          <li>{t('legal_obligations')}</li>
                          <li>{t('business_transfers')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('data_sharing_providers')}
                          </p>
                          <p>
                            {t('data_sharing_legal')}
                          </p>
                          <p>
                            {t('data_sharing_business')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('data_security')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('security_measures')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('security_practices')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('encryption')}</li>
                          <li>{t('access_control')}</li>
                          <li>{t('backup_procedures')}</li>
                          <li>{t('audit_trails')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('security_encryption')}
                          </p>
                          <p>
                            {t('security_access_control')}
                          </p>
                          <p>
                            {t('security_backup')}
                          </p>
                          <p>
                            {t('security_audit')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('your_rights')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('rights_description')}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('access_right')}
                          </h3>
                          <p className="text-gray-700">
                            {t('access_right_desc')}
                          </p>
                          <div className="mt-3 text-gray-700">
                            <p>
                              {t('access_right_details')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('rectification_right')}
                          </h3>
                          <p className="text-gray-700">
                            {t('rectification_right_desc')}
                          </p>
                          <div className="mt-3 text-gray-700">
                            <p>
                              {t('rectification_right_details')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('deletion_right')}
                          </h3>
                          <p className="text-gray-700">
                            {t('deletion_right_desc')}
                          </p>
                          <div className="mt-3 text-gray-700">
                            <p>
                              {t('deletion_right_details')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('portability_right')}
                          </h3>
                          <p className="text-gray-700">
                            {t('portability_right_desc')}
                          </p>
                          <div className="mt-3 text-gray-700">
                            <p>
                              {t('portability_right_details')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('exercising_rights')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('exercising_rights_details1')}
                          </p>
                          <p>
                            {t('exercising_rights_details2')}
                          </p>
                          <p>
                            {t('exercising_rights_details3')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('cookies_policy')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('cookies_description')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('cookie_types')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('necessary_cookies')}</li>
                          <li>{t('performance_cookies')}</li>
                          <li>{t('functionality_cookies')}</li>
                          <li>{t('marketing_cookies')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('necessary_cookies_details')}
                          </p>
                          <p>
                            {t('performance_cookies_details')}
                          </p>
                          <p>
                            {t('functionality_cookies_details')}
                          </p>
                          <p>
                            {t('marketing_cookies_details')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('cookie_management_title')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('cookie_management_details1')}
                          </p>
                          <p>
                            {t('cookie_management_details2')}
                          </p>
                          <p>
                            {t('cookie_management_details3')}
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
                        {t('dpo_contact')}
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>{t('dpo_contact_details1')}</li>
                        <li>{t('dpo_contact_details2')}</li>
                        <li>{t('dpo_contact_details3')}</li>
                      </ul>
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
      ...(await serverSideTranslations(locale ?? 'fr', ['common', 'legal'])),
    },
  };
};