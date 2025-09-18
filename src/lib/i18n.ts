import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
// LanguageDetector intentionally not used to avoid hydration mismatch

// French translations
const frTranslations = {
  translation: {
    // Header
    'header.home': 'Accueil',
    'header.services': 'Services',
    'header.offers': 'Offres',
    'header.case_studies': 'Études de cas',
    'header.process': 'Processus',
    'header.blog': 'Blog IA',
    'header.contact': 'Contact',
    'header.whatsapp': '💬 WhatsApp',
    'header.quote': 'Demander un devis',
    
    // Hero Section
    'hero.title': 'Votre partenaire digital au Sénégal et au Maroc',
    'hero.subtitle': 'Automatisation WhatsApp, Sites Ultra-Rapides & IA',
    'hero.description': 'Transformez votre PME avec nos solutions d\'automatisation et d\'intelligence artificielle. Plus de 200 entreprises à Dakar, Thies, Casablanca, Rabat et Marrakech nous font confiance.',
    'hero.cta': 'Démarrer maintenant',
    'hero.demo': 'Voir notre demo',
    'hero.whatsapp_direct': '💬 WhatsApp Direct',
    
    // Hero Slides
    'hero.slide1.title': 'Votre partenaire digital au Sénégal et au Maroc',
    'hero.slide1.subtitle': 'Automatisation WhatsApp, Sites Ultra-Rapides & IA',
    'hero.slide1.description': 'Transformez votre PME avec nos solutions d\'automatisation et d\'intelligence artificielle. Plus de 200 entreprises à Dakar, Thies, Casablanca, Rabat et Marrakech nous font confiance.',
    'hero.slide1.cta': 'Démarrer maintenant',
    
    'hero.slide2.title': 'Intelligence Artificielle pour PME',
    'hero.slide2.subtitle': 'Chatbots, Analytics & Automatisation',
    'hero.slide2.description': 'Optimisez vos processus avec nos solutions IA sur mesure. Chatbots multilingues, tableaux de bord intelligents et automatisation complète pour les entreprises au Sénégal et au Maroc.',
    'hero.slide2.cta': 'Voir nos solutions IA',
    
    'hero.slide3.title': 'Sites Web Ultra-Rapides',
    'hero.slide3.subtitle': 'Performance & SEO Optimisé pour Dakar et Casablanca',
    'hero.slide3.description': 'Des sites web qui se chargent en moins de 1.5s, optimisés pour Google et les utilisateurs sénégalais et marocains. Performance garantie sur mobile et desktop.',
    'hero.slide3.cta': 'Créer mon site',
    
    'hero.slide4.title': 'Transformation Digitale Complète',
    'hero.slide4.subtitle': 'De l\'audit à l\'optimisation continue',
    'hero.slide4.description': 'Accompagnement personnalisé pour digitiser votre PME sénégalaise ou marocaine. Stratégie, mise en œuvre et suivi des performances avec notre équipe locale.',
    'hero.slide4.cta': 'Démarrer l\'audit',
    
    'hero.slide5.title': 'Innovation IA Made in Afrique',
    'hero.slide5.subtitle': 'Solutions sur-mesure pour l\'Afrique de l\'Ouest et du Nord',
    'hero.slide5.description': 'Développement d\'outils IA adaptés au contexte africain. Technologie de pointe, équipe locale, compréhension parfaite de vos défis business au Sénégal et au Maroc.',
    'hero.slide5.cta': 'Découvrir l\'innovation',
    
    // Hero Stats
    'hero.stats.pme_transformed': 'PME transformées',
    'hero.stats.satisfaction_rate': 'Taux de satisfaction',
    'hero.stats.productivity_gain': 'Gain de productivité',
    'hero.stats.chatbots_deployed': 'Chatbots déployés',
    'hero.stats.cost_reduction': 'Réduction des coûts',
    'hero.stats.response_time': 'Temps de réponse',
    'hero.stats.average_speed': 'Vitesse moyenne',
    'hero.stats.seo_improvement': 'Amélioration SEO',
    'hero.stats.mobile_score': 'Score mobile',
    
    // Hero Key Offers
    'hero.key_offers.title': 'Nos Solutions Phares',
    'hero.key_offers.whatsapp.title': 'Automatisation WhatsApp',
    'hero.key_offers.whatsapp.description': 'Chatbots intelligents qui gèrent 90% de vos commandes automatiquement',
    'hero.key_offers.whatsapp.cta': 'Démarrer maintenant',
    'hero.key_offers.website.title': 'Sites Ultra-Rapides',
    'hero.key_offers.website.description': 'Sites web qui se chargent en <1.5s avec SEO optimisé pour Google',
    'hero.key_offers.website.cta': 'Créer mon site',
    'hero.key_offers.ai.title': 'Assistant IA',
    'hero.key_offers.ai.description': 'Solutions d\'intelligence artificielle sur mesure pour votre business',
    'hero.key_offers.ai.cta': 'En savoir plus',
    
    // Offers Section
    'offers.title': 'Nos Offres Exclusives',
    'offers.subtitle': 'Solutions complètes d\'automatisation et de transformation digitale spécialement conçues pour les PME sénégalaises et marocaines.',
    'offers.special_badge': 'Offres Spéciales - Économisez jusqu\'à 40%',
    
    'offers.whatsapp.title': 'Automatisation WhatsApp',
    'offers.whatsapp.subtitle': 'Solution IA Complète',
    'offers.whatsapp.description': 'Transformez votre WhatsApp en machine à vendre 24h/24 avec notre IA conversationnelle avancée.',
    'offers.whatsapp.cta': 'Automatiser WhatsApp',
    
    'offers.website.title': 'Site Web Ultra-Rapide',
    'offers.website.subtitle': 'Performance & SEO',
    'offers.website.description': 'Site web professionnel optimisé pour la conversion avec temps de chargement < 1 seconde.',
    'offers.website.cta': 'Créer Mon Site',
    
    'offers.ai.title': 'Assistant IA Personnalisé',
    'offers.ai.subtitle': 'Intelligence Artificielle',
    'offers.ai.description': 'Assistant IA sur mesure pour automatiser vos processus métier et améliorer la productivité.',
    'offers.ai.cta': 'Créer Mon IA',
    
    // Enhanced Offers Section
    'offers.starter.name': 'Starter Digital',
    'offers.starter.tagline': 'Parfait pour commencer',
    'offers.starter.value_proposition': 'Doublez vos ventes en 60 jours',
    'offers.starter.description': 'Idéal pour les petites entreprises qui veulent automatiser leurs premiers processus',
    'offers.professional.name': 'Professional Plus',
    'offers.professional.tagline': 'Le plus populaire',
    'offers.professional.value_proposition': 'Triplez votre chiffre d\'affaires',
    'offers.professional.description': 'Solution complète pour PME ambitieuses qui veulent dominer leur marché',
    'offers.enterprise.name': 'Enterprise Scale',
    'offers.enterprise.tagline': 'Pour les leaders',
    'offers.enterprise.value_proposition': 'Automatisation complète de votre entreprise',
    'offers.enterprise.description': 'Transformation digitale complète pour entreprises qui visent l\'excellence',
    'offers.tab.starter': 'Starter',
    'offers.tab.professional': 'Professional',
    'offers.tab.enterprise': 'Enterprise',
    'offers.popular_badge': 'Le Plus Populaire',
    'offers.guaranteed_result': 'Résultat Garanti',
    'offers.personalized_analysis': 'Analyse personnalisée de votre potentiel',
    'offers.start_now': 'Commencer Maintenant',
    'offers.everything_included': 'Tout ce qui est inclus',
    'offers.not_sure': 'Pas sûr de votre choix ? Parlons de vos besoins spécifiques.',
    'offers.discovery_call': 'Découverte de Votre Potentiel 30min',
    
    // Starter features
    'offers.starter.feature1': 'Chatbot WhatsApp basique',
    'offers.starter.feature2': 'Site web vitrine (5 pages)',
    'offers.starter.feature3': 'Intégration réseaux sociaux',
    'offers.starter.feature4': 'Support email',
    'offers.starter.feature5': 'Analytics de base',
    'offers.starter.feature6': 'Formation 2h incluse',
    
    // Professional features
    'offers.professional.feature1': 'Chatbot WhatsApp avancé + IA',
    'offers.professional.feature2': 'Site web e-commerce complet',
    'offers.professional.feature3': 'Application mobile basique',
    'offers.professional.feature4': 'Automatisation marketing',
    'offers.professional.feature5': 'CRM intégré',
    'offers.professional.feature6': 'Support prioritaire 24/7',
    'offers.professional.feature7': 'Analytics avancées',
    'offers.professional.feature8': 'Formation équipe complète',
    
    // Enterprise features
    'offers.enterprise.feature1': 'IA conversationnelle multilingue',
    'offers.enterprise.feature2': 'Plateforme e-commerce avancée',
    'offers.enterprise.feature3': 'Applications mobiles natives',
    'offers.enterprise.feature4': 'Intégrations ERP/CRM',
    'offers.enterprise.feature5': 'Infrastructure cloud dédiée',
    'offers.enterprise.feature6': 'Équipe dédiée 24/7',
    'offers.enterprise.feature7': 'Consulting stratégique',
    'offers.enterprise.feature8': 'Formation continue',
    
    // Starter benefits
    'offers.starter.benefit1': '+50% de réponses automatiques',
    'offers.starter.benefit2': 'Présence web professionnelle',
    'offers.starter.benefit3': 'Gain de temps 10h/semaine',
    
    // Professional benefits
    'offers.professional.benefit1': '+200% de conversions',
    'offers.professional.benefit2': 'Automatisation complète',
    'offers.professional.benefit3': 'ROI garanti en 3 mois',
    
    // Enterprise benefits
    'offers.enterprise.benefit1': 'Transformation complète',
    'offers.enterprise.benefit2': 'Avantage concurrentiel',
    'offers.enterprise.benefit3': 'Croissance exponentielle',
    'offers.results_guaranteed': 'Résultats Garantis',
    'offers.pme_helped': 'PME Aidées',
    'offers.satisfaction': 'Satisfaction',
    
    // Benefits
    'benefits.title': 'Pourquoi Choisir OMA Digital ?',
    'benefits.description': 'Nous transformons les PME africaines avec des solutions d\'automatisation qui génèrent des résultats mesurables et durables.',
    'benefits.roi.title': 'ROI +200%',
    'benefits.roi.description': 'Retour sur investissement garanti en 6 mois',
    'benefits.delivery.title': 'Déploiement Rapide',
    'benefits.delivery.description': 'Votre solution opérationnelle en 48h maximum',
    'benefits.guarantee.title': 'Sécurité Garantie',
    'benefits.guarantee.description': 'Données protégées, conformité RGPD assurée',
    'benefits.clients.title': '200+ PME Transformées',
    'benefits.clients.description': 'Entreprises qui ont doublé leur CA',
    
    // Services
    'services.title': 'Solutions Digitales Complètes',
    'services.description': 'De l\'automatisation WhatsApp aux sites ultra-rapides, nous proposons tout l\'écosystème digital dont votre PME a besoin pour se développer au Sénégal et au Maroc.',
    
    // Services Section
    'services.whatsapp.title': 'Automatisation WhatsApp',
    'services.whatsapp.description': 'Chatbots intelligents pour WhatsApp Business. Réponses automatiques, gestion des commandes et support client 24/7.',
    'services.whatsapp.feature1': 'Réponses instantanées',
    'services.whatsapp.feature2': 'Gestion commandes',
    'services.whatsapp.feature3': 'Analytics avancés',
    
    'services.website.title': 'Sites Web Ultra-Rapides',
    'services.website.description': 'Sites web performants (<1.5s) optimisés pour le mobile et le SEO. Parfaits pour les PME sénégalaises.',
    'services.website.feature1': 'Performance garantie',
    'services.website.feature2': 'SEO optimisé',
    'services.website.feature3': 'Mobile-first',
    
    'services.branding.title': 'Branding Authentique',
    'services.branding.description': 'Identité visuelle forte qui reflète vos valeurs et attire votre clientèle locale et internationale.',
    'services.branding.feature1': 'Logo professionnel',
    'services.branding.feature2': 'Charte graphique',
    'services.branding.feature3': 'Support print/digital',
    
    // WhatsApp Automation Service (legacy)
    'service.whatsapp.title': 'Automatisation WhatsApp',
    'service.whatsapp.description': 'Chatbots intelligents pour WhatsApp Business. Réponses automatiques, gestion des commandes et support client 24/7.',
    'service.whatsapp.feature1': 'Réponses instantanées',
    'service.whatsapp.feature2': 'Gestion commandes',
    'service.whatsapp.feature3': 'Analytics avancés',
    
    // Footer
    'footer.address': 'Hersent Rue 15, Thies, Sénégal | Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt15, Maroc',
    'footer.phone': '+221 701 193 811',
    'footer.email': 'omadigital23@gmail.com',
    'footer.copyright': '© 2025 OMA Digital. Tous droits réservés.',
    'footer.made_with': 'Fait avec',
    'footer.in_dakar': 'à Thies, Sénégal & Casablanca, Maroc',
    'footer.senegal_office': 'Bureau Sénégal',
    'footer.morocco_office': 'Bureau Maroc',
    'footer.stay_informed': 'Restez Informé',
    'footer.newsletter_description': 'Recevez nos dernières actualités et insights IA pour les PME au Sénégal et au Maroc',
    'footer.your_email': 'Votre email',
    'footer.compliance_legal': 'Conformité & Légal',
    'footer.gdpr_compliant': 'Conforme RGPD & Lois locales',
    'footer.data_protection': 'sur la protection des données',
    'footer.support_active': 'Support 24/7 actif',
    'footer.back_to_top': 'Haut de page',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.close': 'Fermer',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',

    // Blog UI
    'blog.read_article': "Lire l'article",
    'blog.loading_article': "Chargement de l'article...",

    
    // Case Studies
    'case_studies.title': 'Success Stories PME Sénégalaises & Marocaines',
    'case_studies.description': 'Découvrez comment nos solutions ont transformé des PME au Sénégal et au Maroc, leur ont permis de croître rapidement grâce au digital.',
    'case_studies.boulangerie_touba': 'Boulangerie Touba',
    'case_studies.riad_atlas': 'Riad Atlas Boutique', 
    'case_studies.pharmacie_liberte': 'Pharmacie Liberté',
    'case_studies.atelier_couture': 'Atelier Couture Ndèye',
    'case_studies.industry.bakery': 'Boulangerie-Pâtisserie',
    'case_studies.industry.luxury_hotel': 'Hôtellerie de Luxe',
    'case_studies.industry.pharmacy': 'Pharmacie & Parapharmacie',
    'case_studies.industry.fashion': 'Haute Couture Africaine',
    'case_studies.location.dakar_medina': 'Médina, Dakar',
    'case_studies.location.marrakech': 'Marrakech, Maroc',
    'case_studies.location.casablanca': 'Maarif, Casablanca',
    'case_studies.location.dakar_pikine': 'Pikine Est, Dakar',
    'case_studies.create_story': 'Créer votre success story',
    'case_studies.challenge_label': 'Défi :',
    'case_studies.solution_label': 'Solution :',
    'case_studies.stats.pme_senegal_maroc': 'PME Sénégal & Maroc',
    'case_studies.stats.satisfaction_rate': 'Taux de satisfaction',
    'case_studies.stats.average_growth': 'Croissance moyenne CA',
    'case_studies.stats.roi_recovered': 'ROI récupéré',
    'case_studies.stats.weeks': 'sem',
    
    // Boulangerie Touba details
    'case_studies.boulangerie.challenge': '400 appels/jour pour commandes, 70% perdues faute de réponse rapide',
    'case_studies.boulangerie.solution': 'Chatbot WhatsApp multilingue (Français/Wolof) + Paiements Orange Money/Wave',
    'case_studies.boulangerie.testimonial': 'Maintenant mes clients commandent en wolof sur WhatsApp et paient avec Wave. Mon chiffre d\'affaires a triplé en 4 mois grâce à OMA Digital.',
    'case_studies.boulangerie.author': 'Cheikh Ahmadou Bamba',
    'case_studies.boulangerie.position': 'Propriétaire',
    
    // Riad Atlas details
    'case_studies.riad.challenge': 'Réservations perdues, communication difficile avec touristes internationaux',
    'case_studies.riad.solution': 'Site web multilingue + Chatbot IA + Intégration Booking.com',
    'case_studies.riad.testimonial': 'OMA a transformé notre riad en machine à réservations. Nous recevons des clients du monde entier grâce à notre présence digitale optimisée.',
    'case_studies.riad.author': 'Youssef El Fassi',
    'case_studies.riad.position': 'Directeur Général',
    
    // Pharmacie details
    'case_studies.pharmacie.challenge': '800+ appels/jour pour vérifier disponibilité médicaments, 40% de ruptures de stock chroniques, perte de 60% des clients chroniques faute de rappels automatiques',
    'case_studies.pharmacie.solution': 'IA prédictive multi-sources + Chatbot WhatsApp médical + App mobile patients + Système rappels automatiques + Livraison géolocalisée',
    'case_studies.pharmacie.testimonial': 'Révolutionnaire ! L\'IA analyse nos ventes, la météo, les épidémies saisonnières pour prédire nos besoins. Nos patients reçoivent des rappels automatiques pour leurs traitements chroniques. Nous sommes devenus LA pharmacie de référence du quartier.',
    'case_studies.pharmacie.author': 'Dr. Aicha Benali',
    'case_studies.pharmacie.position': 'Pharmacienne Titulaire & Associée',
    
    // Atelier Couture details
    'case_studies.atelier.challenge': 'Créations uniques limitées au marché local, gestion manuelle des mesures clients, aucune présence digitale, commandes perdues faute de catalogue professionnel',
    'case_studies.atelier.solution': 'Plateforme e-commerce premium + IA génératrice de designs + Configurateur 3D vêtements + Marketing influenceurs + Paiements internationaux',
    'case_studies.atelier.testimonial': 'Incroyable ! Mes boubous et tailleurs sénégalais se vendent jusqu\'\u00e0 New York et Paris. L\'IA crée des motifs wax innovants, les clients visualisent leurs tenues en 3D avant commande. Je forme maintenant 12 couturières tant la demande explose !',
    'case_studies.atelier.author': 'Ndèye Fatou Seck',
    'case_studies.atelier.position': 'Maître Couturière & CEO',
    
    // Process
    'process.title': 'Notre Processus de Transformation',
    'process.description': 'Une méthodologie éprouvée en 6 étapes pour transformer votre PME et garantir votre succès digital. Transparence et collaboration à chaque étape.',
    'process.audit.title': 'Audit & Analyse',
    'process.strategy.title': 'Stratégie & Design',
    'process.development.title': 'Développement',
    'process.deployment.title': 'Déploiement',
    'process.optimization.title': 'Optimisation',
    'process.support.title': 'Support 24/7',
    'process.ready_title': 'Prêt à commencer votre transformation ?',
    'process.ready_description': 'Chaque projet commence par une consultation gratuite pour comprendre vos besoins et définir la meilleure stratégie pour votre entreprise.',
    'process.consultation': 'Consultation gratuite',
    'process.see_pricing': 'Voir nos tarifs',
    'process.audit.duration': '1-2 semaines',
    'process.audit.description': 'Analyse complète de votre écosystème digital actuel, identification des opportunités et définition des objectifs.',
    'process.audit.deliverable1': 'Audit technique complet',
    'process.audit.deliverable2': 'Analyse concurrentielle',
    'process.audit.deliverable3': 'Roadmap personnalisée',
    'process.strategy.duration': '2-3 semaines',
    'process.strategy.description': 'Conception de la stratégie digitale, création du design et prototypage des solutions sur mesure.',
    'process.strategy.deliverable1': 'Stratégie digitale',
    'process.strategy.deliverable2': 'Maquettes design',
    'process.strategy.deliverable3': 'Architecture technique',
    'process.development.duration': '4-6 semaines',
    'process.development.description': 'Développement des solutions avec méthodologie agile, tests continus et intégrations API.',
    'process.development.deliverable1': 'Code source',
    'process.development.deliverable2': 'Tests automatisés',
    'process.development.deliverable3': 'Intégrations API',
    'process.deployment.duration': '1 semaine',
    'process.deployment.description': 'Mise en production sécurisée, formation de vos équipes et migration des données existantes.',
    'process.deployment.deliverable1': 'Déploiement production',
    'process.deployment.deliverable2': 'Formation équipes',
    'process.deployment.deliverable3': 'Migration données',
    'process.optimization.duration': 'Continue',
    'process.optimization.description': 'Monitoring des performances, optimisations basées sur les données et évolutions fonctionnelles.',
    'process.optimization.deliverable1': 'Dashboard analytics',
    'process.optimization.deliverable2': 'Rapports mensuels',
    'process.optimization.deliverable3': 'Optimisations continues',
    'process.support.duration': 'Permanent',
    'process.support.description': 'Support technique permanent, maintenance préventive et assistance pour vos équipes.',
    'process.support.deliverable1': 'Support technique',
    'process.support.deliverable2': 'Maintenance préventive',
    'process.support.deliverable3': 'Formations continues',
    'process.benefits.title': 'Pourquoi notre processus fonctionne',
    'process.benefits.transparency.title': 'Transparence Totale',
    'process.benefits.transparency.description': 'Accès en temps réel à l\'avancement de votre projet avec des rapports détaillés.',
    'process.benefits.agility.title': 'Agilité & Flexibilité',
    'process.benefits.agility.description': 'Adaptation continue selon vos besoins avec des itérations rapides.',
    'process.benefits.results.title': 'Résultats Mesurables',
    'process.benefits.results.description': 'KPIs clairs et rapports mensuels pour suivre votre transformation digitale.',
    'process.deliverables_label': 'Livrables :',
    
    // Testimonials
    'testimonials.title': 'Ce que disent nos clients',
    'testimonials.description': 'Plus de 200 PME sénégalaises et marocaines nous font confiance pour leur transformation digitale. Découvrez leurs témoignages authentiques.',
    'testimonials.average_rating': 'Note moyenne',
    'testimonials.satisfied_clients': 'Clients satisfaits',
    'testimonials.recommendations': 'Recommandations',
    'testimonials.support': 'Support client',
    
    // Additional Services (for ServicesSection)
    'services.analytics.title': 'Dashboards Analytics',
    'services.analytics.description': 'Tableaux de bord en temps réel pour suivre vos performances et prendre des décisions data-driven.',
    'services.analytics.feature1': 'KPIs en temps réel',
    'services.analytics.feature2': 'Rapports automatisés',
    'services.analytics.feature3': 'Prédictions IA',
    'services.ai_assistant.title': 'Assistant IA Personnalisé',
    'services.ai_assistant.description': 'Intelligence artificielle sur mesure pour automatiser vos processus métier et améliorer l\'expérience client.',
    'services.ai_assistant.feature1': 'IA conversationnelle',
    'services.ai_assistant.feature2': 'Automatisation processus',
    'services.ai_assistant.feature3': 'Apprentissage continu',
    'services.security.title': 'Sécurité & Conformité',
    'services.security.description': 'Protection maximale de vos données avec chiffrement, sauvegardes automatiques et conformité RGPD.',
    'services.security.feature1': 'Chiffrement SSL',
    'services.security.feature2': 'Sauvegardes auto',
    'services.security.feature3': 'Conformité RGPD',
    'services.automation.title': 'Automatisation Workflow',
    'services.automation.description': 'Automatisez vos tâches répétitives et connectez tous vos outils pour un workflow fluide.',
    'services.automation.feature1': 'Intégrations multiples',
    'services.automation.feature2': 'Workflows personnalisés',
    'services.automation.feature3': 'Monitoring 24/7',
    'services.mobile_apps.title': 'Apps Mobile PWA',
    'services.mobile_apps.description': 'Applications mobiles progressives qui fonctionnent hors ligne et s\'installent comme des apps natives.',
    'services.mobile_apps.feature1': 'Fonctionnement offline',
    'services.mobile_apps.feature2': 'Installation native',
    'services.mobile_apps.feature3': 'Notifications push',
    'services.why_choose': 'Pourquoi choisir OMA Digital ?',
    'services.custom_solution': 'Besoin d\'une solution sur mesure ?',
    'services.custom_description': 'Chaque PME est unique. Parlons de vos besoins spécifiques et créons ensemble la solution digitale parfaite pour votre entreprise.',
    'services.free_consultation': 'Consultation gratuite',
    'services.popular_badge': 'Populaire',
    'services.get_started': 'Commencer maintenant',
    'services.why_choose_benefits.roi': 'ROI garanti +200% en 6 mois',
    'services.why_choose_benefits.team': 'Équipe 100% basée au Sénégal et au Maroc',
    'services.why_choose_benefits.custom': 'Solutions sur mesure pour votre secteur d\'activité',
    'services.why_choose_benefits.support': 'Support 24/7 en français',
    'services.satisfaction_rate': '98%',
    'services.satisfied_clients': 'de clients satisfaits',
    
    // Test Page
    'test.page_title': 'Test du Sélecteur de Langue',
    'test.page_description': 'Cette page démontre que le sélecteur de langue fonctionne dans toute la page, pas seulement dans l\'en-tête.',
    'test.section1_title': 'Section en Français',
    'test.section1_content': 'Ce contenu est en français. Utilisez le sélecteur de langue pour changer la langue de toute la page.',
    'test.section2_title': 'Deuxième Section',
    'test.section2_content': 'Cette section montre également du contenu en français qui changera lorsque vous sélectionnerez une autre langue.',
    'test.language_switcher_demo': 'Démonstration du Sélecteur de Langue',
    'test.switcher_explanation': 'Vous pouvez utiliser le sélecteur de langue dans l\'en-tête ou le sélecteur flottant en bas à gauche de la page.',
    'test.header_switcher': 'Sélecteur dans l\'en-tête',
    'test.floating_switcher': 'Sélecteur flottant',
    'test.floating_note': 'Le sélecteur flottant est visible en bas à gauche',
    'test.back_to_home': 'Retour à l\'accueil'
  }
};

