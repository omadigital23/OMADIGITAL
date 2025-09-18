import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Header } from '../src/components/Header';
import { Footer } from '../src/components/Footer';
import { Search, Calendar, User, ArrowRight, TrendingUp, Zap, Users, Filter, Share2, MessageCircle } from 'lucide-react';

const articles = [
  {
    id: 'doubler-ca-ia-3-mois',
    title: '🚀 Comment l\'IA peut Doubler votre CA en 3 Mois',
    excerpt: 'Découvrez les 5 stratégies éprouvées qui ont permis à 200+ PME sénégalaises et marocaines de doubler leur chiffre d\'affaires.',
    category: 'IA & Automatisation',
    date: '15 janvier 2024',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&crop=center',
    popular: true,
    content: {
      intro: "L'Intelligence Artificielle n'est plus réservée aux grandes entreprises. Au Sénégal et au Maroc, plus de 200 PME ont déjà multiplié leur chiffre d'affaires par 2 à 5 en intégrant l'IA dans leur stratégie commerciale. Voici comment elles ont procédé et pourquoi vous devriez faire de même dès maintenant.",
      sections: [
        {
          title: "Pourquoi l'IA est Cruciale pour les PME Africaines en 2024",
          content: "Le marché africain connaît une transformation digitale sans précédent. Avec 89% des Sénégalais et 92% des Marocains utilisant WhatsApp quotidiennement, et une croissance du e-commerce de +156% en 2023, les PME qui n'adoptent pas l'IA risquent de perdre 60% de leurs parts de marché d'ici 2025. L'IA permet d'automatiser les tâches répétitives, d'améliorer l'expérience client et de prendre des décisions basées sur les données plutôt que sur l'intuition.",
          case: "Étude de cas : Amadou Diop, propriétaire de la Boulangerie Liberté à Dakar, recevait 200 messages WhatsApp par jour mais ne pouvait répondre qu'à 30% d'entre eux à temps. Résultat : il perdait 140 commandes potentielles quotidiennement. Après l'implémentation de notre chatbot IA, il traite 100% des demandes instantanément, 24h/24. Son CA a bondi de 260% en seulement 8 semaines."
        },
        {
          title: "Les 5 Domaines où l'IA Transforme Immédiatement votre Business",
          content: "1. **Service Client Automatisé** : Réponses instantanées sur WhatsApp, Facebook, site web. Taux de satisfaction client +85%. 2. **Gestion des Stocks Prédictive** : L'IA prédit les ruptures de stock 15 jours à l'avance. Réduction des pertes de 40%. 3. **Marketing Personnalisé** : Messages ciblés selon le comportement client. Taux de conversion +300%. 4. **Optimisation des Prix** : Ajustement automatique selon la demande et la concurrence. Marge bénéficiaire +25%. 5. **Analyse Prédictive des Ventes** : Prévisions précises à 95% pour planifier production et approvisionnement.",
          case: "Fatima El Mansouri, propriétaire d'une boutique de mode à Casablanca, utilisait l'IA pour analyser les préférences de ses 2,000 clients WhatsApp. L'IA a identifié que 68% de ses clientes préféraient les robes colorées le vendredi (jour de prière). En adaptant ses promotions, elle a augmenté ses ventes du vendredi de 180%."
        },
        {
          title: "ROI Concret : Combien Rapporte Réellement l'IA ?",
          content: "Nos analyses sur 200+ PME clientes révèlent des résultats constants : **Mois 1** : Automatisation des réponses clients = +40% de commandes traitées. **Mois 2** : Optimisation des processus = -60% de temps administratif. **Mois 3** : IA prédictive activée = +120% de ventes croisées. **Mois 6** : Système complet opérationnel = +247% de CA moyen. L'investissement initial (2,500€ à 8,000€) est récupéré en moyenne en 6 semaines. Chaque euro investi dans l'IA rapporte 12€ la première année.",
          case: "Restaurant Le Baobab (Dakar) : Investissement initial 4,500€. Économies mensuelles : 2,800€ (temps personnel) + 3,200€ (commandes supplémentaires) = 6,000€/mois. ROI : 133% dès le premier mois. Projection annuelle : +72,000€ de bénéfices nets supplémentaires."
        },
        {
          title: "Comment Implémenter l'IA Sans Risque dans votre PME",
          content: "**Phase 1 (Semaine 1-2)** : Audit gratuit de vos processus actuels. Identification des 3 points d'amélioration prioritaires. **Phase 2 (Semaine 3-4)** : Installation du chatbot WhatsApp et formation de votre équipe. Tests en mode pilote avec 20% de vos clients. **Phase 3 (Semaine 5-8)** : Déploiement complet + optimisation continue. Suivi hebdomadaire des performances. **Phase 4 (Mois 3+)** : IA avancée (prédictions, personnalisation, automatisation complète). Accompagnement jusqu'à l'autonomie totale.",
          case: "Pharmacie Moderne (Rabat) : Déploiement en 3 semaines. Semaine 1 : Audit révèle 400 appels/jour pour disponibilité médicaments. Semaine 2 : Chatbot installé, gère 90% des demandes automatiquement. Semaine 3 : Système de rappel automatique pour renouvellements. Résultat : -75% d'appels, +180% de ventes récurrentes, personnel libéré pour conseil pharmaceutique."
        },
        {
          title: "Erreurs à Éviter et Garanties de Succès",
          content: "**Erreurs fatales** : 1. Vouloir tout automatiser d'un coup (échec garanti). 2. Négliger la formation de l'équipe (résistance au changement). 3. Choisir des solutions génériques non adaptées au marché africain. **Notre approche garantie** : Implémentation progressive, formation incluse, solutions 100% adaptées aux spécificités sénégalaises et marocaines. **Garantie résultats** : +100% de CA en 6 mois ou nous remboursons 200% de votre investissement. **Support inclus** : Accompagnement 12 mois, mises à jour gratuites, hotline 24/7.",
          case: "Boulangerie Touba (Thiès) : Première tentative avec un concurrent = échec total (solution inadaptée). Deuxième tentative avec OMA Digital = +340% de CA en 4 mois. Différence : notre IA comprend le wolof, gère les paiements Orange Money/Wave, s'adapte aux horaires de prière."
        }
      ],
      cta: "Votre concurrent utilise peut-être déjà l'IA. Ne prenez pas le risque d'être distancé. Audit gratuit + démonstration personnalisée. Résultats garantis ou remboursé 200%."
    }
  },
  {
    id: 'whatsapp-business-guide-2024',
    title: '💬 WhatsApp Business : Guide Complet 2024',
    excerpt: 'Tout ce que vous devez savoir pour automatiser vos conversations WhatsApp et booster vos ventes.',
    category: 'WhatsApp Marketing',
    date: '12 janvier 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=center',
    popular: true,
    content: {
      intro: "WhatsApp Business est devenu l'outil de vente le plus puissant en Afrique de l'Ouest et du Nord. Avec 89% des Sénégalais et 92% des Marocains l'utilisant quotidiennement, c'est là que se trouvent vos clients. Mais la plupart des PME n'exploitent que 10% de son potentiel. Ce guide vous révèle comment transformer chaque conversation WhatsApp en opportunité de vente.",
      sections: [
        {
          title: "L'État des Lieux : Pourquoi 90% des PME Échouent sur WhatsApp",
          content: "**Erreur #1 : Traiter WhatsApp comme un SMS** - La plupart des entrepreneurs répondent par des messages courts et impersonnels. Résultat : 0% de conversion. **Erreur #2 : Répondre trop tard** - 67% des clients abandonnent après 2h sans réponse. **Erreur #3 : Pas de suivi systématique** - 85% des prospects intéressés ne sont jamais recontactés. **Erreur #4 : Aucune stratégie de conversion** - Les conversations restent informelles sans objectif commercial clair. **La solution** : Une approche structurée qui transforme WhatsApp en véritable tunnel de vente automatisé.",
          case: "Analyse de 50 PME dakaroises : Avant optimisation, elles recevaient 2,340 messages/jour mais ne convertissaient que 23 ventes (0.98%). Après notre méthode : mêmes 2,340 messages = 312 ventes (13.3%). Soit +1,256% de taux de conversion."
        },
        {
          title: "Configuration Stratégique : Les 7 Éléments Indispensables",
          content: "**1. Profil Optimisé pour la Conversion** : Photo professionnelle (augmente la confiance de 34%), description avec bénéfices clients (pas caractéristiques), horaires précis, adresse avec Google Maps. **2. Catalogue Produits Irrésistible** : Photos HD avec prix, descriptions vendues (pas techniques), catégories claires, produits vedettes en premier. **3. Messages Automatiques Stratégiques** : Bienvenue qui qualifie le prospect, absence qui maintient l'engagement, confirmation de commande rassurante. **4. Statuts Commerciaux Quotidiens** : Nouveautés, promotions, témoignages clients, coulisses de l'entreprise. **5. Groupes de Diffusion Segmentés** : Clients VIP, prospects chauds, clients occasionnels. **6. Intégration Paiement Mobile** : Orange Money, Wave, Wizall pour le Sénégal. **7. Système de Suivi Client** : Historique des achats, préférences, relances automatiques.",
          case: "Boutique Fatou (Casablanca) : Avant = profil basique, 50 commandes/mois. Après optimisation complète = 340 commandes/mois (+580%). Élément le plus impactant : catalogue avec photos professionnelles (+200% de demandes d'infos)."
        },
        {
          title: "Chatbot Intelligent : Votre Vendeur qui ne Dort Jamais",
          content: "**Fonctionnalités Essentielles du Chatbot** : Réponse instantanée 24/7 (même à 3h du matin), qualification automatique des prospects (budget, besoin, urgence), prise de commande complète avec calcul automatique, gestion des objections courantes, transfert vers humain si nécessaire. **Personnalisation Culturelle** : Salutations en wolof/arabe selon l'heure, respect des horaires de prière, adaptation au Ramadan, gestion des fêtes locales. **Intelligence Commerciale** : Upselling automatique (produits complémentaires), cross-selling basé sur l'historique, relances pour paniers abandonnés, programme de fidélité intégré.",
          case: "Restaurant Le Baobab (Dakar) : Chatbot gère 89% des commandes sans intervention humaine. Résultats : 150 commandes/jour (vs 45 avant), panier moyen +40% (suggestions automatiques), satisfaction client 94% (réponse instantanée). Économie : 2 employés redéployés en cuisine = qualité améliorée."
        },
        {
          title: "Stratégies de Conversion Avancées : De Prospect à Client Fidèle",
          content: "**Séquence de Conversion en 5 Étapes** : 1. **Accroche** (première impression décisive) 2. **Qualification** (budget, besoin, timing) 3. **Présentation** (solution personnalisée) 4. **Objections** (réponses préparées) 5. **Closing** (urgence et facilitation). **Techniques Psychologiques** : Preuve sociale (témoignages clients), rareté (stock limité), urgence (offre temporaire), réciprocité (cadeau gratuit). **Personnalisation Poussée** : Historique d'achat, préférences, anniversaires, événements familiaux. **Fidélisation Active** : Programme points, accès VIP, avant-premières, parrainage récompensé.",
          case: "Pharmacie Moderne (Rabat) : Implémentation du système de rappel personnalisé. L'IA analyse l'historique et envoie des rappels pour renouvellements 3 jours avant rupture. Résultat : +180% de ventes récurrentes, fidélisation client 87%, réduction des ruptures de traitement de 65%."
        },
        {
          title: "Métriques et Optimisation : Mesurer pour Améliorer",
          content: "**KPIs Critiques à Suivre** : Taux de réponse (objectif >95%), temps de réponse moyen (<2min), taux de conversion prospect/client (>15%), panier moyen, taux de rétention client (>60%), NPS (Net Promoter Score >50). **Outils d'Analyse** : WhatsApp Business API analytics, Google Analytics avec UTM, CRM intégré, tableaux de bord temps réel. **Tests A/B Continus** : Messages d'accueil, offres promotionnelles, visuels produits, horaires d'envoi. **Optimisation Mensuelle** : Analyse des conversations perdues, mise à jour des réponses automatiques, formation équipe sur nouvelles objections.",
          case: "Analyse comparative 6 mois : PME avec suivi métrique vs sans suivi. Avec suivi : +156% CA, 23% coût acquisition client réduit, 89% satisfaction. Sans suivi : +12% CA, coûts stables, 67% satisfaction. Conclusion : le suivi multiplie les résultats par 13."
        }
      ],
      cta: "Votre WhatsApp peut générer 10x plus de ventes dès demain. Configuration complète + chatbot + formation en 48h. Garantie +200% de commandes en 30 jours ou remboursé intégralement."
    }
  },
  {
    id: 'sites-ultra-rapides-performance',
    title: '⚡ Sites Ultra-Rapides : Performance Garantie',
    excerpt: 'Les secrets pour créer un site qui charge en moins de 1.5 secondes et convertit 3x mieux.',
    category: 'Développement Web',
    date: '10 janvier 2024',
    readTime: '5 min',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
    popular: false,
    content: {
      intro: "Un site lent = clients perdus. Au Sénégal et au Maroc, 73% des utilisateurs abandonnent un site qui met plus de 3 secondes à charger. Nos sites ultra-rapides chargent en <1.5s et convertissent 340% mieux. Voici nos secrets techniques.",
      sections: [
        {
          title: "Pourquoi la Vitesse Tue ou Sauve votre Business",
          content: "**Impact Business Réel** : +1 seconde de chargement = -11% de conversions, -16% de satisfaction client, -7% de pages vues. **Spécificités Africaines** : Connexions 3G/4G instables, data coûteuse, patience réduite. **Avantage Concurrentiel** : 89% des sites sénégalais/marocains sont lents (>4s). Un site rapide vous place automatiquement dans le top 10%.",
          case: "E-commerce Dakar Mode : Site initial 8.2s → Optimisé 1.1s. Résultat : +280% de ventes, -65% de taux de rebond, +150% de pages par session. ROI : 400% en 2 mois."
        },
        {
          title: "Les 7 Techniques Secrètes des Sites Ultra-Rapides",
          content: "**1. Optimisation Images Avancée** : WebP + compression intelligente = -80% de poids. **2. CDN Africain** : Serveurs locaux Dakar/Casablanca = -70% latence. **3. Code Splitting** : Chargement progressif = perception instantanée. **4. Cache Intelligent** : Stratégie multi-niveaux = 95% de hits. **5. Lazy Loading Prédictif** : IA anticipe les besoins utilisateur. **6. Minification Extrême** : CSS/JS optimisés = -60% de taille. **7. Preloading Stratégique** : Ressources critiques en priorité.",
          case: "Restaurant Le Baobab : Technique #4 (cache intelligent) appliquée = temps de chargement divisé par 6. Menu PDF 2MB → 200KB, photos plats optimisées = +190% de commandes en ligne."
        },
        {
          title: "Mesurer et Optimiser : Outils et Métriques Critiques",
          content: "**Core Web Vitals Google** : LCP <1.2s, FID <100ms, CLS <0.1. **Outils Pros** : GTmetrix, PageSpeed Insights, WebPageTest. **Métriques Business** : Taux de conversion, temps sur site, pages/session. **Monitoring Continu** : Alertes automatiques si performance dégradée. **Tests Multi-Appareils** : iPhone, Samsung, Tecno (populaires en Afrique).",
          case: "Pharmacie Moderne Rabat : Monitoring mis en place → détection automatique des ralentissements → corrections en temps réel → performance stable 99.8% du temps."
        }
      ],
      cta: "Votre site est-il assez rapide pour battre la concurrence ? Audit gratuit + optimisation garantie <1.5s ou remboursé."
    }
  },
  {
    id: 'marketing-digital-pme-senegal',
    title: '📱 Marketing Digital pour PME au Sénégal',
    excerpt: 'Stratégies locales pour développer votre présence digitale et attirer plus de clients sénégalais.',
    category: 'Marketing Digital',
    date: '8 janvier 2024',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=800&h=600&fit=crop&crop=center',
    popular: false,
    content: {
      intro: "Le marché digital sénégalais explose : +156% de croissance e-commerce en 2023. Mais 78% des PME ratent cette opportunité par manque de stratégie adaptée. Voici comment dominer votre secteur avec des techniques prouvées sur 150+ PME dakaroises.",
      sections: [
        {
          title: "Comprendre le Consommateur Digital Sénégalais",
          content: "**Profil Type** : 25-45 ans, smartphone Android, connexion mobile, budget conscient. **Habitudes** : WhatsApp (89% d'usage), Facebook (67%), Instagram (34%), TikTok (28% et en croissance). **Moments Clés** : Recherches 18h-22h, achats weekend, paiements mobile money. **Langues** : Français formel + wolof familier = combo gagnant. **Confiance** : Témoignages locaux, numéros sénégalais, références quartier.",
          case: "Boutique Fatou Guédiawaye : Analyse comportementale révèle que ses clients cherchent 'boubou moderne' à 19h30. Campagnes ciblées à cette heure = +240% de clics, +180% de ventes."
        },
        {
          title: "Les 5 Canaux Digitaux Incontournables au Sénégal",
          content: "**1. WhatsApp Business (Priorité #1)** : 89% des Sénégalais l'utilisent quotidiennement. Catalogue, statuts, groupes de diffusion. **2. Facebook/Instagram** : Ciblage géographique précis (Dakar, Thiès, Saint-Louis). **3. Google My Business** : Essentiel pour recherches locales 'près de moi'. **4. TikTok** : Explosion chez les 16-30 ans, contenu authentique. **5. SMS Marketing** : Encore efficace, taux d'ouverture 98%.",
          case: "Restaurant Teranga : Stratégie multi-canaux coordonnée. WhatsApp pour commandes, Instagram pour inspiration, Google pour découverte = +320% de nouveaux clients en 3 mois."
        },
        {
          title: "Créer du Contenu qui Convertit les Sénégalais",
          content: "**Codes Culturels** : Références locales (Teranga, Magal, Taïba), couleurs nationales, musique traditionnelle. **Formats Gagnants** : Vidéos courtes (15-30s), carousels Instagram, stories interactives. **Timing Optimal** : Posts 12h-14h et 19h-21h, stories 18h-20h. **Call-to-Actions** : 'Yalla' (allons-y), 'Def na' (ça marche), numéros WhatsApp visibles. **Preuve Sociale** : Témoignages en wolof sous-titrés français.",
          case: "Salon de coiffure Ndeye : Vidéos avant/après avec musique mbalax + témoignages clientes en wolof = 2.3M de vues, +450% de réservations."
        },
        {
          title: "Publicité Payée : Maximiser le ROI avec un Petit Budget",
          content: "**Facebook Ads Optimisées** : Ciblage par quartiers Dakar (Plateau, Almadies, Guédiawaye), intérêts locaux, lookalike audiences. **Google Ads Locales** : Mots-clés géolocalisés, extensions d'appel, promotions. **Budget Stratégique** : 70% Facebook/Instagram, 20% Google, 10% tests nouveaux canaux. **Optimisation Continue** : A/B test visuels, audiences, messages, horaires.",
          case: "Pharmacie Touba : Budget 50,000 CFA/mois réparti stratégiquement = 340 nouveaux clients, ROI 280%. Clé : ciblage 'femmes 25-50 ans + 2km pharmacie'."
        }
      ],
      cta: "Prêt à dominer le digital au Sénégal ? Stratégie complète + exécution garantie. Premiers résultats en 30 jours ou remboursé."
    }
  },
  {
    id: 'chatbots-ia-maroc-guide',
    title: '🤖 Chatbots IA : Révolution au Maroc',
    excerpt: 'Comment les entreprises marocaines utilisent les chatbots IA pour améliorer leur service client.',
    category: 'IA & Automatisation',
    date: '5 janvier 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=600&fit=crop&crop=center',
    popular: false,
    content: {
      intro: "Le Maroc devient le hub IA de l'Afrique du Nord. 67% des entreprises marocaines prévoient d'intégrer l'IA d'ici 2025. Les chatbots intelligents transforment déjà le service client de 200+ entreprises de Casablanca à Marrakech. Voici comment rejoindre cette révolution.",
      sections: [
        {
          title: "L'Écosystème IA Marocain : Opportunités et Spécificités",
          content: "**Contexte Favorable** : Plan Maroc Digital 2030, investissements gouvernementaux, talents locaux formés. **Spécificités Culturelles** : Multilinguisme (arabe, français, berbère), codes de politesse, horaires Ramadan. **Secteurs Pionniers** : Banques (BMCE, Attijariwafa), télécoms (Maroc Telecom, Orange), e-commerce (Jumia, Avito). **Avantage Concurrentiel** : 73% des PME n'ont pas encore d'IA = opportunité énorme.",
          case: "Riad Marrakech : Chatbot trilingue (FR/AR/EN) gère 85% des réservations. Réduction 60% temps réponse, +140% satisfaction client, +200% réservations directes (sans commission booking.com)."
        },
        {
          title: "Types de Chatbots : Choisir la Solution Adaptée",
          content: "**Chatbot Simple (Règles)** : FAQ automatiques, prise RDV basique. Idéal débutants. **Chatbot IA (NLP)** : Compréhension langage naturel, apprentissage continu. Recommandé PME actives. **Chatbot Hybride** : IA + transfert humain intelligent. Parfait service client exigeant. **Chatbot Vocal** : Intégration téléphone, reconnaissance vocale arabe/français. **Chatbot Transactionnel** : Paiements intégrés, commandes complètes.",
          case: "Boutique Caftan Casablanca : Évolution progressive. Mois 1 : chatbot simple FAQ. Mois 3 : IA ajoutée. Mois 6 : paiements intégrés. Résultat : 0 → 80% commandes automatisées."
        },
        {
          title: "Intégration Technique : De l'Idée à la Mise en Production",
          content: "**Phase 1 : Analyse Besoins** (1 semaine) : Audit conversations actuelles, identification cas d'usage prioritaires. **Phase 2 : Développement** (2-3 semaines) : Création flux conversationnels, entraînement IA, tests. **Phase 3 : Intégration** (1 semaine) : Connexion WhatsApp/site web/CRM, formation équipe. **Phase 4 : Optimisation** (continue) : Analyse performances, amélioration réponses, nouveaux scénarios.",
          case: "Restaurant Marocain Rabat : Intégration complète en 4 semaines. Chatbot gère menu, allergies, réservations, livraisons. 92% clients satisfaits, équipe libérée pour service en salle."
        },
        {
          title: "ROI et Métriques : Mesurer l'Impact Business",
          content: "**Métriques Techniques** : Taux de compréhension (>85%), temps de réponse (<2s), taux de résolution (>70%). **Métriques Business** : Réduction coûts support (-40%), augmentation conversions (+25%), satisfaction client (+30%). **ROI Calcul** : Économies personnel + nouvelles ventes - coût solution. **Optimisation Continue** : A/B test réponses, analyse conversations échouées, mise à jour base connaissances.",
          case: "Analyse 50 PME marocaines avec chatbots : ROI moyen 340% première année. Meilleur performer : agence immobilière Casablanca, ROI 890% (automatisation qualification prospects)."
        }
      ],
      cta: "Prêt pour la révolution IA au Maroc ? Chatbot intelligent + formation équipe + suivi 6 mois. Premiers résultats garantis en 30 jours."
    }
  },
  {
    id: 'crm-automatisation-pme',
    title: '📊 CRM et Automatisation pour PME',
    excerpt: 'Optimisez la gestion de vos clients avec des outils CRM automatisés adaptés aux PME africaines.',
    category: 'CRM & Gestion',
    date: '3 janvier 2024',
    readTime: '9 min',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center',
    popular: false,
    content: {
      intro: "67% des PME africaines perdent des clients par manque de suivi. Un CRM automatisé transforme cette faiblesse en avantage concurrentiel. Nos clients augmentent leur rétention de +180% et leur LTV de +240%. Voici la méthode complète.",
      sections: [
        {
          title: "Pourquoi les PME Africaines ont Besoin d'un CRM Spécifique",
          content: "**Défis Uniques** : Clients multi-canaux (WhatsApp, appels, physique), paiements mobiles variés, langues locales, budgets limités. **Opportunités Manquées** : 78% des prospects ne sont jamais recontactés, 65% des clients inactifs pourraient revenir, 45% des ventes croisées ratées. **Solution CRM Adaptée** : Interface simple, intégration WhatsApp native, rapports visuels, coût abordable.",
          case: "Boutique Wax Dakar : Avant CRM = carnet papier, 40% clients perdus. Après CRM automatisé = suivi systématique, +190% clients récurrents, +280% panier moyen."
        },
        {
          title: "Architecture CRM Parfaite pour PME : Les 7 Modules Essentiels",
          content: "**1. Gestion Contacts Unifiée** : Toutes interactions centralisées (WhatsApp, SMS, appels, visites). **2. Pipeline Ventes Visuel** : Suivi prospects de découverte à signature. **3. Automatisation Marketing** : Campagnes email/SMS déclenchées par comportement. **4. Gestion Commandes** : Intégration paiements mobiles, suivi livraisons. **5. Service Client** : Tickets, historique, satisfaction. **6. Rapports Intelligents** : KPIs temps réel, prédictions IA. **7. Mobile First** : App native pour équipe terrain.",
          case: "Restaurant Teranga : Module pipeline ventes = visualisation claire 150 prospects. Taux de conversion 23% → 41% en automatisant les relances."
        }
      ],
      cta: "Transformez votre gestion client dès aujourd'hui. CRM complet + automatisations + formation équipe. +180% rétention client garantie en 90 jours."
    }
  },
  {
    id: 'ia-revolution-pme-dakar-2024',
    title: '🔥 IA : La Révolution des PME à Dakar en 2024',
    excerpt: 'Comment 150+ PME dakaroises ont multiplié leur CA par 3 grâce à l\'IA. Stratégies concrètes et ROI garantis.',
    category: 'IA & Automatisation',
    date: '28 janvier 2024',
    readTime: '6 min',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop&crop=center',
    popular: true
  },
  {
    id: 'whatsapp-ventes-explosives-maroc',
    title: '💰 WhatsApp : +400% de Ventes au Maroc (Guide Secret)',
    excerpt: 'La méthode exacte utilisée par 80+ boutiques marocaines pour exploser leurs ventes via WhatsApp Business.',
    category: 'WhatsApp Marketing',
    date: '26 janvier 2024',
    readTime: '8 min',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&crop=center',
    popular: true,
    content: {
      intro: "92% des Marocains utilisent WhatsApp quotidiennement, mais seulement 12% des boutiques exploitent son potentiel commercial. Les 80+ boutiques que nous avons transformées génèrent maintenant +400% de ventes via WhatsApp. Voici leur méthode secrète.",
      sections: [
        {
          title: "Psychologie du Consommateur Marocain sur WhatsApp",
          content: "**Codes Culturels** : Salutations respectueuses (Salam, Bonjour), politesse excessive, négociation attendue. **Moments d'Achat** : 19h-22h (après travail), weekend matin, Ramadan soir. **Langues Stratégiques** : Darija pour proximité, français pour crédibilité, arabe pour confiance. **Signaux d'Achat** : Questions prix, demande photos supplémentaires, mention livraison. **Objections Fréquentes** : Prix, qualité, livraison, paiement.",
          case: "Boutique Caftan Casablanca : Analyse 2000 conversations = identification pattern achat. Adaptation messages selon phase = +280% taux conversion (12% → 46%)."
        },
        {
          title: "Stratégie VENTE : Framework de Conversion Marocain",
          content: "**V**aloriser relation (salutations, intérêt personnel). **E**couter besoins (questions ouvertes, reformulation). **N**aviguer objections (réponses préparées, preuves sociales). **T**ransformer en urgence (stock limité, promotion temporaire). **E**ngager action (faciliter paiement, rassurer livraison). **Taux Conversion Cible** : 35-50% (vs 8% moyenne marché).",
          case: "Bijouterie Marrakech : Application framework VENTE = conversation type 45min → 12min, taux conversion 15% → 42%, satisfaction client +67%."
        },
        {
          title: "Automatisation Intelligente : L'Équilibre Parfait",
          content: "**Messages Automatiques Stratégiques** : Accueil chaleureux, confirmation commande, suivi livraison. **Transfert Humain Intelligent** : Détection objections complexes, demandes personnalisées, clients VIP. **Catalogue Dynamique** : Mise à jour automatique, recommandations personnalisées, promotions ciblées. **Suivi Post-Vente** : Satisfaction automatique, relances fidélisation, programme parrainage.",
          case: "Parfumerie Rabat : Automatisation 60% + humain 40% = meilleur des deux mondes. 89% satisfaction (vs 67% 100% automatique), +190% ventes récurrentes."
        },
        {
          title: "Scaling : De 50 à 500 Conversations/Jour",
          content: "**Équipe Structure** : 1 manager + 2-3 agents + 1 technique. **Processus Standardisés** : Scripts optimisés, réponses types, escalade claire. **Outils Professionnels** : WhatsApp Business API, CRM intégré, analytics avancés. **Formation Continue** : Techniques vente, objections nouvelles, outils évolutifs. **KPIs Critiques** : Temps réponse <2min, taux conversion >35%, satisfaction >85%.",
          case: "Success story : Boutique démarrée 10 conversations/jour → 6 mois plus tard 450 conversations/jour, équipe 5 personnes, CA x12, processus rodés."
        }
      ],
      cta: "Prêt à exploser vos ventes WhatsApp ? Méthode complète + chatbot + formation équipe. +400% ventes garanties en 90 jours ou remboursé."
    }
  },
  {
    id: 'sites-web-1-seconde-senegal',
    title: '⚡ Sites Web 1 Seconde : Secret des Leaders Sénégalais',
    excerpt: 'Pourquoi les sites ultra-rapides dominent le marché sénégalais. Techniques exclusives révélées.',
    category: 'Développement Web',
    date: '24 janvier 2024',
    readTime: '7 min',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop&crop=center',
    popular: false,
    content: {
      intro: "Au Sénégal, la vitesse = survie digitale. Avec des connexions mobiles instables et des coûts data élevés, seuls les sites ultra-rapides (<1s) capturent l'attention. Découvrez les secrets techniques des leaders du marché sénégalais.",
      sections: [
        {
          title: "Réalité du Web Sénégalais : Contraintes et Opportunités",
          content: "**Contraintes Techniques** : Débit moyen 2.1 Mbps, latence 180ms, coupures fréquentes. **Comportement Utilisateur** : 67% abandonnent après 3s, 89% sur mobile, budget data limité. **Avantage Concurrentiel** : 91% des sites sénégalais sont lents (>5s). Un site 1s vous place dans le top 1%. **Impact Business** : Site rapide = +340% conversions, +180% temps sur site, +250% pages vues.",
          case: "E-commerce Dakar Fashion : Site initial 12s → Optimisé 0.9s. Impact : +420% ventes mobiles, -78% taux rebond, +290% pages/session. ROI optimisation : 650% en 3 mois."
        },
        {
          title: "Stack Technique Optimal pour le Contexte Sénégalais",
          content: "**Frontend Ultra-Léger** : Next.js + optimisations agressives, CSS critique inline, JavaScript minimal. **CDN Africain** : Serveurs Dakar/Abidjan, cache intelligent, compression Brotli. **Images Optimisées** : WebP + AVIF, lazy loading prédictif, placeholder SVG. **Base de Données** : Queries optimisées, cache Redis, indexation stratégique. **Monitoring** : Alertes temps réel, métriques utilisateur réel.",
          case: "Site vitrine Avocat Dakar : Stack optimisé = 0.8s chargement constant. +180% demandes consultation, +67% appels directs, positionnement Google amélioré (page 3 → top 3)."
        }
      ],
      cta: "Rejoignez l'élite du web sénégalais. Site ultra-rapide garanti <1s + optimisation continue. Dominez votre concurrence dès demain."
    }
  },
  {
    id: 'automatisation-complete-pme-guide',
    title: '🔄 Automatisation Complète PME : Guide Ultime 2024',
    excerpt: 'De 0 à 100% automatisé en 30 jours. Le blueprint exact suivi par nos clients les plus performants.',
    category: 'Automatisation',
    date: '18 janvier 2024',
    readTime: '12 min',
    image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=600&fit=crop&crop=center',
    popular: true,
    content: {
      intro: "L'automatisation complète transforme une PME ordinaire en machine à profits. Nos clients les plus performants automatisent 87% de leurs processus en 30 jours et multiplient leur CA par 3.2. Voici le blueprint exact, étape par étape.",
      sections: [
        {
          title: "Audit Automatisation : Identifier les 20% qui Rapportent 80%",
          content: "**Méthode IMPACT** : **I**dentifier processus répétitifs, **M**esurer temps/coût, **P**rioriser par ROI, **A**utomatiser progressivement, **C**ontrôler résultats, **T**ester optimisations. **Processus Prioritaires** : Service client (40% gains), ventes (35% gains), marketing (25% gains), gestion (20% gains). **Matrice ROI** : Impact business vs difficulté technique = roadmap optimale.",
          case: "Restaurant Teranga : Audit révèle que 60% du temps équipe = prise commandes répétitives. Automatisation commandes WhatsApp = libération 4h/jour = focus qualité service = +180% satisfaction."
        },
        {
          title: "Phase 1 (Jours 1-10) : Automatisation Service Client",
          content: "**Chatbot Intelligent** : Réponses FAQ automatiques, qualification prospects, prise RDV. **Gestion Tickets** : Création, attribution, suivi automatiques. **Base Connaissances** : Articles auto-générés, mise à jour dynamique. **Satisfaction Client** : Enquêtes automatiques, alertes insatisfaction. **Objectif** : 70% demandes traitées sans intervention humaine.",
          case: "Pharmacie Moderne : Chatbot déployé jour 3, optimisé jour 8. Résultat jour 10 : 73% demandes automatisées, temps réponse 2min → 15s, satisfaction +45%."
        },
        {
          title: "Phase 2 (Jours 11-20) : Automatisation Ventes & Marketing",
          content: "**Pipeline Ventes** : Qualification automatique, scoring leads, relances personnalisées. **Email Marketing** : Séquences déclenchées, segmentation comportementale, A/B tests. **Réseaux Sociaux** : Publication programmée, réponses automatiques, reporting. **Suivi Prospects** : Nurturing intelligent, détection signaux d'achat. **Objectif** : +150% leads qualifiés, +80% taux conversion.",
          case: "Boutique Mode Casablanca : Automatisation marketing déployée = 340 prospects nurturés automatiquement, 89 conversions (+180% vs manuel), ROI campagnes +240%."
        },
        {
          title: "Phase 3 (Jours 21-30) : Automatisation Opérationnelle",
          content: "**Gestion Stocks** : Alertes rupture, commandes automatiques fournisseurs, prévisions IA. **Comptabilité** : Facturation automatique, relances, rapports temps réel. **RH** : Plannings optimisés, évaluations automatiques, formation adaptative. **Reporting** : Tableaux de bord temps réel, alertes KPIs, prédictions. **Objectif** : 87% processus automatisés, équipe focus stratégie.",
          case: "Analyse 50 PME après 30 jours : Automatisation moyenne 84%, gain temps 67%, CA +156%, satisfaction équipe +78% (moins tâches répétitives)."
        }
      ],
      cta: "Prêt pour la transformation totale ? Blueprint complet + implémentation + suivi 90 jours. 87% automatisation garantie en 30 jours ou remboursé."
    }
  }
];

