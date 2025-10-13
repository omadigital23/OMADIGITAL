import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import { NextI18nLanguageSwitcher } from '../src/components/NextI18nLanguageSwitcher';

export default function GDPRCompliance() {
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
                      {t('gdpr_policy')}
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
                      {t('gdpr_compliance')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('gdpr_commitment')}
                      </p>
                      <p>
                        {t('gdpr_scope')}
                      </p>
                      <p>
                        {t('gdpr_policy_intro')}
                      </p>
                      <div className="space-y-4 text-gray-700">
                        <p>
                          {t('gdpr_commitment_details1')}
                        </p>
                        <p>
                          {t('gdpr_commitment_details2')}
                        </p>
                      </div>
                      <p>
                        {t('gdpr_proactive_approach')}
                      </p>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('data_controller')}
                    </h2>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        {t('controller_info')}
                      </h3>
                      <ul className="space-y-2 text-gray-700">
                        <li><span className="font-medium">{t('director')}:</span> {t('director_name')}</li>
                        <li>{t('dpo_contact_details3')}</li>
                        <li>{t('dpo_contact_details2')}</li>
                        <li>{t('dpo_contact_details1')}</li>
                      </ul>
                      <div className="mt-4 space-y-3 text-gray-700">
                        <p>
                          As a data controller, OMA Digital determines the purposes and means of processing personal data within the scope of our activities. This responsibility implies a strong commitment to data protection and the implementation of appropriate measures to ensure the security, confidentiality, and compliance of all data processing we carry out.
                        </p>
                        <p>
                          Papa Amadou Fall, as the main contact for data protection matters, is responsible for overseeing our GDPR compliance, processing data subject requests, and serving as the point of contact with supervisory authorities. He has the authority necessary to make decisions regarding data protection and to allocate appropriate resources to implement our obligations under the GDPR.
                        </p>
                        <p>
                          Our organization has a clear data governance structure, with well-defined responsibilities at all levels. Departments involved in personal data processing have designated data protection representatives to ensure consistent implementation of policies and procedures. This decentralized approach allows us to guarantee that data protection is integrated into all company processes.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        Organizational Commitment
                      </h3>
                      <div className="space-y-3 text-gray-700">
                        <p>
                          Our commitment to data protection extends throughout our organization, from senior management to operational teams. We have implemented a regular training program for all employees involved in personal data processing, to ensure a thorough understanding of GDPR obligations and best practices in data protection.
                        </p>
                        <p>
                          Company leadership actively supports our compliance approach by allocating necessary resources, participating in compliance assessments, and ensuring that data protection is integrated into all strategic decisions. This leadership involvement guarantees that data protection remains a constant priority in our operations.
                        </p>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('legal_basis')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('legal_basis_description')}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('contract_performance')}
                          </h3>
                          <p className="text-gray-700">
                            {t('contract_performance_desc')}
                          </p>
                          <div className="mt-3 text-gray-700">
                            <p>
                              Contract performance is the main legal basis for processing your personal data in the context of our business relationship. This legal basis applies when processing is necessary for providing the services you have contracted with OMA Digital, managing your customer account, billing, and monitoring the contractual relationship.
                            </p>
                            <p>
                              Data processed on this basis includes your identification information, contact details, order details, payment information, history of services provided, and communications related to contract execution. This processing is strictly limited to contractual purposes and does not extend to other uses without appropriate legal basis.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('legitimate_interest')}
                          </h3>
                          <p className="text-gray-700">
                            {t('legitimate_interest_desc')}
                          </p>
                          <div className="mt-3 text-gray-700">
                            <p>
                              Legitimate interest allows us to process your personal data for purposes that are necessary for our business activities and that do not disproportionately infringe upon your rights and freedoms. We conduct a systematic impact analysis for each processing activity based on legitimate interest, to ensure that our interests are legitimate and that processing is proportionate.
                            </p>
                            <p>
                              Examples of using this legal basis include fraud prevention, system security, aggregated statistical analysis, service improvement, complaint management, and proactive communication regarding our services. In each case, we ensure that your legitimate interests are respected and that you have the opportunity to object to these processing activities.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('consent')}
                          </h3>
                          <p className="text-gray-700">
                            {t('consent_desc')}
                          </p>
                          <div className="mt-3 text-gray-700">
                            <p>
                              Your explicit consent is required for certain specific processing of your personal data, notably for commercial prospecting, sending newsletters, using non-essential cookies, and any other activity for which consent is the appropriate legal basis. We ensure that your consent is free, specific, informed, and unambiguous.
                            </p>
                            <p>
                              Consent is obtained through clear and transparent means, with detailed information about processing purposes, data retention periods, and your rights. You can withdraw your consent at any time, without affecting the lawfulness of processing carried out before withdrawal. Withdrawal of consent does not affect the lawfulness of other processing based on different legal bases.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('legal_obligation')}
                          </h3>
                          <p className="text-gray-700">
                            {t('legal_obligation_desc')}
                          </p>
                          <div className="mt-3 text-gray-700">
                            <p>
                              Compliance with our legal obligations requires us to process certain of your personal data to comply with applicable laws and regulations. This legal basis applies to processing necessary to satisfy legal, regulatory, or fiscal requirements, as well as obligations arising from judicial decisions or instructions from competent authorities.
                            </p>
                            <p>
                              Examples include retaining accounting documents for required legal periods, responding to judicial authority requests, implementing anti-money laundering measures, retaining information for regulatory audits, and cooperating with supervisory authorities. These processing activities are strictly limited to specific legal requirements and the duration necessary for their fulfillment.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          Documentation of Legal Bases
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            We maintain detailed documentation of all legal bases applied to our data processing, with precise justification for each chosen basis. This documentation is regularly updated and subject to internal audits to ensure its compliance and accuracy. It constitutes an essential reference for our team and for compliance audits.
                          </p>
                          <p>
                            When multiple legal bases could apply to the same processing, we choose the one that is most appropriate and best adapted to the purposes pursued. We avoid using consent as a legal basis when other more appropriate bases are available, in order to guarantee better protection of data subjects' rights.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('data_subject_rights')}
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-4 text-gray-700">
                        <p>
                          We fully recognize and respect the rights of data subjects under the General Data Protection Regulation. These rights constitute the foundation of our data protection approach and reflect our commitment to transparency, individual control, and privacy respect. We have implemented clear and effective processes to ensure that you can exercise your rights simply and quickly.
                        </p>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('right_to_information')}
                          </h3>
                          <p className="text-gray-700">
                            {t('right_to_information_desc')}
                          </p>
                          <div className="mt-3 space-y-3 text-gray-700">
                            <p>
                              The right to information is guaranteed from the first point of contact with you. We provide clear and understandable information about the processing of your personal data, including processing purposes, legal bases, recipients, retention periods, and your rights. This information is presented in an accessible manner, in plain language without unnecessary legal jargon.
                            </p>
                            <p>
                              Our privacy policies are regularly updated to reflect changes in our processing practices and to ensure their compliance with GDPR requirements. We ensure that this information is easily accessible from all data collection points and that you can consult it at any time.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('right_of_access')}
                          </h3>
                          <p className="text-gray-700">
                            {t('right_of_access_desc')}
                          </p>
                          <div className="mt-3 space-y-3 text-gray-700">
                            <p>
                              You have the right to obtain confirmation as to whether or not personal data concerning you is being processed, and, if it is, access to said data. This right includes obtaining a copy of your personal data, information about processing purposes, categories of data concerned, recipients or categories of recipients to whom the data has been or will be disclosed, and, where possible, the retention period of the data.
                            </p>
                            <p>
                              We commit to responding to your access requests within one month of receipt. This period may be extended by two months if your request is particularly complex or if you have made several requests. In this case, we will inform you of the extension and the reasons for the delay within one month of receipt of the request.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('right_to_rectification')}
                          </h3>
                          <p className="text-gray-700">
                            {t('right_to_rectification_desc')}
                          </p>
                          <div className="mt-3 space-y-3 text-gray-700">
                            <p>
                              You have the right to obtain, without undue delay, the rectification of inaccurate personal data concerning you. You also have the right to obtain the completion of incomplete data, notably by providing a supplementary statement. This right is particularly important to ensure the accuracy of information we hold about you and to ensure the quality of our services.
                            </p>
                            <p>
                              We process rectification requests with the utmost diligence and update your data within a maximum period of 30 days. When rectification affects information that has been disclosed to third parties, we take necessary measures to inform these parties of the rectification, unless this proves impossible or requires disproportionate effort.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('right_to_erasure')}
                          </h3>
                          <p className="text-gray-700">
                            {t('right_to_erasure_desc')}
                          </p>
                          <div className="mt-3 space-y-3 text-gray-700">
                            <p>
                              You have the right to obtain the erasure of personal data concerning you in certain conditions. This right, also called the "right to be forgotten", applies notably when the data is no longer necessary in relation to the purposes for which it was collected, when you withdraw your consent, when you object to processing and there are no overriding legitimate grounds for the processing, or when the data has been unlawfully processed.
                            </p>
                            <p>
                              We will proceed with erasure without undue delay, unless retention is necessary for the exercise of the right to freedom of expression and information or for compliance with a legal obligation. When erasure affects information that has been disclosed to third parties, we take reasonable steps to inform these parties of your erasure request, including as regards links to, copies or reproductions of the data.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('right_to_restrict')}
                          </h3>
                          <p className="text-gray-700">
                            {t('right_to_restrict_desc')}
                          </p>
                          <div className="mt-3 space-y-3 text-gray-700">
                            <p>
                              You have the right to obtain restriction of processing of your personal data in certain circumstances, notably when you contest the accuracy of the data, when processing is unlawful but you oppose erasure of the data, when we no longer need the data for processing purposes but you need it for the establishment, exercise or defense of legal claims, or when you have objected to processing pending verification as to whether the legitimate grounds pursued by the controller override yours.
                            </p>
                            <p>
                              During the period of restriction of processing, we will only retain the data for purposes other than processing, with your consent, for the establishment, exercise or defense of legal claims, or for the protection of the rights of another natural or legal person. We will inform you before lifting the restriction of processing.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('right_to_data_portability')}
                          </h3>
                          <p className="text-gray-700">
                            {t('right_to_data_portability_desc')}
                          </p>
                          <div className="mt-3 space-y-3 text-gray-700">
                            <p>
                              You have the right to receive the personal data concerning you, which you have provided to us, in a structured, commonly used and machine-readable format, and you have the right to transmit those data to another controller without hindrance from the controller to whom the personal data have been provided. This right applies when processing is based on consent or on a contract, and when processing is carried out by automated means.
                            </p>
                            <p>
                              We make tools available to you to facilitate the exercise of this right and to assist you in transferring your data. Data portability is ensured in a standard technical format that allows easy reuse of data by you or by the new controller. We ensure that portable data includes all information you have provided to us in the context of our relationship.
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-lg text-gray-900 mb-3">
                            {t('right_to_object')}
                          </h3>
                          <p className="text-gray-700">
                            {t('right_to_object_desc')}
                          </p>
                          <div className="mt-3 space-y-3 text-gray-700">
                            <p>
                              You have the right to object, at any time, on grounds relating to your particular situation, to processing of personal data concerning you which is based on legitimate interest. When you object, we cease processing the data unless we demonstrate compelling legitimate grounds for the processing which override your interests, rights and freedoms, or the processing is necessary for the establishment, exercise or defense of legal claims.
                            </p>
                            <p>
                              In the context of processing data for marketing purposes, you have the right to object at any time, free of charge and without formality, to processing of your personal data for these purposes. When you object to marketing, we immediately cease processing for these purposes. Your objection does not call into question the lawfulness of processing carried out before your objection.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          Rights Exercise Procedures
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            To exercise your data protection rights, you can contact us at any time using the contact details provided in this policy. We have implemented simple and accessible procedures to facilitate the exercise of your rights, with standardized forms available on request and a customer service team trained to process your requests effectively.
                          </p>
                          <p>
                            We may ask you for additional information to confirm your identity and ensure that personal data is disclosed to the right person. This verification is necessary to protect the security of your data and prevent unauthorized access. We do not charge any fee for the exercise of your rights, unless your request is manifestly unfounded or excessive, in which case we may charge a reasonable fee taking into account the administrative costs incurred.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('data_retention')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('retention_policy')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('retention_periods')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('contractual_data')}</li>
                          <li>{t('marketing_data')}</li>
                          <li>{t('accounting_data')}</li>
                          <li>{t('analytics_data')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('retention_periods_details1')}
                          </p>
                          <p>
                            {t('retention_periods_details2')}
                          </p>
                          <p>
                            {t('retention_periods_details3')}
                          </p>
                          <p>
                            {t('retention_periods_details4')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          End of Retention Management
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('retention_end_management_details1')}
                          </p>
                          <p>
                            {t('retention_end_management_details2')}
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
                          {t('security_measures_list')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('encryption')}</li>
                          <li>{t('access_controls')}</li>
                          <li>{t('backup_procedures')}</li>
                          <li>{t('staff_training')}</li>
                          <li>{t('incident_response')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('security_measures_details1')}
                          </p>
                          <p>
                            {t('security_measures_details2')}
                          </p>
                          <p>
                            {t('security_measures_details3')}
                          </p>
                          <p>
                            {t('security_measures_details4')}
                          </p>
                          <p>
                            {t('security_measures_details5')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          Continuous Evaluation and Improvement
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('continuous_evaluation_details1')}
                          </p>
                          <p>
                            {t('continuous_evaluation_details2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('data_transfers')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('transfer_policy')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('transfer_safeguards')}
                        </h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>{t('privacy_shield')}</li>
                          <li>{t('standard_clauses')}</li>
                          <li>{t('binding_corporate_rules')}</li>
                        </ul>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            The data protection shield is implemented when we transfer data to third countries that have been recognized as offering an adequate level of protection by the European Commission. We ensure that transfers to these countries are carried out in accordance with the shield principles and that the rights of data subjects are fully respected in the destination country.
                          </p>
                          <p>
                            Standard contractual clauses are used to govern data transfers to third countries that have not been recognized as offering an adequate level of protection. These clauses, approved by the European Commission, guarantee that personal data benefits from a level of protection equivalent to that provided by the GDPR, even when processed in jurisdictions with different protection regimes.
                          </p>
                          <p>
                            Binding corporate rules constitute a transfer mechanism for personal data within our international group of companies. These rules, approved by the competent supervisory authorities, guarantee that all entities in our group respect the same high standards of data protection, regardless of the country in which they operate.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('transfer_evaluation')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('transfer_policy_details1')}
                          </p>
                          <p>
                            {t('transfer_policy_details2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('data_breach')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('breach_notification')}
                      </p>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('breach_notification_procedure')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('breach_procedure_details1')}
                          </p>
                          <p>
                            {t('breach_procedure_details2')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('prevention_mitigation')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('breach_prevention_details1')}
                          </p>
                          <p>
                            {t('breach_prevention_details2')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('complaints')}
                    </h2>
                    
                    <div className="space-y-4 text-gray-700">
                      <p>
                        {t('complaint_right_details')}
                      </p>
                      
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('cnil_contact_details')}
                        </h3>
                        <div className="mt-4 space-y-3 text-gray-700">
                          <p>
                            {t('cnil_contact_details1')}
                          </p>
                          <p>
                            {t('cnil_contact_details2')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          {t('mediation_alternative_resolution')}
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            {t('mediation_alternative_details1')}
                          </p>
                          <p>
                            {t('mediation_alternative_details2')}
                          </p>
                        </div>
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