// English translations
const enTranslations = {
  translation: {
    // Header
    'header.home': 'Home',
    'header.services': 'Services',
    'header.offers': 'Offers',
    'header.case_studies': 'Case Studies',
    'header.process': 'Process',
    'header.blog': 'AI Blog',
    'header.contact': 'Contact',
    'header.whatsapp': '💬 WhatsApp',
    'header.quote': 'Request a quote',
    
    // Hero Section
    'hero.title': 'Your digital partner in Senegal and Morocco',
    'hero.subtitle': 'WhatsApp Automation, Ultra-Fast Websites & AI',
    'hero.description': 'Transform your SME with our automation and artificial intelligence solutions. Over 200 businesses in Dakar, Thies, Casablanca, Rabat and Marrakech trust us.',
    'hero.cta': 'Get started now',
    'hero.demo': 'See our demo',
    'hero.whatsapp_direct': '💬 Direct WhatsApp',
    
    // Hero Slides
    'hero.slide1.title': 'Your digital partner in Senegal and Morocco',
    'hero.slide1.subtitle': 'WhatsApp Automation, Ultra-Fast Websites & AI',
    'hero.slide1.description': 'Transform your SME with our automation and artificial intelligence solutions. Over 200 businesses in Dakar, Thies, Casablanca, Rabat and Marrakech trust us.',
    'hero.slide1.cta': 'Get started now',
    
    'hero.slide2.title': 'Artificial Intelligence for SMEs',
    'hero.slide2.subtitle': 'Chatbots, Analytics & Automation',
    'hero.slide2.description': 'Optimize your processes with our custom AI solutions. Multilingual chatbots, intelligent dashboards and complete automation for businesses in Senegal and Morocco.',
    'hero.slide2.cta': 'See our AI solutions',
    
    'hero.slide3.title': 'Ultra-Fast Websites',
    'hero.slide3.subtitle': 'Performance & SEO Optimized for Dakar and Casablanca',
    'hero.slide3.description': 'Websites that load in less than 1.5s, optimized for Google and Senegalese and Moroccan users. Guaranteed performance on mobile and desktop.',
    'hero.slide3.cta': 'Create my website',
    
    'hero.slide4.title': 'Complete Digital Transformation',
    'hero.slide4.subtitle': 'From audit to continuous optimization',
    'hero.slide4.description': 'Personalized support to digitize your Senegalese or Moroccan SME. Strategy, implementation and performance monitoring with our local team.',
    'hero.slide4.cta': 'Start the audit',
    
    'hero.slide5.title': 'AI Innovation Made in Africa',
    'hero.slide5.subtitle': 'Custom solutions for West and North Africa',
    'hero.slide5.description': 'Development of AI tools adapted to the African context. Cutting-edge technology, local team, perfect understanding of your business challenges in Senegal and Morocco.',
    'hero.slide5.cta': 'Discover innovation',
    
    // Hero Stats
    'hero.stats.pme_transformed': 'SMEs transformed',
    'hero.stats.satisfaction_rate': 'Satisfaction rate',
    'hero.stats.productivity_gain': 'Productivity gain',
    'hero.stats.chatbots_deployed': 'Chatbots deployed',
    'hero.stats.cost_reduction': 'Cost reduction',
    'hero.stats.response_time': 'Response time',
    'hero.stats.average_speed': 'Average speed',
    'hero.stats.seo_improvement': 'SEO improvement',
    'hero.stats.mobile_score': 'Mobile score',
    
    // Hero Key Offers
    'hero.key_offers.title': 'Our Flagship Solutions',
    'hero.key_offers.whatsapp.title': 'WhatsApp Automation',
    'hero.key_offers.whatsapp.description': 'Smart chatbots that handle 90% of your orders automatically',
    'hero.key_offers.whatsapp.cta': 'Get started now',
    'hero.key_offers.website.title': 'Ultra-Fast Websites',
    'hero.key_offers.website.description': 'Websites that load in <1.5s with SEO optimized for Google',
    'hero.key_offers.website.cta': 'Create my website',
    'hero.key_offers.ai.title': 'AI Assistant',
    'hero.key_offers.ai.description': 'Custom artificial intelligence solutions for your business',
    'hero.key_offers.ai.cta': 'Learn more',
    
    // Offers Section
    'offers.title': 'Our Exclusive Offers',
    'offers.subtitle': 'Complete automation and digital transformation solutions specially designed for Senegalese and Moroccan SMEs.',
    'offers.special_badge': 'Special Offers - Save up to 40%',
    
    'offers.whatsapp.title': 'WhatsApp Automation',
    'offers.whatsapp.subtitle': 'Complete AI Solution',
    'offers.whatsapp.description': 'Transform your WhatsApp into a 24/7 selling machine with our advanced conversational AI.',
    'offers.whatsapp.cta': 'Automate WhatsApp',
    
    'offers.website.title': 'Ultra-Fast Website',
    'offers.website.subtitle': 'Performance & SEO',
    'offers.website.description': 'Professional website optimized for conversion with loading time < 1 second.',
    'offers.website.cta': 'Create My Website',
    
    'offers.ai.title': 'Personalized AI Assistant',
    'offers.ai.subtitle': 'Artificial Intelligence',
    'offers.ai.description': 'Custom AI assistant to automate your business processes and improve productivity.',
    'offers.ai.cta': 'Create My AI',
    
    // Enhanced Offers Section
    'offers.starter.name': 'Starter Digital',
    'offers.starter.tagline': 'Perfect to get started',
    'offers.starter.value_proposition': 'Double your sales in 60 days',
    'offers.starter.description': 'Ideal for small businesses wanting to automate their first processes',
    'offers.professional.name': 'Professional Plus',
    'offers.professional.tagline': 'Most popular',
    'offers.professional.value_proposition': 'Triple your revenue',
    'offers.professional.description': 'Complete solution for ambitious SMEs who want to dominate their market',
    'offers.enterprise.name': 'Enterprise Scale',
    'offers.enterprise.tagline': 'For leaders',
    'offers.enterprise.value_proposition': 'Complete automation of your business',
    'offers.enterprise.description': 'Complete digital transformation for companies aiming for excellence',
    'offers.tab.starter': 'Starter',
    'offers.tab.professional': 'Professional',
    'offers.tab.enterprise': 'Enterprise',
    'offers.popular_badge': 'Most Popular',
    'offers.guaranteed_result': 'Guaranteed Result',
    'offers.personalized_analysis': 'Personalized analysis of your potential',
    'offers.start_now': 'Start Now',
    'offers.everything_included': 'Everything included',
    'offers.not_sure': 'Not sure about your choice? Let\'s talk about your specific needs.',
    'offers.discovery_call': 'Discover Your Potential 30min',
    
    // Starter features
    'offers.starter.feature1': 'Basic WhatsApp chatbot',
    'offers.starter.feature2': 'Showcase website (5 pages)',
    'offers.starter.feature3': 'Social media integration',
    'offers.starter.feature4': 'Email support',
    'offers.starter.feature5': 'Basic analytics',
    'offers.starter.feature6': '2h training included',
    
    // Professional features
    'offers.professional.feature1': 'Advanced WhatsApp chatbot + AI',
    'offers.professional.feature2': 'Complete e-commerce website',
    'offers.professional.feature3': 'Basic mobile application',
    'offers.professional.feature4': 'Marketing automation',
    'offers.professional.feature5': 'Integrated CRM',
    'offers.professional.feature6': 'Priority 24/7 support',
    'offers.professional.feature7': 'Advanced analytics',
    'offers.professional.feature8': 'Complete team training',
    
    // Enterprise features
    'offers.enterprise.feature1': 'Multilingual conversational AI',
    'offers.enterprise.feature2': 'Advanced e-commerce platform',
    'offers.enterprise.feature3': 'Native mobile applications',
    'offers.enterprise.feature4': 'ERP/CRM integrations',
    'offers.enterprise.feature5': 'Dedicated cloud infrastructure',
    'offers.enterprise.feature6': 'Dedicated 24/7 team',
    'offers.enterprise.feature7': 'Strategic consulting',
    'offers.enterprise.feature8': 'Continuous training',
    
    // Starter benefits
    'offers.starter.benefit1': '+50% automatic responses',
    'offers.starter.benefit2': 'Professional web presence',
    'offers.starter.benefit3': 'Save 10h/week',
    
    // Professional benefits
    'offers.professional.benefit1': '+200% conversions',
    'offers.professional.benefit2': 'Complete automation',
    'offers.professional.benefit3': 'ROI guaranteed in 3 months',
    
    // Enterprise benefits
    'offers.enterprise.benefit1': 'Complete transformation',
    'offers.enterprise.benefit2': 'Competitive advantage',
    'offers.enterprise.benefit3': 'Exponential growth',
    'offers.results_guaranteed': 'Guaranteed Results',
    'offers.pme_helped': 'SMEs Helped',
    'offers.satisfaction': 'Satisfaction',
    
    // Benefits
    'benefits.title': 'Why Choose OMA Digital?',
    'benefits.description': 'We transform African SMEs with automation solutions that generate measurable and sustainable results.',
    'benefits.roi.title': 'ROI +200%',
    'benefits.roi.description': 'Return on investment guaranteed in 6 months',
    'benefits.delivery.title': 'Rapid Deployment',
    'benefits.delivery.description': 'Your solution operational in 48h maximum',
    'benefits.guarantee.title': 'Security Guaranteed',
    'benefits.guarantee.description': 'Protected data, GDPR compliance assured',
    'benefits.clients.title': '200+ SMEs Transformed',
    'benefits.clients.description': 'Companies that doubled their revenue',
    
    // Services
    'services.title': 'Complete Digital Solutions',
    'services.description': 'From WhatsApp automation to ultra-fast websites, we provide the complete digital ecosystem your SME needs to grow in Senegal and Morocco.',
    
    // Services Section
    'services.whatsapp.title': 'WhatsApp Automation',
    'services.whatsapp.description': 'Smart chatbots for WhatsApp Business. Automatic responses, order management and 24/7 customer support.',
    'services.whatsapp.feature1': 'Instant responses',
    'services.whatsapp.feature2': 'Order management',
    'services.whatsapp.feature3': 'Advanced analytics',
    
    'services.website.title': 'Ultra-Fast Websites',
    'services.website.description': 'High-performance websites (<1.5s) optimized for mobile and SEO. Perfect for Senegalese SMEs.',
    'services.website.feature1': 'Guaranteed performance',
    'services.website.feature2': 'SEO optimized',
    'services.website.feature3': 'Mobile-first',
    
    'services.branding.title': 'Authentic Branding',
    'services.branding.description': 'Strong visual identity that reflects your values and attracts your local and international clientele.',
    'services.branding.feature1': 'Professional logo',
    'services.branding.feature2': 'Brand guidelines',
    'services.branding.feature3': 'Print/digital support',
    
    // WhatsApp Automation Service (legacy)
    'service.whatsapp.title': 'WhatsApp Automation',
    'service.whatsapp.description': 'Smart chatbots for WhatsApp Business. Automatic responses, order management and 24/7 customer support.',
    'service.whatsapp.feature1': 'Instant responses',
    'service.whatsapp.feature2': 'Order management',
    'service.whatsapp.feature3': 'Advanced analytics',
    
    // Footer
    'footer.address': 'Hersent Rue 15, Thies, Senegal | Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt15, Morocco',
    'footer.phone': '+221 701 193 811',
    'footer.email': 'omadigital23@gmail.com',
    'footer.copyright': '© 2025 OMA Digital. All rights reserved.',
    'footer.made_with': 'Made with',
    'footer.in_dakar': 'in Thies, Senegal & Casablanca, Morocco',
    'footer.senegal_office': 'Senegal Office',
    'footer.morocco_office': 'Morocco Office',
    'footer.stay_informed': 'Stay Informed',
    'footer.newsletter_description': 'Receive our latest news and AI insights for SMEs in Senegal and Morocco',
    'footer.your_email': 'Your email',
    'footer.compliance_legal': 'Compliance & Legal',
    'footer.gdpr_compliant': 'GDPR compliant & Local laws',
    'footer.data_protection': 'on data protection',
    'footer.support_active': 'Support 24/7 active',
    'footer.back_to_top': 'Back to top',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',

    // Blog UI
    'blog.read_article': 'Read article',
    'blog.loading_article': 'Loading article...',

    
    // Case Studies
    'case_studies.title': 'Success Stories Senegalese & Moroccan SMEs',
    'case_studies.description': 'Discover how our solutions have transformed SMEs in Senegal and Morocco, enabling them to grow rapidly through digital transformation.',
    'case_studies.boulangerie_touba': 'Boulangerie Touba',
    'case_studies.riad_atlas': 'Riad Atlas Boutique',
    'case_studies.pharmacie_liberte': 'Pharmacie Liberté',
    'case_studies.atelier_couture': 'Atelier Couture Ndèye',
    'case_studies.industry.bakery': 'Bakery-Pastry',
    'case_studies.industry.luxury_hotel': 'Luxury Hospitality',
    'case_studies.industry.pharmacy': 'Pharmacy & Parapharmacy',
    'case_studies.industry.fashion': 'African Haute Couture',
    'case_studies.location.dakar_medina': 'Médina, Dakar',
    'case_studies.location.marrakech': 'Marrakech, Morocco',
    'case_studies.location.casablanca': 'Maarif, Casablanca',
    'case_studies.location.dakar_pikine': 'Pikine Est, Dakar',
    'case_studies.create_story': 'Create your success story',
    'case_studies.challenge_label': 'Challenge:',
    'case_studies.solution_label': 'Solution:',
    'case_studies.stats.pme_senegal_maroc': 'SMEs Senegal & Morocco',
    'case_studies.stats.satisfaction_rate': 'Satisfaction rate',
    'case_studies.stats.average_growth': 'Average revenue growth',
    'case_studies.stats.roi_recovered': 'ROI recovered',
    'case_studies.stats.weeks': 'weeks',
    
    // Boulangerie Touba details
    'case_studies.boulangerie.challenge': '400 calls/day for orders, 70% lost due to slow response',
    'case_studies.boulangerie.solution': 'Multilingual WhatsApp chatbot (French/Wolof) + Orange Money/Wave payments',
    'case_studies.boulangerie.testimonial': 'Now my customers order in Wolof on WhatsApp and pay with Wave. My revenue tripled in 4 months thanks to OMA Digital.',
    'case_studies.boulangerie.author': 'Cheikh Ahmadou Bamba',
    'case_studies.boulangerie.position': 'Owner',
    
    // Riad Atlas details
    'case_studies.riad.challenge': 'Lost reservations, difficult communication with international tourists',
    'case_studies.riad.solution': 'Multilingual website + AI Chatbot + Booking.com integration',
    'case_studies.riad.testimonial': 'OMA transformed our riad into a booking machine. We receive clients from around the world thanks to our optimized digital presence.',
    'case_studies.riad.author': 'Youssef El Fassi',
    'case_studies.riad.position': 'General Manager',
    
    // Pharmacie details
    'case_studies.pharmacie.challenge': '800+ calls/day to check medication availability, 40% chronic stock shortages, loss of 60% chronic patients due to lack of automatic reminders',
    'case_studies.pharmacie.solution': 'Multi-source predictive AI + Medical WhatsApp chatbot + Patient mobile app + Automatic reminder system + Geolocated delivery',
    'case_studies.pharmacie.testimonial': 'Revolutionary! The AI analyzes our sales, weather, seasonal epidemics to predict our needs. Our patients receive automatic reminders for their chronic treatments. We have become THE reference pharmacy in the neighborhood.',
    'case_studies.pharmacie.author': 'Dr. Aicha Benali',
    'case_studies.pharmacie.position': 'Licensed Pharmacist & Partner',
    
    // Atelier Couture details
    'case_studies.atelier.challenge': 'Unique creations limited to local market, manual customer measurements management, no digital presence, lost orders due to lack of professional catalog',
    'case_studies.atelier.solution': 'Premium e-commerce platform + AI design generator + 3D clothing configurator + Influencer marketing + International payments',
    'case_studies.atelier.testimonial': 'Incredible! My Senegalese boubous and suits sell all the way to New York and Paris. The AI creates innovative wax patterns, customers visualize their outfits in 3D before ordering. I now train 12 seamstresses as demand explodes!',
    'case_studies.atelier.author': 'Ndèye Fatou Seck',
    'case_studies.atelier.position': 'Master Seamstress & CEO',
    
    // Process
    'process.title': 'Our Transformation Process',
    'process.description': 'A proven 6-step methodology to transform your SME and guarantee your digital success. Transparency and collaboration at every step.',
    'process.audit.title': 'Audit & Analysis',
    'process.strategy.title': 'Strategy & Design',
    'process.development.title': 'Development',
    'process.deployment.title': 'Deployment',
    'process.optimization.title': 'Optimization',
    'process.support.title': '24/7 Support',
    'process.ready_title': 'Ready to start your transformation?',
    'process.ready_description': 'Every project starts with a free consultation to understand your needs and define the best strategy for your business.',
    'process.consultation': 'Free consultation',
    'process.see_pricing': 'See our pricing',
    'process.audit.duration': '1-2 weeks',
    'process.audit.description': 'Complete analysis of your current digital ecosystem, opportunity identification and objective definition.',
    'process.audit.deliverable1': 'Complete technical audit',
    'process.audit.deliverable2': 'Competitive analysis',
    'process.audit.deliverable3': 'Personalized roadmap',
    'process.strategy.duration': '2-3 weeks',
    'process.strategy.description': 'Digital strategy design, design creation and prototyping of custom solutions.',
    'process.strategy.deliverable1': 'Digital strategy',
    'process.strategy.deliverable2': 'Design mockups',
    'process.strategy.deliverable3': 'Technical architecture',
    'process.development.duration': '4-6 weeks',
    'process.development.description': 'Solution development with agile methodology, continuous testing and API integrations.',
    'process.development.deliverable1': 'Source code',
    'process.development.deliverable2': 'Automated tests',
    'process.development.deliverable3': 'API integrations',
    'process.deployment.duration': '1 week',
    'process.deployment.description': 'Secure production deployment, team training and existing data migration.',
    'process.deployment.deliverable1': 'Production deployment',
    'process.deployment.deliverable2': 'Team training',
    'process.deployment.deliverable3': 'Data migration',
    'process.optimization.duration': 'Continuous',
    'process.optimization.description': 'Performance monitoring, data-based optimizations and functional evolutions.',
    'process.optimization.deliverable1': 'Analytics dashboard',
    'process.optimization.deliverable2': 'Monthly reports',
    'process.optimization.deliverable3': 'Continuous optimizations',
    'process.support.duration': 'Permanent',
    'process.support.description': 'Permanent technical support, preventive maintenance and assistance for your teams.',
    'process.support.deliverable1': 'Technical support',
    'process.support.deliverable2': 'Preventive maintenance',
    'process.support.deliverable3': 'Continuous training',
    'process.benefits.title': 'Why our process works',
    'process.benefits.transparency.title': 'Total Transparency',
    'process.benefits.transparency.description': 'Real-time access to your project progress with detailed reports.',
    'process.benefits.agility.title': 'Agility & Flexibility',
    'process.benefits.agility.description': 'Continuous adaptation according to your needs with rapid iterations.',
    'process.benefits.results.title': 'Measurable Results',
    'process.benefits.results.description': 'Clear KPIs and monthly reports to track your digital transformation.',
    'process.deliverables_label': 'Deliverables:',
    
    // Testimonials
    'testimonials.title': 'What our clients say',
    'testimonials.description': 'Over 200 Senegalese and Moroccan SMEs trust us for their digital transformation. Discover their authentic testimonials.',
    'testimonials.average_rating': 'Average rating',
    'testimonials.satisfied_clients': 'Satisfied clients',
    'testimonials.recommendations': 'Recommendations',
    'testimonials.support': 'Customer support',
    
    // Individual testimonials
    'testimonials.aminata.name': 'Aminata Diallo',
    'testimonials.aminata.position': 'General Manager',
    'testimonials.aminata.company': 'Boulangerie Moderne',
    'testimonials.aminata.location': 'Liberté 6, Dakar',
    'testimonials.aminata.text': 'OMA revolutionized our business! The WhatsApp chatbot handles 90% of our orders automatically. Our sales increased by 200% in 4 months. The team is very professional and always available.',
    'testimonials.aminata.result': '+200% sales in 4 months',
    'testimonials.cheikh.name': 'Cheikh Mbaye',
    'testimonials.cheikh.position': 'Founder',
    'testimonials.cheikh.company': 'Tech Solutions SN',
    'testimonials.cheikh.location': 'Plateau, Dakar',
    'testimonials.cheikh.text': 'The website created by OMA loads in less than 1 second and helped us gain 15 places on Google. Our clients are impressed by the quality and speed. Excellent investment!',
    'testimonials.cheikh.result': 'Top 3 Google in 6 months',
    
    // Individual testimonials
    'testimonials.aminata.name': 'Aminata Diallo',
    'testimonials.aminata.position': 'Directrice Générale',
    'testimonials.aminata.company': 'Boulangerie Moderne',
    'testimonials.aminata.location': 'Liberté 6, Dakar',
    'testimonials.aminata.text': 'OMA a révolutionné notre business ! Le chatbot WhatsApp gère 90% de nos commandes automatiquement. Nos ventes ont augmenté de 200% en 4 mois. L\'équipe est très professionnelle et toujours disponible.',
    'testimonials.aminata.result': '+200% ventes en 4 mois',
    'testimonials.cheikh.name': 'Cheikh Mbaye',
    'testimonials.cheikh.position': 'Fondateur',
    'testimonials.cheikh.company': 'Tech Solutions SN',
    'testimonials.cheikh.location': 'Plateau, Dakar',
    'testimonials.cheikh.text': 'Le site web créé par OMA se charge en moins d\'1 seconde et nous a fait gagner 15 places sur Google. Nos clients sont impressionnés par la qualité et la rapidité. Excellent investissement !',
    'testimonials.cheikh.result': 'Top 3 Google en 6 mois',
    
    // Additional Services (for ServicesSection)
    'services.analytics.title': 'Analytics Dashboards',
    'services.analytics.description': 'Real-time dashboards to track your performance and make data-driven decisions.',
    'services.analytics.feature1': 'Real-time KPIs',
    'services.analytics.feature2': 'Automated reports',
    'services.analytics.feature3': 'AI predictions',
    'services.ai_assistant.title': 'Personalized AI Assistant',
    'services.ai_assistant.description': 'Custom artificial intelligence to automate your business processes and improve customer experience.',
    'services.ai_assistant.feature1': 'Conversational AI',
    'services.ai_assistant.feature2': 'Process automation',
    'services.ai_assistant.feature3': 'Continuous learning',
    'services.security.title': 'Security & Compliance',
    'services.security.description': 'Maximum protection of your data with encryption, automatic backups and GDPR compliance.',
    'services.security.feature1': 'SSL encryption',
    'services.security.feature2': 'Auto backups',
    'services.security.feature3': 'GDPR compliance',
    'services.automation.title': 'Workflow Automation',
    'services.automation.description': 'Automate your repetitive tasks and connect all your tools for a smooth workflow.',
    'services.automation.feature1': 'Multiple integrations',
    'services.automation.feature2': 'Custom workflows',
    'services.automation.feature3': '24/7 monitoring',
    'services.mobile_apps.title': 'PWA Mobile Apps',
    'services.mobile_apps.description': 'Progressive web applications that work offline and install like native apps.',
    'services.mobile_apps.feature1': 'Offline functionality',
    'services.mobile_apps.feature2': 'Native installation',
    'services.mobile_apps.feature3': 'Push notifications',
    'services.why_choose': 'Why choose OMA Digital?',
    'services.custom_solution': 'Need a custom solution?',
    'services.custom_description': 'Every SME is unique. Let\'s talk about your specific needs and create the perfect digital solution for your business together.',
    'services.free_consultation': 'Free consultation',
    'services.popular_badge': 'Popular',
    'services.get_started': 'Get started now',
    'services.why_choose_benefits.roi': 'ROI guaranteed +200% in 6 months',
    'services.why_choose_benefits.team': '100% team based in Senegal and Morocco',
    'services.why_choose_benefits.custom': 'Custom solutions for your industry',
    'services.why_choose_benefits.support': '24/7 support in French',
    'services.satisfaction_rate': '98%',
    'services.satisfied_clients': 'satisfied clients',
    
    // Test Page
    'test.page_title': 'Language Switcher Test',
    'test.page_description': 'This page demonstrates that the language switcher works throughout the entire page, not just in the header.',
    'test.section1_title': 'Section in English',
    'test.section1_content': 'This content is in English. Use the language switcher to change the language of the entire page.',
    'test.section2_title': 'Second Section',
    'test.section2_content': 'This section also shows English content that will change when you select another language.',
    'test.language_switcher_demo': 'Language Switcher Demo',
    'test.switcher_explanation': 'You can use the language switcher in the header or the floating switcher at the bottom left of the page.',
    'test.header_switcher': 'Header Switcher',
    'test.floating_switcher': 'Floating Switcher',
    'test.floating_note': 'The floating switcher is visible at the bottom left',
    'test.back_to_home': 'Back to Home'
  }
};

