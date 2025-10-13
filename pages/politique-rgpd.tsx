import React from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import { NextI18nLanguageSwitcher } from '../src/components/NextI18nLanguageSwitcher';

export default function PolitiqueRGPD() {
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
                      {t('gdpr_policy')}
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
                          En tant que responsable du traitement, OMA Digital détermine les finalités et les moyens du traitement des données personnelles dans le cadre de nos activités. Cette responsabilité implique un engagement fort envers la protection des données et la mise en œuvre de mesures appropriées pour garantir la sécurité, la confidentialité et la conformité de tous les traitements de données que nous réalisons.
                        </p>
                        <p>
                          Papa Amadou Fall, en tant que contact principal pour les questions liées à la protection des données, est chargé de superviser notre conformité RGPD, de traiter les demandes des personnes concernées et de servir de point de contact avec les autorités de contrôle. Il dispose de l'autorité nécessaire pour prendre des décisions en matière de protection des données et pour allouer les ressources appropriées à la mise en œuvre de nos obligations en vertu du RGPD.
                        </p>
                        <p>
                          Notre organisation dispose d'une structure claire de gouvernance en matière de protection des données, avec des responsabilités bien définies à tous les niveaux. Les départements concernés par le traitement des données personnelles ont désigné des référents protection des données pour assurer une mise en œuvre cohérente des politiques et procédures. Cette approche décentralisée nous permet de garantir que la protection des données est intégrée dans tous les processus de l'entreprise.
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">
                        Engagement organisationnel
                      </h3>
                      <div className="space-y-3 text-gray-700">
                        <p>
                          Notre engagement envers la protection des données s'étend à l'ensemble de notre organisation, de la direction générale aux équipes opérationnelles. Nous avons mis en place un programme de formation régulière pour tous les employés concernés par le traitement des données personnelles, afin de garantir une compréhension approfondie des obligations du RGPD et des bonnes pratiques en matière de protection des données.
                        </p>
                        <p>
                          La direction de l'entreprise soutient activement notre démarche de conformité en allouant les ressources nécessaires, en participant aux évaluations de conformité et en veillant à ce que la protection des données soit intégrée dans toutes les décisions stratégiques. Cette implication de la direction garantit que la protection des données reste une priorité constante dans nos opérations.
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
                              L'exécution du contrat constitue la base légale principale pour le traitement de vos données personnelles dans le cadre de notre relation commerciale. Cette base légale s'applique lorsque le traitement est nécessaire à la fourniture des services que vous avez contractés avec OMA Digital, à la gestion de votre compte client, à la facturation et au suivi de la relation contractuelle.
                            </p>
                            <p>
                              Les données traitées sur cette base incluent vos informations d'identification, vos coordonnées de contact, les détails de vos commandes, les informations de paiement, l'historique des services fournis et les communications liées à l'exécution du contrat. Ce traitement est strictement limité aux finalités contractuelles et ne s'étend pas à d'autres usages sans base légale appropriée.
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
                              L'intérêt légitime nous permet de traiter vos données personnelles pour des finalités qui sont nécessaires à notre activité commerciale et qui ne portent pas atteinte de manière disproportionnée à vos droits et libertés. Nous réalisons une analyse d'impact systématique pour chaque traitement basé sur l'intérêt légitime, afin de garantir que nos intérêts sont légitimes et que le traitement est proportionné.
                            </p>
                            <p>
                              Les exemples d'utilisation de cette base légale incluent la prévention de la fraude, la sécurité des systèmes, l'analyse statistique agrégée, l'amélioration de nos services, la gestion des réclamations et la communication proactive concernant nos services. Dans chaque cas, nous veillons à ce que vos intérêts légitimes soient respectés et que vous ayez la possibilité de vous opposer à ces traitements.
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
                              Votre consentement explicite est requis pour certains traitements spécifiques de vos données personnelles, notamment pour la prospection commerciale, l'envoi de newsletters, l'utilisation de cookies non essentiels et toute autre activité pour laquelle le consentement est la base légale appropriée. Nous veillons à ce que votre consentement soit libre, spécifique, éclairé et univoque.
                            </p>
                            <p>
                              Le consentement est recueilli par des moyens clairs et transparents, avec une information détaillée sur les finalités du traitement, la durée de conservation des données et vos droits. Vous pouvez retirer votre consentement à tout moment, sans que cela n'affecte la licéité du traitement effectué avant le retrait. Le retrait du consentement n'affecte pas la licéité d'autres traitements basés sur des bases légales différentes.
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
                              Le respect de nos obligations légales nous oblige à traiter certaines de vos données personnelles pour nous conformer aux lois et réglementations applicables. Cette base légale s'applique aux traitements nécessaires pour satisfaire aux exigences légales, réglementaires ou fiscales, ainsi qu'aux obligations découlant de décisions judiciaires ou d'instructions d'autorités compétentes.
                            </p>
                            <p>
                              Les exemples incluent la conservation de documents comptables pour les périodes légales requises, la réponse aux demandes d'autorités judiciaires, la mise en œuvre de mesures de lutte contre le blanchiment d'argent, la conservation d'informations pour des audits réglementaires et la coopération avec les autorités de contrôle. Ces traitements sont strictement limités aux exigences légales spécifiques et à la durée nécessaire à leur satisfaction.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          Documentation des bases légales
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            Nous maintenons une documentation détaillée de toutes les bases légales appliquées à nos traitements de données, avec une justification précise pour chaque base choisie. Cette documentation est régulièrement mise à jour et fait l'objet d'audits internes pour garantir sa conformité et son exactitude. Elle constitue une référence essentielle pour notre équipe et pour les audits de conformité.
                          </p>
                          <p>
                            Lorsque plusieurs bases légales pourraient s'appliquer à un même traitement, nous choisissons celle qui est la plus appropriée et la mieux adaptée aux finalités poursuivies. Nous évitons d'utiliser le consentement comme base légale lorsque d'autres bases plus appropriées sont disponibles, afin de garantir une meilleure protection des droits des personnes concernées.
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
                          Nous reconnaissons et respectons pleinement les droits des personnes concernées en vertu du règlement général sur la protection des données. Ces droits constituent le fondement de notre approche de la protection des données et reflètent notre engagement envers la transparence, le contrôle individuel et le respect de la vie privée. Nous avons mis en place des processus clairs et efficaces pour garantir que vous puissiez exercer vos droits de manière simple et rapide.
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
                              Le droit à l'information est garanti dès le premier point de contact avec vous. Nous fournissons des informations claires et compréhensibles sur le traitement de vos données personnelles, y compris les finalités du traitement, les bases légales, les destinataires, la durée de conservation et vos droits. Cette information est présentée de manière accessible, dans un langage simple et sans jargon juridique inutile.
                            </p>
                            <p>
                              Nos politiques de confidentialité sont régulièrement mises à jour pour refléter les changements dans nos pratiques de traitement et pour garantir leur conformité aux exigences du RGPD. Nous veillons à ce que ces informations soient facilement accessibles depuis tous les points de collecte de données et que vous puissiez les consulter à tout moment.
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
                              Vous avez le droit d'obtenir la confirmation que des données personnelles vous concernant sont ou ne sont pas traitées, et, lorsqu'elles le sont, l'accès auxdites données. Ce droit inclut l'obtention d'une copie de vos données personnelles, des informations sur les finalités du traitement, des catégories de données concernées, des destinataires ou catégories de destinataires auxquels les données ont été ou seront communiquées, et, si possible, de la durée de conservation des données.
                            </p>
                            <p>
                              Nous nous engageons à répondre à vos demandes d'accès dans un délai d'un mois à compter de leur réception. Ce délai peut être prolongé de deux mois si votre demande est particulièrement complexe ou si vous avez formulé plusieurs demandes. Dans ce cas, nous vous informerons de la prolongation et des raisons du report dans un délai d'un mois à compter de la réception de la demande.
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
                              Vous avez le droit d'obtenir, dans les meilleurs délais, la rectification des données personnelles inexactes vous concernant. Vous avez également le droit d'obtenir le complément des données incomplètes, notamment en fournissant une déclaration complémentaire. Ce droit est particulièrement important pour garantir l'exactitude des informations que nous détenons à votre sujet et pour assurer la qualité de nos services.
                            </p>
                            <p>
                              Nous traitons les demandes de rectification avec la plus grande diligence et mettons à jour vos données dans un délai maximal de 30 jours. Lorsque la rectification affecte des informations qui ont été communiquées à des tiers, nous prenons les mesures nécessaires pour informer ces tiers de la rectification, sauf si cela s'avère impossible ou exige des efforts disproportionnés.
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
                              Vous avez le droit d'obtenir l'effacement de données personnelles vous concernant dans certaines conditions. Ce droit, également appelé "droit à l'oubli", s'applique notamment lorsque les données ne sont plus nécessaires au regard des finalités pour lesquelles elles ont été collectées, lorsque vous retirez votre consentement, lorsque vous vous opposez au traitement et qu'il n'existe pas d'autres motifs légitimes pour le poursuivre, ou lorsque les données ont été traitées illicitement.
                            </p>
                            <p>
                              Nous procéderons à l'effacement dans les meilleurs délais, sauf si la conservation est nécessaire pour l'exercice du droit à la liberté d'expression et d'information ou pour le respect d'une obligation légale. Lorsque l'effacement affecte des informations qui ont été communiquées à des tiers, nous prenons les mesures raisonnables pour informer ces tiers de votre demande d'effacement, y compris en ce qui concerne les liens vers, les copies ou les reproductions des données.
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
                              Vous avez le droit d'obtenir la limitation du traitement de vos données personnelles dans certaines circonstances, notamment lorsque vous contestez l'exactitude des données, lorsque le traitement est illicite mais que vous vous opposez à l'effacement des données, lorsque nous n'avons plus besoin des données à des fins de traitement mais que vous en avez besoin pour la constatation, l'exercice ou la défense de droits en justice, ou lorsque vous vous êtes opposé au traitement en attendant la vérification portant sur le point de savoir que les motifs légitimes poursuivis par le responsable du traitement prévalent sur les vôtres.
                            </p>
                            <p>
                              Pendant la période de limitation du traitement, nous ne conserverons que les données à d'autres fins que le traitement, avec votre consentement, pour la constatation, l'exercice ou la défense de droits en justice ou pour la protection des droits d'une autre personne physique ou morale. Nous vous informerons avant de lever la limitation du traitement.
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
                              Vous avez le droit de recevoir les données personnelles vous concernant, que vous nous avez fournies, dans un format structuré, couramment utilisé et lisible par machine, et vous avez le droit de transmettre ces données à un autre responsable du traitement sans que le responsable du traitement auquel les données personnelles ont été communiquées y fasse obstacle. Ce droit s'applique lorsque le traitement est fondé sur un consentement ou sur un contrat, et lorsque le traitement est effectué par des moyens automatisés.
                            </p>
                            <p>
                              Nous mettons à votre disposition des outils pour faciliter l'exercice de ce droit et vous accompagner dans le transfert de vos données. La portabilité des données est assurée dans un format technique standardisé qui permet une réutilisation aisée des données par vous ou par le nouveau responsable du traitement. Nous veillons à ce que les données portables incluent toutes les informations que vous nous avez fournies dans le cadre de notre relation.
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
                              Vous avez le droit de vous opposer, à tout moment, pour des raisons tenant à votre situation particulière, au traitement de données personnelles vous concernant qui est fondé sur l'intérêt légitime. Lorsque vous vous opposez, nous cessons le traitement des données à moins que nous ne démontrions des motifs légitimes impérieux pour le traitement qui prévalent sur vos intérêts, droits et libertés, ou que le traitement soit nécessaire à la constatation, l'exercice ou la défense de droits en justice.
                            </p>
                            <p>
                              Dans le cadre du traitement de données à des fins de prospection, vous avez le droit de vous opposer à tout moment, gratuitement et sans formalité, au traitement de vos données personnelles à ces fins. Lorsque vous vous opposez à la prospection, nous cessons immédiatement le traitement à ces fins. Votre opposition ne remet pas en cause la licéité du traitement effectué avant votre opposition.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-lg text-gray-900 mb-3">
                          Procédures d'exercice des droits
                        </h3>
                        <div className="space-y-3 text-gray-700">
                          <p>
                            Pour exercer vos droits en matière de protection des données, vous pouvez nous contacter à tout moment en utilisant les coordonnées fournies dans cette politique. Nous avons mis en place des procédures simples et accessibles pour faciliter l'exercice de vos droits, avec des formulaires standardisés disponibles sur demande et un service client formé pour traiter vos demandes de manière efficace.
                          </p>
                          <p>
                            Nous pouvons vous demander des informations supplémentaires pour confirmer votre identité et garantir que les données personnelles sont communiquées à la bonne personne. Cette vérification est nécessaire pour protéger la sécurité de vos données et prévenir les accès non autorisés. Nous ne facturons aucun frais pour l'exercice de vos droits, sauf si votre demande est manifestement infondée ou excessive, auquel cas nous pouvons facturer des frais raisonnables tenant compte des coûts administratifs engendrés.
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
                          Gestion de la fin de conservation
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
                          Évaluation et amélioration continue
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
                            Le bouclier de protection des données est mis en œuvre lorsque nous transférons des données vers des pays tiers qui ont été reconnus comme offrant un niveau adéquat de protection par la Commission européenne. Nous nous assurons que les transferts vers ces pays sont effectués conformément aux principes du bouclier et que les droits des personnes concernées sont pleinement respectés dans le pays de destination.
                          </p>
                          <p>
                            Les clauses contractuelles types sont utilisées pour encadrer les transferts de données vers des pays tiers qui n'ont pas été reconnus comme offrant un niveau adéquat de protection. Ces clauses, approuvées par la Commission européenne, garantissent que les données personnelles bénéficient d'un niveau de protection équivalent à celui prévu par le RGPD, même lorsqu'elles sont traitées dans des juridictions avec des régimes de protection différents.
                          </p>
                          <p>
                            Les règles d'entreprise contraignantes constituent un mécanisme de transfert pour les données personnelles au sein de notre groupe d'entreprises international. Ces règles, approuvées par les autorités de contrôle compétentes, garantissent que toutes les entités de notre groupe respectent les mêmes normes élevées de protection des données, quel que soit le pays dans lequel elles opèrent.
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
      ...(await serverSideTranslations(locale ?? 'fr', ['common', 'legal'])),
    },
  };
};