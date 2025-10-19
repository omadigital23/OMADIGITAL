import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import { NextI18nLanguageSwitcher } from '../src/components/NextI18nLanguageSwitcher';

export default function TermsConditions() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col legal-page">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-gray-50 to-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-22 shadow-xl overflow-hidden">
              <div className="bg-orange-500 px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      {t('general_terms')}
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
                      {t('acceptance_of_terms')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('terms_acceptance')}
                      </p>
                      <p>
                        {t('terms_modification')}
                      </p>
                      <p>
                        {t('terms_acceptance_contractual')}
                      </p>
                      <p>
                        {t('terms_acceptance_scope')}
                      </p>
                      <p>
                        {t('terms_modification_details')}
                      </p>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('services_description')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('services_overview')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('main_services')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('whatsapp_automation')}</li>
                          <li>{t('website_development')}</li>
                          <li>{t('branding_services')}</li>
                          <li>{t('analytics_solutions')}</li>
                          <li>{t('ai_assistant')}</li>
                          <li>{t('security_solutions')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('whatsapp_automation_desc')}
                          </p>
                          <p>
                            {t('website_development_desc')}
                          </p>
                          <p>
                            {t('branding_services_desc')}
                          </p>
                          <p>
                            {t('analytics_solutions_desc')}
                          </p>
                          <p>
                            {t('ai_assistant_desc')}
                          </p>
                          <p>
                            {t('security_solutions_desc')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('continuous_innovation')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('continuous_innovation_desc')}
                          </p>
                          <p>
                            {t('african_collaboration_desc')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('user_obligations')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('user_responsibilities')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('user_commitments')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('accurate_information')}</li>
                          <li>{t('law_compliance')}</li>
                          <li>{t('proper_use')}</li>
                          <li>{t('security_measures')}</li>
                          <li>{t('cooperation')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('accurate_information_desc')}
                          </p>
                          <p>
                            {t('law_compliance_desc')}
                          </p>
                          <p>
                            {t('proper_use_desc')}
                          </p>
                          <p>
                            {t('security_measures_desc')}
                          </p>
                          <p>
                            {t('cooperation_desc')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('specific_prohibitions')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('specific_prohibitions_desc1')}
                          </p>
                          <p>
                            {t('specific_prohibitions_desc2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('pricing_payment')}
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('pricing_policy')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('quotes')}</li>
                          <li>{t('price_changes')}</li>
                          <li>{t('taxes')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('pricing_policy_details1')}
                          </p>
                          <p>
                            {t('pricing_policy_details2')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-33">
                          {t('payment_terms')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('payment_methods')}</li>
                          <li>{t('payment_deadlines')}</li>
                          <li>{t('late_payment')}</li>
                          <li>{t('refunds')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('payment_terms_details1')}
                          </p>
                          <p>
                            {t('payment_terms_details2')}
                          </p>
                          <p>
                            {t('payment_terms_details3')}
                          </p>
                          <p>
                            {t('payment_terms_details4')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('special_payment_terms')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('special_payment_terms_desc1')}
                          </p>
                          <p>
                            {t('special_payment_terms_desc2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('intellectual_property')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('ip_rights')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('ownership')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('our_ip')}</li>
                          <li>{t('your_ip')}</li>
                          <li>{t('license_grant')}</li>
                          <li>{t('restrictions')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('ip_our_property')}
                          </p>
                          <p>
                            {t('ip_your_property')}
                          </p>
                          <p>
                            {t('license_grant_details')}
                          </p>
                          <p>
                            {t('ip_restrictions')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('client_protection')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('client_protection_desc1')}
                          </p>
                          <p>
                            {t('client_protection_desc2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('liability_limitations')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('liability_disclaimer')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('limitations')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('service_availability')}</li>
                          <li>{t('result_guarantees')}</li>
                          <li>{t('indirect_damages')}</li>
                          <li>{t('force_majeure')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            Service availability is guaranteed at 99.9% according to our SLA (Service Level Agreement), which means we commit to keeping our services operational 99.9% of the time over a calendar year. This availability is measured on a monthly basis and excludes scheduled maintenance periods, service interruptions caused by third parties (internet service providers, hosting providers, etc.) and force majeure events. In the event of exceeding this threshold, compensation may be applied according to the terms defined in the SLA.
                          </p>
                          <p>
                            The absence of result guarantees reflects the complex and multivariate nature of digital transformation projects. While we commit to providing services of the highest quality and using all necessary skills to achieve your objectives, we cannot guarantee specific results that depend on many factors beyond our control. These factors include your team's engagement, market conditions, end-user behaviors, and technological evolution.
                          </p>
                          <p>
                            The exclusion of indirect damages aims to limit our liability to only direct and foreseeable damages arising from the execution of our services. We shall not be held responsible for loss of revenue, loss of customers, damage to brand image, loss of business opportunities, or other indirect damages, even if we have been informed of the possibility of such damages. This limitation is proportionate and reasonable given the nature of our services.
                          </p>
                          <p>
                            Force majeure and external events are exceptional circumstances that may affect our ability to provide our services. We will not be responsible for delays or inability to provide our services in the event of force majeure, strikes, natural disasters, war, riots, pandemics, government restrictions, prolonged power outages, cyberattacks, or other unforeseeable and unavoidable events. In such cases, we will make our best efforts to minimize the impact on your business and keep you informed of the situation's evolution.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('specific_liability_limitations')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('specific_liability_limitations_details1')}
                          </p>
                          <p>
                            {t('specific_liability_limitations_details2')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('specific_liability_limits_title')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            Our total liability, cumulative for all damages, losses and causes of action, shall in no event exceed the total amount paid by you for the services during the twelve (12) months immediately preceding the claim. This limitation applies regardless of the basis of the claim, whether contractual, tortious (including negligence), strict liability or otherwise, and even if we have been informed of the possibility of such damages.
                          </p>
                          <p>
                            Some jurisdictions do not permit the exclusion or limitation of indirect or consequential damages, or the limitation of liability set forth above. To such extent, our liability shall be limited or excluded to the maximum extent permitted by law. Nothing in these general terms aims to exclude or limit our liability in the event of death or bodily injury caused by our negligence, or in the event of fraud or willful misconduct.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('duration_termination')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('contract_duration')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('termination')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('termination_by_user')}</li>
                          <li>{t('termination_by_us')}</li>
                          <li>{t('consequences')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            Termination by the user with 30 days' notice is an option available to end your contractual relationship with OMA Digital. To exercise this right, you must notify us in writing of your intention to terminate by email to the contractual address or by registered mail with return receipt. Termination will take effect at the expiration of the notice period, provided that all financial obligations to you have been honored.
                          </p>
                          <p>
                            Termination by OMA Digital for legitimate reason may occur in several circumstances, including persistent non-payment, serious violation of these general terms, abusive use of our services, behavior harmful to our reputation or that of our other clients, or non-compliance with essential contractual obligations. We will notify you in writing of the reasons for termination and give you a reasonable time to remedy the situation, except in serious cases where immediate termination is justified.
                          </p>
                          <p>
                            The consequences of termination include payment for services rendered up to the termination date, cessation of access to our services, and restitution of intellectual property elements in accordance with the contract provisions. Confidentiality obligations, liability limitations, and other perpetual clauses will continue to apply after termination. Any unpaid amounts as of the termination date will become immediately due.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('termination_procedures')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('termination_procedures_details1')}
                          </p>
                          <p>
                            {t('termination_procedures_details2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('confidentiality')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('confidentiality_obligation')}
                      </p>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('confidentiality_scope')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('confidentiality_scope_details1')}
                          </p>
                          <p>
                            {t('confidentiality_scope_details2')}
                          </p>
                          <p>
                            {t('confidentiality_scope_details3')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('confidentiality_exceptions')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('confidentiality_exceptions_details1')}
                          </p>
                          <p>
                            {t('confidentiality_exceptions_details2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('dispute_resolution')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('dispute_process')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('applicable_law')}
                        </h3>
                        <p className="text-gray-700">
                          {t('senegalese_law')}
                        </p>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('dispute_resolution_intro')}
                          </p>
                          <p>
                            {t('negotiations_details')}
                          </p>
                          <p>
                            {t('applicable_law_details')}
                          </p>
                          <p>
                            {t('international_clients')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('amicable_resolution')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('amicable_resolution_desc1')}
                          </p>
                          <p>
                            {t('amicable_resolution_desc2')}
                          </p>
                          <p>
                            {t('amicable_resolution_desc3')}
                          </p>
                          <p>
                            {t('amicable_resolution_desc4')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('mediation_arbitration')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('mediation_arbitration_desc1')}
                          </p>
                          <p>
                            {t('mediation_arbitration_desc2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('contact_information')}
                    </h2>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        {t('official_contact')}
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li><span className="font-medium">{t('company_name')}:</span> {t('company_name_value')}</li>
                        <li><span className="font-medium">{t('address')}:</span> {t('address_value')}</li>
                        <li><span className="font-medium">{t('email')}:</span> {t('contact_email')}</li>
                        <li><span className="font-medium">{t('phone')}:</span> {t('phone_value')}</li>
                      </ul>
                      <div className="mt-4 space-y-3 text-gray-700">
                        <p>
                          {t('contact_information_details1')}
                        </p>
                        <p>
                          {t('contact_information_details2')}
                        </p>
                        <p>
                          {t('contact_information_details3')}
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
      ...(await serverSideTranslations(locale ?? 'en', ['common', 'legal'])),
    },
  };
};