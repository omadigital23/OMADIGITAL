import React from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import { NextI18nLanguageSwitcher } from '../src/components/NextI18nLanguageSwitcher';

export default function About() {
  const { t } = useTranslation('about');

  return (
    <>
      <Head>
        <title>Mentions Légales - OMA Digital | Solutions IA & Sites Web au Sénégal & Maroc</title>
        <meta name="description" content="OMA Digital transforme les PME africaines avec des solutions d'automatisation IA, sites web ultra-rapides, app mobile et chatbots intelligents au Sénégal et Maroc." />
        <meta name="keywords" content="OMA Digital, automatisation IA Sénégal, sites web Maroc, chatbots intelligents, app mobile Afrique, PME digitales, solutions IA Dakar, développement web Casablanca" />
        <link rel="canonical" href="https://omadigital.net/about" />
        <meta property="og:title" content="Mentions Légales - OMA Digital | Solutions IA & Sites Web" />
        <meta property="og:description" content="OMA Digital transforme les PME africaines avec des solutions d'automatisation IA, sites web ultra-rapides, app mobile et chatbots intelligents." />
        <meta property="og:url" content="https://omadigital.net/about" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Mentions Légales - OMA Digital" />
        <meta name="twitter:description" content="Solutions d'automatisation IA, sites web ultra-rapides et chatbots intelligents pour PME africaines." />
      </Head>
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
                      {t('mentions_legales')}
                    </h1>
                    <p className="mt-2 text-orange-100">
                      {t('last_updated', { date: 'August 09, 2016' })}
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
                      {t('editorial_identity')}
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('company_info')}
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                          <li><span className="font-medium">{t('company_name')}:</span> {t('company_name_value')}</li>
                          <li><span className="font-medium">{t('legal_form')}:</span> {t('sarl_full')}</li>
                          <li><span className="font-medium">{t('capital')}:</span> {t('capital_value')}</li>
                          <li><span className="font-medium">{t('rc_number')}:</span> {t('rc_number_value')}</li>
                          <li><span className="font-medium">{t('ninea')}:</span> {t('ninea_value')}</li>
                          <li><span className="font-medium">{t('creation_date')}:</span> {t('creation_date_value')}</li>
                          <li><span className="font-medium">{t('registration_date')}:</span> {t('registration_date_value')}</li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('contact_info')}
                        </h3>
                        <ul className="space-y-2 text-gray-700">
                          <li><span className="font-medium">{t('address')}:</span> {t('address_value')}</li>
                          <li><span className="font-medium">{t('phone')}:</span> {t('phone_value')}</li>
                          <li><span className="font-medium">{t('email')}:</span> {t('email_value')}</li>
                          <li><span className="font-medium">{t('website')}:</span> {t('website_value')}</li>
                        </ul>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('tax_info')}
                    </h2>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        {t('fiscal_info')}
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li><span className="font-medium">{t('tax_center')}:</span> {t('tax_center_value')}</li>
                        <li><span className="font-medium">{t('control')}:</span> {t('control_value')}</li>
                        <li><span className="font-medium">{t('main_activity')}:</span> {t('main_activity_value')}</li>
                        <li><span className="font-medium">{t('stamp_duty')}:</span> {t('stamp_duty_value')}</li>
                      </ul>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('official_registration')}
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('republic_of_senegal')}
                        </h3>
                        <p className="text-gray-700 mb-4">
                          {t('ministry_of_economy')}
                        </p>
                        <div className="border-l-4 border-orange-500 pl-4 py-2">
                          <p className="text-gray-700 italic">
                            {t('decree_info')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('ninea_registration')}
                        </h3>
                        <p className="text-gray-700">
                          {t('ninea_explanation')}
                        </p>
                        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-gray-700">
                            {t('ninea_requirement')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('statistical_service')}
                    </h2>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        {t('regional_statistical_service')}
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li><span className="font-medium">{t('address')}:</span> {t('statistical_address_value')}</li>
                        <li><span className="font-medium">{t('phone')}:</span> {t('statistical_phone_value')}</li>
                        <li><span className="font-medium">{t('fax')}:</span> {t('fax_value')}</li>
                      </ul>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('hosting')}
                    </h2>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        {t('hosting_provider')}
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li><span className="font-medium">{t('company_name')}:</span> {t('hosting_company_name')}</li>
                        <li><span className="font-medium">{t('address')}:</span> {t('hosting_address')}</li>
                        <li><span className="font-medium">{t('website')}:</span> {t('hosting_website')}</li>
                      </ul>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('intellectual_property')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('copyright_notice')}
                      </p>
                      <p>
                        {t('all_rights_reserved')}
                      </p>
                      <p>
                        {t('trademarks')}
                      </p>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('responsibility_limitation')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('content_accuracy')}
                      </p>
                      <p>
                        {t('external_links')}
                      </p>
                      <p>
                        {t('technical_issues')}
                      </p>
                    </div>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('applicable_law')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('senegalese_law')}
                      </p>
                      <p>
                        {t('dispute_resolution')}
                      </p>
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
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['about'])),
    },
  };
};