// Internationalization support for the admin panel
interface Translations {
  [key: string]: {
    fr: string;
    en: string;
  };
}

const translations: Translations = {
  'chatbot.sessions.title': {
    fr: 'Sessions Chatbot',
    en: 'Chatbot Sessions'
  },
  'chatbot.sessions.description': {
    fr: 'Gestion des interactions avec les utilisateurs',
    en: 'Management of user interactions'
  },
  'chatbot.sessions.search.placeholder': {
    fr: 'Rechercher des sessions...',
    en: 'Search sessions...'
  },
  'chatbot.sessions.filters.status.all': {
    fr: 'Tous les statuts',
    en: 'All statuses'
  },
  'chatbot.sessions.filters.status.active': {
    fr: 'Actives',
    en: 'Active'
  },
  'chatbot.sessions.filters.status.completed': {
    fr: 'Terminées',
    en: 'Completed'
  },
  'chatbot.sessions.filters.status.pending': {
    fr: 'En attente',
    en: 'Pending'
  },
  'chatbot.sessions.filters.type.all': {
    fr: 'Tous les types',
    en: 'All types'
  },
  'chatbot.sessions.filters.type.support': {
    fr: 'Support',
    en: 'Support'
  },
  'chatbot.sessions.filters.type.sales': {
    fr: 'Vente',
    en: 'Sales'
  },
  'chatbot.sessions.filters.type.general': {
    fr: 'Général',
    en: 'General'
  },
  'chatbot.sessions.sort.date': {
    fr: 'Trier par date',
    en: 'Sort by date'
  },
  'chatbot.sessions.sort.messages': {
    fr: 'Trier par messages',
    en: 'Sort by messages'
  },
  'chatbot.sessions.table.user': {
    fr: 'Utilisateur',
    en: 'User'
  },
  'chatbot.sessions.table.date': {
    fr: 'Date',
    en: 'Date'
  },
  'chatbot.sessions.table.status': {
    fr: 'Statut',
    en: 'Status'
  },
  'chatbot.sessions.table.type': {
    fr: 'Type',
    en: 'Type'
  },
  'chatbot.sessions.table.messages': {
    fr: 'Messages',
    en: 'Messages'
  },
  'chatbot.sessions.table.lastMessage': {
    fr: 'Dernier message',
    en: 'Last message'
  },
  'chatbot.sessions.table.actions': {
    fr: 'Actions',
    en: 'Actions'
  },
  'chatbot.sessions.table.status.active': {
    fr: 'Active',
    en: 'Active'
  },
  'chatbot.sessions.table.status.completed': {
    fr: 'Terminée',
    en: 'Completed'
  },
  'chatbot.sessions.table.status.pending': {
    fr: 'En attente',
    en: 'Pending'
  },
  'chatbot.sessions.table.type.support': {
    fr: 'Support',
    en: 'Support'
  },
  'chatbot.sessions.table.type.sales': {
    fr: 'Vente',
    en: 'Sales'
  },
  'chatbot.sessions.table.type.general': {
    fr: 'Général',
    en: 'General'
  },
  'chatbot.sessions.noResults': {
    fr: 'Aucune session ne correspond à vos critères de recherche.',
    en: 'No sessions match your search criteria.'
  },
  'chatbot.sessions.noResults.title': {
    fr: 'Aucune session trouvée',
    en: 'No sessions found'
  },
  'chatbot.sessions.loading': {
    fr: 'Chargement des sessions...',
    en: 'Loading sessions...'
  },
  'chatbot.sessions.error.title': {
    fr: 'Erreur de chargement',
    en: 'Loading error'
  },
  'chatbot.sessions.error.message': {
    fr: 'Impossible de charger les sessions du chatbot. Veuillez vérifier votre connexion ou contacter l\'administrateur.',
    en: 'Unable to load chatbot sessions. Please check your connection or contact the administrator.'
  },
  'chatbot.sessions.error.fallback': {
    fr: 'Service temporairement indisponible',
    en: 'Service temporarily unavailable'
  },
  'chatbot.sessions.anonymousUser': {
    fr: 'Utilisateur anonyme',
    en: 'Anonymous user'
  },
  'chatbot.sessions.unknownUser': {
    fr: 'Utilisateur inconnu',
    en: 'Unknown user'
  },
  'chatbot.sessions.noMessage': {
    fr: 'Aucun message',
    en: 'No message'
  },
  'chatbot.sessions.table.actions.view': {
    fr: 'Voir les détails',
    en: 'View details'
  },
  'chatbot.sessions.table.actions.more': {
    fr: 'Plus d\'options',
    en: 'More options'
  },
  'chatbot.sessions.table.status.new': {
    fr: 'Nouvelle',
    en: 'New'
  },
  'chatbot.sessions.table.status.in_progress': {
    fr: 'En cours',
    en: 'In progress'
  },
  'chatbot.sessions.table.status.archived': {
    fr: 'Archivée',
    en: 'Archived'
  },
  'chatbot.sessions.table.type.inquiry': {
    fr: 'Demande',
    en: 'Inquiry'
  },
  'chatbot.sessions.table.type.complaint': {
    fr: 'Réclamation',
    en: 'Complaint'
  },
  'chatbot.sessions.table.type.feedback': {
    fr: 'Retour',
    en: 'Feedback'
  }
};

export type Language = 'fr' | 'en';

export function t(key: string, lang: Language = 'fr'): string {
  return translations[key]?.[lang] || key;
}

export function setLanguage(lang: Language): void {
  // In a real implementation, this would store the language preference
  // For now, we'll just use it in our component
}

i18n
  .use(Backend)
  // IMPORTANT: Do NOT use LanguageDetector here to avoid pre-hydration language switches
  .use(initReactI18next)
  .init({
    // Ensure SSR and initial client render use the same language
    lng: 'fr',
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      fr: frTranslations,
      en: enTranslations,
    }
  });

export default i18n;