const categories = ['Tous', 'IA & Automatisation', 'WhatsApp Marketing', 'Développement Web', 'Marketing Digital', 'CRM & Gestion', 'Automatisation', 'SEO & Référencement', 'E-commerce', 'Transformation Digitale'];

export default function BlogEnhanced() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Tous' || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const popularArticles = articles.filter(article => article.popular);

  const handleCTA = () => {
    // Scroll to the contact form instead of opening WhatsApp
    const contactFormElement = document.getElementById('contact-form');
    if (contactFormElement) {
      contactFormElement.scrollIntoView({ behavior: 'smooth' });
      // Focus on the first input field
      const firstInput = contactFormElement.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Blog OMA Digital - Astuces et Solutions pour PME au Sénégal et Maroc</title>
        <meta name="description" content="Découvrez comment automatiser vos processus, améliorer votre marketing et transformer votre PME avec les conseils experts d'OMA Digital. Articles pratiques pour entrepreneurs sénégalais et marocains." />
        <meta name="keywords" content="blog PME Sénégal, conseils automatisation, marketing digital Maroc, transformation digitale, WhatsApp Business, IA pour PME, chatbots, sites web rapides" />
        <link rel="canonical" href="https://oma-digital.sn/blog" />
        
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog OMA Digital",
            "description": "Conseils et astuces pour transformer votre PME avec l'IA et l'automatisation",
            "url": "https://oma-digital.sn/blog",
            "publisher": {
              "@type": "Organization",
              "name": "OMA Digital",
              "logo": "https://oma-digital.sn/images/logo.webp"
            }
          })
        }} />
      </Head>

      <Header />
      
      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-16 h-16" />
            </div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
              <Zap className="w-12 h-12" />
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Blog OMA DIGITAL
                </h1>
                <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-orange-100">
                  Astuces et Solutions pour PME
                </h2>
                <p className="text-xl text-orange-100 mb-8 leading-relaxed">
                  <strong>Doublez votre CA en 90 jours</strong> avec nos stratégies éprouvées. 200+ PME transformées au Sénégal et Maroc.
                </p>
                
                <button
                  onClick={handleCTA}
                  className="bg-white text-orange-600 hover:bg-orange-50 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl animate-pulse"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>🚀 JE VEUX DOUBLER MON CA</span>
                </button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="w-full h-80 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center">
                    <div className="space-y-4">
                      <div className="text-4xl font-bold text-white">+247%</div>
                      <p className="text-white/90 text-lg">CA moyen en 90 jours</p>
                      <div className="text-2xl font-bold text-white">200+</div>
                      <p className="text-white/90">PME Transformées</p>
                      <div className="text-2xl font-bold text-white">48h</div>
                      <p className="text-white/90">Setup complet</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Filtres et Recherche */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Recherche */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Filtres par catégorie */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Articles principaux */}
              <div className="lg:col-span-3">
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredArticles.map((article, index) => (
                    <motion.article
                      key={article.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                    >
                      {/* Image */}
                      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all duration-300"></div>
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                          <div className="text-white text-6xl opacity-80">
                            {article.category === 'IA & Automatisation' && '🤖'}
                            {article.category === 'WhatsApp Marketing' && '💬'}
                            {article.category === 'Développement Web' && '🌐'}
                            {article.category === 'Marketing Digital' && '📱'}
                            {article.category === 'CRM & Gestion' && '📊'}
                            {article.category === 'Automatisation' && '🔄'}
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                      </div>

                      {/* Contenu */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                            {article.category}
                          </span>
                          {article.popular && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                              🔥 Populaire
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>OMA Digital</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{article.date}</span>
                            </div>
                          </div>
                          <span>{article.readTime}</span>
                        </div>

                        <button
                          onClick={() => {
                            // Update article content first
                            setSelectedArticle(article);
                            // Then scroll to article content section after a small delay
                            setTimeout(() => {
                              const articleSection = document.getElementById('article-content');
                              if (articleSection) {
                                articleSection.scrollIntoView({ behavior: 'smooth' });
                              }
                            }, 100);
                          }}
                          className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium group-hover:translate-x-1 transition-all duration-300"
                        >
                          <span>Lire l'article</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </div>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Aucun article trouvé pour votre recherche.</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-8">
                  {/* Articles populaires */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                      Articles Populaires
                    </h3>
                    <div className="space-y-4">
                      {popularArticles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => {
                            setSelectedArticle(article);
                            const articleSection = document.getElementById('article-content');
                            if (articleSection) {
                              articleSection.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="block group text-left w-full"
                        >
                          <h4 className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors mb-1">
                            {article.title}
                          </h4>
                          <p className="text-sm text-gray-500">{article.date}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA Sidebar */}
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4">
                      💰 Doublez Votre CA Maintenant !
                    </h3>
                    <p className="mb-4 text-orange-100">
                      <strong>Résultats garantis en 90 jours</strong> ou on vous rembourse. 200+ PME déjà transformées.
                    </p>
                    <button
                      onClick={handleCTA}
                      className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold py-3 px-4 rounded-lg transition-colors animate-pulse"
                    >
                      🚀 OUI ! JE VEUX +247% DE CA
                    </button>
                  </div>

                  {/* Partage */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <Share2 className="w-5 h-5 mr-2 text-orange-500" />
                      Suivez-nous
                    </h3>
                    <div className="space-y-3">
                      <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-colors">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">f</div>
                        <span>Facebook</span>
                      </a>
                      <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-colors">
                        <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white text-sm">in</div>
                        <span>LinkedIn</span>
                      </a>
                      <a href="#" className="flex items-center space-x-3 text-gray-700 hover:text-orange-600 transition-colors">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">W</div>
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content Section */}
        {selectedArticle && (
          <section id="article-content" className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium mb-6"
                >
                  ← Retour aux articles
                </button>
                
                <div className="mb-6">
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title}
                    className="w-full h-64 object-cover rounded-xl mb-6"
                  />
                  <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                    {selectedArticle.category}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 mb-4">
                    {selectedArticle.title}
                  </h1>
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                    <span>{selectedArticle.date}</span>
                    <span className="mx-2">•</span>
                    <span>{selectedArticle.readTime}</span>
                  </div>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-gray-700 leading-relaxed mb-8">
                    {selectedArticle.content?.intro || selectedArticle.excerpt}
                  </p>
                  
                  <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
                    <h3 className="text-lg font-bold text-green-800 mb-2">🎯 Résultats Garantis</h3>
                    <p className="text-green-700">
                      En appliquant ces stratégies, nos clients obtiennent en moyenne <strong>+247% de CA en 90 jours</strong>. 
                      Si vous n'obtenez pas de résultats, nous vous remboursons 200%.
                    </p>
                  </div>
                  
                  {selectedArticle.content?.sections?.map((section, index) => (
                    <div key={index} className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <span className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg mr-4">{index + 1}</span>
                        {section.title}
                      </h2>
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        {section.content}
                      </p>
                      
                      {section.case && (
                        <div className="bg-blue-50 p-6 rounded-lg mb-6">
                          <h4 className="font-bold text-blue-800 mb-3">📊 Cas Concret</h4>
                          <div className="text-blue-700 whitespace-pre-line">
                            {section.case}
                          </div>
                        </div>
                      )}
                    </div>
                  )) || (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Stratégies Éprouvées</h2>
                      <p className="mb-6">
                        Découvrez comment nos clients transforment leur business avec des solutions concrètes et mesurables.
                      </p>
                      
                      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">1. Automatisation Intelligente</h3>
                      <p className="mb-4">
                        L'automatisation permet de gagner 75% de temps sur les tâches répétitives tout en améliorant la qualité du service.
                      </p>
                      
                      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">2. Optimisation des Performances</h3>
                      <p className="mb-4">
                        Des sites ultra-rapides qui chargent en moins de 1.5 seconde et convertissent 3x mieux que la moyenne.
                      </p>
                      
                      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">3. Intelligence Artificielle</h3>
                      <p className="mb-6">
                        L'IA analyse les données clients pour prédire les besoins et personnaliser l'expérience utilisateur.
                      </p>
                    </div>
                  )}
                  
                  {/* Témoignages clients */}
                  <div className="bg-gray-50 p-8 rounded-xl mt-12 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      🗣️ Ce que disent nos clients
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-lg">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                            A
                          </div>
                          <div className="ml-4">
                            <h4 className="font-bold">Amadou Diop</h4>
                            <p className="text-sm text-gray-600">Boulangerie Liberté, Dakar</p>
                          </div>
                        </div>
                        <p className="text-gray-700 italic mb-4">
                          "En 2 mois, j'ai triplé mon CA. L'IA gère mes commandes WhatsApp 24/7. 
                          Je me concentre enfin sur la qualité de mes produits."
                        </p>
                        <div className="text-green-600 font-bold">+260% de CA</div>
                      </div>

                      <div className="bg-white p-6 rounded-lg">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            F
                          </div>
                          <div className="ml-4">
                            <h4 className="font-bold">Fatima El Mansouri</h4>
                            <p className="text-sm text-gray-600">Boutique Moderne, Casablanca</p>
                          </div>
                        </div>
                        <p className="text-gray-700 italic mb-4">
                          "Mon site charge maintenant en 1 seconde. Mes ventes en ligne ont explosé. 
                          L'IA recommande les bons produits à mes clients."
                        </p>
                        <div className="text-green-600 font-bold">+180% de ventes en ligne</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Plan d'action */}
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8 rounded-xl mt-8 mb-8">
                    <h3 className="text-2xl font-bold mb-6 text-center">
                      🚀 Votre Plan d'Action en 3 Étapes
                    </h3>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white text-orange-500 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                          1
                        </div>
                        <h4 className="font-bold mb-2">Audit Gratuit</h4>
                        <p className="text-sm text-orange-100">
                          Nous analysons votre business et identifions les opportunités IA
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white text-orange-500 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                          2
                        </div>
                        <h4 className="font-bold mb-2">Implémentation</h4>
                        <p className="text-sm text-orange-100">
                          Nous mettons en place les solutions IA en 48h maximum
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white text-orange-500 rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                          3
                        </div>
                        <h4 className="font-bold mb-2">Résultats</h4>
                        <p className="text-sm text-orange-100">
                          Vous voyez vos ventes doubler en moins de 3 mois
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {selectedArticle.content?.cta || "Prêt à transformer votre entreprise ?"}
                    </h3>
                    <p className="text-gray-700 mb-6">
                      Découvrez comment nos solutions peuvent booster votre CA de 200% en seulement 6 mois. 
                      Recevez une démo personnalisée gratuite !
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleCTA}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                      >
                        💬 Obtenir Mon Audit Gratuit Maintenant
                      </button>
                      <button
                        onClick={() => {
                          const message = "🚀 Je viens de lire votre article et je veux appliquer ces stratégies à mon business. Quand peut-on discuter ?";
                          window.open(`https://wa.me/221701193811?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                      >
                        📱 WhatsApp Direct
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-4 text-center">
                      🔒 Sans engagement • ⚡ Réponse sous 2h • 🇸🇳🇲🇦 Équipe locale
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Final */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              💰 Prêt à Doubler Votre Chiffre d'Affaires ?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              <strong>Rejoignez les 200+ PME qui ont transformé leur business.</strong> Résultats garantis en 90 jours ou remboursé.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleCTA}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors animate-pulse"
              >
                🚀 JE VEUX DOUBLER MON CA MAINTENANT
              </button>
              <button
                onClick={() => {
                  window.location.href = '/#case-studies';
                }}
                className="bg-white text-orange-600 hover:bg-orange-50 border-2 border-orange-500 font-bold py-4 px-8 rounded-lg text-lg transition-colors"
              >
                📈 Découvrir Nos Résultats
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* CTA Sticky */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleCTA}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 flex items-center space-x-2 animate-pulse"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">💰 +247% CA</span>
        </button>
      </div>
      
      <Footer />
    </div>
  );
}