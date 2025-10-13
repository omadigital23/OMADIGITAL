import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import { NextI18nLanguageSwitcher } from '../src/components/NextI18nLanguageSwitcher';

export default function ConditionsGenerales() {
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
                      {t('general_terms')}
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
                            La disponibilité des services est garantie à 99,9% selon notre SLA (Service Level Agreement), ce qui signifie que nous nous engageons à maintenir nos services opérationnels 99,9% du temps sur une année civile. Cette disponibilité est mesurée sur une base mensuelle et exclut les périodes de maintenance planifiée, les interruptions de service causées par des tiers (fournisseurs d'accès internet, hébergeurs, etc.) et les cas de force majeure. En cas de dépassement de ce seuil, des compensations peuvent être appliquées selon les modalités définies dans le SLA.
                          </p>
                          <p>
                            L'absence de garantie de résultats reflète la nature complexe et multivariée des projets de transformation digitale. Bien que nous nous engageions à fournir des services de la plus haute qualité et à utiliser toutes les compétences nécessaires pour atteindre vos objectifs, nous ne pouvons garantir des résultats spécifiques qui dépendent de nombreux facteurs externes à notre contrôle. Ces facteurs incluent l'engagement de votre équipe, les conditions du marché, les comportements des utilisateurs finaux et l'évolution technologique.
                          </p>
                          <p>
                            L'exclusion des dommages indirects vise à limiter notre responsabilité aux seuls dommages directs et prévisibles découlant de l'exécution de nos services. Nous ne saurions être tenu responsable des pertes de chiffre d'affaires, des pertes de clientèle, des atteintes à l'image de marque, des pertes d'opportunités commerciales ou d'autres dommages indirects, même si nous avons été informés de la possibilité de tels dommages. Cette limitation est proportionnée et raisonnable compte tenu de la nature de nos services.
                          </p>
                          <p>
                            La force majeure et les événements externes constituent des circonstances exceptionnelles qui peuvent affecter notre capacité à fournir nos services. Nous ne serons pas responsables des retards ou de l'impossibilité de fournir nos services en cas de force majeure, de grèves, de catastrophes naturelles, de guerre, d'émeutes, de pandémies, de restrictions gouvernementales, de pannes d'électricité prolongées, de cyberattaques ou d'autres événements imprévisibles et inévitables. Dans de tels cas, nous ferons nos meilleurs efforts pour minimiser l'impact sur vos activités et vous tiendrons informés de l'évolution de la situation.
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
                            Notre responsabilité totale, cumulée pour tous les dommages, pertes et causes d'action, ne dépassera en aucun cas le montant total payé par vous pour les services au cours des douze (12) mois précédant immédiatement la réclamation. Cette limitation s'applique indépendamment du fondement de la réclamation, qu'elle soit contractuelle, délictuelle (y compris par négligence), en responsabilité stricte ou autre, et même si nous avons été informés de la possibilité de tels dommages.
                          </p>
                          <p>
                            Certaines juridictions ne permettent pas l'exclusion ou la limitation des dommages indirects ou accessoires, ou la limitation de la responsabilité prévue ci-dessus. Dans une telle mesure, notre responsabilité sera limitée ou exclue dans la mesure maximale permise par la loi. Rien dans ces conditions générales ne vise à exclure ou limiter notre responsabilité en cas de décès ou de dommages corporels causés par notre négligence, ou en cas de fraude ou de faute intentionnelle.
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
                            La résiliation par l'utilisateur avec préavis de 30 jours est une option disponible pour mettre fin à votre relation contractuelle avec OMA Digital. Pour exercer ce droit, vous devez nous notifier votre intention de résilier par écrit, par e-mail à l'adresse contractuelle ou par courrier recommandé avec accusé de réception. La résiliation prendra effet à l'expiration du délai de préavis, à condition que toutes les obligations financières à votre égard aient été honorées.
                          </p>
                          <p>
                            La résiliation par OMA Digital pour motif légitime peut intervenir dans plusieurs circonstances, notamment en cas de non-paiement persistant, de violation grave de ces conditions générales, d'utilisation abusive de nos services, de comportement nuisible à notre réputation ou à celle de nos autres clients, ou de non-respect des obligations contractuelles essentielles. Nous vous notifierons par écrit les motifs de la résiliation et vous donnerons un délai raisonnable pour remédier à la situation, sauf dans les cas graves où une résiliation immédiate est justifiée.
                          </p>
                          <p>
                            Les conséquences de la résiliation incluent le paiement des prestations effectuées jusqu'à la date de résiliation, la cessation de l'accès à nos services et la restitution des éléments de propriété intellectuelle conformément aux dispositions du contrat. Les obligations de confidentialité, les limitations de responsabilité et d'autres clauses pérennes continueront à s'appliquer après la résiliation. Toute somme impayée à la date de résiliation deviendra immédiatement exigible.
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
                          {t('senegalese_law_terms')}
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
      ...(await serverSideTranslations(locale ?? 'fr', ['common', 'legal'])),
    },
  };
};