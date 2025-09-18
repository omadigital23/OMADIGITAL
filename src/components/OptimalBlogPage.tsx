import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, TrendingUp, Clock, Eye, ArrowRight, Phone, Mail, Calendar, MessageCircle, Heart, Share2, X, Zap, Star, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { OptimizedImage } from './OptimizedImage';
import { NewsletterSignup } from './NewsletterSignup';
import SEOHelmet from './SEOHelmet';
import Head from 'next/head';

// Enhanced categories according to specifications
const categories = [
  'Tous',
  'Automatisation', 
  'Chatbots & IA',
  'PME Sénégal',
  'PME Maroc',
  'Cas pratiques'
];

// Articles percutants optimisés pour le marketing et SEO
const mockArticles = [
  {
    id: 1,
    title: "🚀 Automatisation PME Dakar : +300% de CA en 6 Mois avec l'IA - Cas Réel",
    excerpt: "EXCLUSIF : Découvrez comment Bakery Liberté a automatisé ses commandes WhatsApp et multiplié son chiffre d'affaires par 3 en seulement 6 mois. Stratégies, outils et ROI détaillés.",
    content: `
      <div class="article-intro">
        <p class="lead">En janvier 2024, Bakery Liberté était une petite boulangerie de quartier à Liberté 6, Dakar. Aujourd'hui, c'est l'une des PME les plus automatisées du Sénégal avec un CA qui a explosé de 300%. Voici leur histoire.</p>
      </div>

      <h2>🎯 Le Défi : Gérer 200+ Commandes WhatsApp par Jour</h2>
      <p>Amadou Diop, propriétaire de Bakery Liberté, nous contacte en désespoir de cause :</p>
      <blockquote>"Nous recevons plus de 200 commandes par jour sur WhatsApp. Mon équipe passe 8h/jour juste à répondre aux messages. Nous perdons des clients et l'équipe est épuisée."</blockquote>

      <h3>📊 Situation Avant Automatisation</h3>
      <ul>
        <li><strong>Temps de réponse moyen :</strong> 45 minutes</li>
        <li><strong>Taux de conversion :</strong> 23%</li>
        <li><strong>Erreurs de commandes :</strong> 15%</li>
        <li><strong>Coût main d'œuvre :</strong> 180 000 FCFA/mois</li>
        <li><strong>CA mensuel :</strong> 850 000 FCFA</li>
      </ul>

      <h2>⚡ La Solution OMA Digital : Automatisation Intelligente</h2>
      
      <h3>🤖 Chatbot WhatsApp Business Intelligent</h3>
      <p>Nous avons développé un chatbot IA capable de :</p>
      <ul>
        <li>Prendre les commandes automatiquement</li>
        <li>Calculer les prix en temps réel</li>
        <li>Gérer les stocks disponibles</li>
        <li>Programmer les livraisons</li>
        <li>Envoyer des confirmations automatiques</li>
      </ul>

      <h3>🔧 Technologies Utilisées</h3>
      <ul>
        <li><strong>WhatsApp Business API</strong> - Intégration native</li>
        <li><strong>Google AI Gemini</strong> - Compréhension naturelle</li>
        <li><strong>Supabase</strong> - Base de données temps réel</li>
        <li><strong>Next.js</strong> - Interface de gestion</li>
        <li><strong>Stripe</strong> - Paiements automatisés</li>
      </ul>

      <h2>📈 Résultats Spectaculaires en 6 Mois</h2>
      
      <div class="results-grid">
        <div class="result-card">
          <h4>⚡ Temps de Réponse</h4>
          <p><span class="before">45 min</span> → <span class="after">30 secondes</span></p>
          <p class="improvement">+98% d'amélioration</p>
        </div>
        
        <div class="result-card">
          <h4>💰 Taux de Conversion</h4>
          <p><span class="before">23%</span> → <span class="after">67%</span></p>
          <p class="improvement">+191% d'amélioration</p>
        </div>
        
        <div class="result-card">
          <h4>🎯 Erreurs de Commandes</h4>
          <p><span class="before">15%</span> → <span class="after">0.5%</span></p>
          <p class="improvement">-97% d'erreurs</p>
        </div>
        
        <div class="result-card">
          <h4>📊 Chiffre d'Affaires</h4>
          <p><span class="before">850K FCFA</span> → <span class="after">2.8M FCFA</span></p>
          <p class="improvement">+329% de croissance</p>
        </div>
      </div>

      <h2>🎯 Stratégies Marketing Automatisées</h2>
      
      <h3>📱 Campagnes WhatsApp Personnalisées</h3>
      <p>Le système envoie automatiquement :</p>
      <ul>
        <li>Offres personnalisées selon l'historique</li>
        <li>Rappels de commandes récurrentes</li>
        <li>Promotions ciblées par quartier</li>
        <li>Programmes de fidélité automatiques</li>
      </ul>

      <h3>📊 Analytics Avancées</h3>
      <p>Dashboard en temps réel avec :</p>
      <ul>
        <li>Suivi des ventes par produit</li>
        <li>Analyse des pics de commandes</li>
        <li>Prévisions de stock intelligentes</li>
        <li>ROI par canal marketing</li>
      </ul>

      <h2>💡 Témoignage Client</h2>
      <blockquote>
        "OMA Digital a révolutionné notre business. Nous servons maintenant 500+ clients par jour sans stress. L'équipe se concentre sur la qualité des produits pendant que l'IA gère les commandes. Notre CA a triplé et nous ouvrons une deuxième boutique !" 
        <cite>- Amadou Diop, Bakery Liberté</cite>
      </blockquote>

      <h2>🚀 Votre PME Peut Aussi Réussir</h2>
      
      <h3>✅ Secteurs Adaptés</h3>
      <ul>
        <li>🍞 Boulangeries & Pâtisseries</li>
        <li>🍕 Restaurants & Fast-food</li>
        <li>👗 Boutiques de mode</li>
        <li>💊 Pharmacies</li>
        <li>🛒 Commerce de détail</li>
        <li>🚚 Services de livraison</li>
      </ul>

      <h3>💰 Investissement & ROI</h3>
      <ul>
        <li><strong>Investissement :</strong> Solution clé en main</li>
        <li><strong>Maintenance :</strong> Support continu inclus</li>
        <li><strong>ROI moyen :</strong> 300% en 6 mois</li>
        <li><strong>Retour sur investissement :</strong> 2-3 mois</li>
      </ul>

      <h2>🎯 Prêt à Transformer Votre PME ?</h2>
      <p>Rejoignez les 150+ PME sénégalaises qui ont déjà automatisé leur business avec OMA Digital.</p>
      
      <div class="cta-section">
        <h3>🎁 Offre Spéciale Janvier 2025</h3>
        <ul>
          <li>✅ Audit gratuit de votre business</li>
          <li>✅ Démo personnalisée de 30 minutes</li>
          <li>✅ Setup gratuit inclus</li>
          <li>✅ 1 mois d'accompagnement offert</li>
        </ul>
      </div>
    `,
    author: {
      name: "OMA DIGITAL",
      avatar: "/images/logo.webp",
      role: "Expert en Automatisation IA",
      bio: "Agence leader en automatisation IA pour PME au Sénégal et Maroc. +150 entreprises transformées."
    },
    date: "2025-01-25",
    category: "Automatisation",
    readTime: "8 min",
    image: "/images/blog/automatisation-pme-dakar.svg",
    tags: ["Automatisation", "PME", "Dakar", "Sénégal", "IA", "WhatsApp", "ROI"],
    featured: true,
    views: 4847,
    likes: 256,
    comments: 67,
    shares: 89,
    trending: true,
    difficulty: "Débutant",
    estimatedROI: "300%",
    seoKeywords: "automatisation PME Dakar, IA entreprises Sénégal, transformation digitale Dakar, chatbot WhatsApp business",
    metaDescription: "Découvrez comment Bakery Liberté a multiplié son CA par 3 en automatisant ses commandes WhatsApp. Cas d'étude complet avec ROI détaillé.",
    readingTime: 8,
    wordCount: 1200,
    socialProof: "4.9/5 ⭐ (127 avis clients)",
    urgency: "Offre limitée - 10 places restantes en janvier"
  },
  {
    id: 2,
    title: "💬 Chatbots IA Maroc : +250% de Conversions pour E-commerce (Guide 2025)",
    excerpt: "RÉVÉLÉ : La stratégie secrète des e-commerces marocains qui explosent leurs ventes avec des chatbots IA. Templates, scripts et techniques avancées inclus.",
    content: `
      <div class="article-intro">
        <p class="lead">Le e-commerce marocain connaît une révolution silencieuse. Pendant que certains galèrent avec un taux de conversion de 2%, d'autres atteignent 8-12% grâce aux chatbots IA. Voici leurs secrets.</p>
      </div>

      <h2>🔥 La Révolution E-commerce au Maroc</h2>
      <p>Le marché e-commerce marocain pèse désormais <strong>1.2 milliard de dirhams</strong> et croît de 25% par an. Mais seules les entreprises qui maîtrisent l'IA dominent vraiment.</p>

      <h3>📊 État des Lieux 2025</h3>
      <ul>
        <li><strong>+2.5M</strong> d'acheteurs en ligne au Maroc</li>
        <li><strong>67%</strong> des achats se font sur mobile</li>
        <li><strong>89%</strong> des clients abandonnent sans assistance</li>
        <li><strong>Taux de conversion moyen :</strong> 2.3%</li>
        <li><strong>Avec chatbot IA :</strong> 8.7%</li>
      </ul>

      <h2>🎯 Cas d'Étude : Fashion Store Casablanca</h2>
      
      <h3>⚠️ Le Problème</h3>
      <p>Boutique mode en ligne basée à Casablanca :</p>
      <ul>
        <li>15 000 visiteurs/mois</li>
        <li>Taux de conversion : 1.8%</li>
        <li>Panier moyen : 320 DH</li>
        <li>86% d'abandon de panier</li>
        <li>Support client débordé</li>
      </ul>

      <h3>🚀 La Solution Chatbot IA</h3>
      
      <h4>🤖 Assistant Shopping Intelligent</h4>
      <p>Chatbot capable de :</p>
      <ul>
        <li>Recommander des produits personnalisés</li>
        <li>Répondre aux questions taille/couleur</li>
        <li>Gérer les retours/échanges</li>
        <li>Offrir des codes promo ciblés</li>
        <li>Récupérer les paniers abandonnés</li>
      </ul>

      <h4>🧠 IA Conversationnelle Avancée</h4>
      <p>Technologies utilisées :</p>
      <ul>
        <li><strong>NLP Arabe/Français</strong> - Compréhension bilingue</li>
        <li><strong>Computer Vision</strong> - Reconnaissance de style</li>
        <li><strong>Machine Learning</strong> - Recommandations personnalisées</li>
        <li><strong>Sentiment Analysis</strong> - Détection d'humeur client</li>
      </ul>

      <h2>📈 Résultats Explosifs en 4 Mois</h2>
      
      <div class="results-showcase">
        <div class="metric-card highlight">
          <h4>💰 Chiffre d'Affaires</h4>
          <p class="big-number">+347%</p>
          <p>De 96K DH à 429K DH/mois</p>
        </div>
        
        <div class="metric-card">
          <h4>🎯 Taux de Conversion</h4>
          <p class="big-number">1.8% → 8.9%</p>
          <p>+394% d'amélioration</p>
        </div>
        
        <div class="metric-card">
          <h4>🛒 Panier Moyen</h4>
          <p class="big-number">320 DH → 567 DH</p>
          <p>+77% d'augmentation</p>
        </div>
        
        <div class="metric-card">
          <h4>⏱️ Temps de Réponse</h4>
          <p class="big-number">24h → 3 sec</p>
          <p>Support 24/7 automatisé</p>
        </div>
      </div>

      <h2>🎨 Stratégies de Conversion Avancées</h2>
      
      <h3>🎯 Personnalisation Hyper-Ciblée</h3>
      <p>Le chatbot analyse :</p>
      <ul>
        <li>Historique de navigation</li>
        <li>Préférences de style</li>
        <li>Budget estimé</li>
        <li>Moment de visite</li>
        <li>Localisation géographique</li>
      </ul>

      <h3>🛒 Récupération de Paniers Abandonnés</h3>
      <p>Séquences automatisées :</p>
      <ul>
        <li><strong>Immédiat :</strong> "Oubli ou question sur votre commande ?"</li>
        <li><strong>1h après :</strong> Réduction de 10%</li>
        <li><strong>24h après :</strong> Livraison gratuite</li>
        <li><strong>3 jours après :</strong> Produits similaires en promo</li>
      </ul>

      <h3>💎 Upselling & Cross-selling Intelligent</h3>
      <p>Recommandations basées sur :</p>
      <ul>
        <li>Achats fréquents ensemble</li>
        <li>Tendances saisonnières</li>
        <li>Profil client similaire</li>
        <li>Marge produit optimale</li>
      </ul>

      <h2>🛠️ Guide d'Implémentation</h2>
      
      <h3>📋 Phase 1 : Audit & Stratégie (Semaine 1)</h3>
      <ul>
        <li>Analyse du parcours client actuel</li>
        <li>Identification des points de friction</li>
        <li>Définition des objectifs KPI</li>
        <li>Mapping des conversations types</li>
      </ul>

      <h3>🔧 Phase 2 : Développement (Semaines 2-4)</h3>
      <ul>
        <li>Configuration de l'IA conversationnelle</li>
        <li>Intégration avec votre e-commerce</li>
        <li>Tests A/B des scripts de vente</li>
        <li>Formation de l'équipe</li>
      </ul>

      <h3>🚀 Phase 3 : Lancement & Optimisation (Semaine 5+)</h3>
      <ul>
        <li>Déploiement progressif</li>
        <li>Monitoring des performances</li>
        <li>Ajustements basés sur les données</li>
        <li>Scaling des fonctionnalités</li>
      </ul>

      <h2>💰 ROI & Investissement</h2>
      
      <h3>💵 Coûts d'Implémentation</h3>
      <ul>
        <li><strong>Setup initial :</strong> 15 000 - 35 000 DH</li>
        <li><strong>Abonnement mensuel :</strong> 2 500 - 8 000 DH</li>
        <li><strong>Maintenance :</strong> 1 500 DH/mois</li>
      </ul>

      <h3>📊 ROI Typique</h3>
      <ul>
        <li><strong>Mois 1-2 :</strong> +50% conversions</li>
        <li><strong>Mois 3-4 :</strong> +150% conversions</li>
        <li><strong>Mois 5-6 :</strong> +250% conversions</li>
        <li><strong>Retour sur investissement :</strong> 3-4 mois</li>
      </ul>

      <h2>🎯 Secteurs E-commerce Adaptés</h2>
      
      <div class="sectors-grid">
        <div class="sector-card">
          <h4>👗 Mode & Accessoires</h4>
          <p>Conseils style, tailles, tendances</p>
        </div>
        
        <div class="sector-card">
          <h4>📱 High-Tech</h4>
          <p>Comparatifs, specs techniques</p>
        </div>
        
        <div class="sector-card">
          <h4>🏠 Maison & Déco</h4>
          <p>Conseils aménagement, mesures</p>
        </div>
        
        <div class="sector-card">
          <h4>💄 Beauté & Cosmétiques</h4>
          <p>Conseils personnalisés, routines</p>
        </div>
      </div>

      <h2>🚀 Prêt à Exploser Vos Ventes ?</h2>
      
      <div class="final-cta">
        <h3>🎁 Offre Exclusive E-commerce</h3>
        <ul>
          <li>✅ Audit conversion gratuit (valeur 5000 DH)</li>
          <li>✅ Démo personnalisée sur votre site</li>
          <li>✅ 30 jours d'essai gratuit</li>
          <li>✅ Setup offert pour les 20 premiers</li>
        </ul>
        
        <p class="urgency">⏰ <strong>Attention :</strong> Seulement 8 places restantes ce mois-ci</p>
      </div>
    `,
    author: {
      name: "OMA DIGITAL",
      avatar: "/images/logo.webp",
      role: "Expert E-commerce & IA Conversationnelle",
      bio: "Spécialiste en chatbots IA pour e-commerce. +200% de conversions en moyenne pour nos clients."
    },
    date: "2025-01-22",
    category: "Chatbots & IA",
    readTime: "12 min",
    image: "/images/blog/chatbots-ia-maroc.svg",
    tags: ["Chatbots", "IA", "Maroc", "E-commerce", "Conversions", "ROI"],
    featured: false,
    views: 3456,
    likes: 189,
    comments: 45,
    shares: 67,
    trending: true,
    difficulty: "Intermédiaire",
    estimatedROI: "250%",
    seoKeywords: "chatbots IA Maroc, e-commerce conversions, intelligence artificielle Maroc, ventes en ligne",
    metaDescription: "Guide complet : Comment les chatbots IA augmentent les conversions e-commerce de 250% au Maroc. Cas d'étude et stratégies incluses.",
    readingTime: 12,
    wordCount: 1800,
    socialProof: "4.8/5 ⭐ (89 avis e-commerces)",
    urgency: "8 places restantes ce mois"
  },
  {
    id: 3,
    title: "💰 Sites Web Ultra-Performants : PME Sénégalaises Qui Dominent Google",
    excerpt: "EXCLUSIF : 5 PME sénégalaises qui génèrent +500K FCFA/mois grâce à des sites web optimisés. Techniques SEO, vitesse et conversions révélées.",
    content: `
      <div class="article-intro">
        <p class="lead">Pendant que 90% des PME sénégalaises galèrent avec des sites lents et invisibles sur Google, ces 5 entreprises dominent leur marché grâce à des sites web ultra-performants. Découvrez leurs secrets.</p>
      </div>

      <h2>🎯 Le Problème : Sites Web PME = Catastrophe SEO</h2>
      <p>Étude choc sur 500 PME sénégalaises :</p>
      <ul>
        <li><strong>87%</strong> ont un site qui charge en +5 secondes</li>
        <li><strong>92%</strong> ne sont pas sur la 1ère page Google</li>
        <li><strong>78%</strong> perdent 60% de visiteurs à cause de la lenteur</li>
        <li><strong>95%</strong> n'ont aucun système de conversion</li>
      </ul>

      <h2>🚀 Cas d'Étude #1 : Restaurant "Chez Fatou" - Dakar</h2>
      
      <h3>⚠️ Avant : Site Web Catastrophique</h3>
      <ul>
        <li>Temps de chargement : 8.3 secondes</li>
        <li>Position Google : Page 4</li>
        <li>Visiteurs/mois : 150</li>
        <li>Conversions : 2%</li>
        <li>CA web : 25 000 FCFA/mois</li>
      </ul>

      <h3>✅ Après : Machine à Convertir</h3>
      <ul>
        <li>Temps de chargement : 0.8 secondes</li>
        <li>Position Google : Top 3 pour "restaurant Dakar"</li>
        <li>Visiteurs/mois : 8 500</li>
        <li>Conversions : 23%</li>
        <li>CA web : 680 000 FCFA/mois</li>
      </ul>

      <h2>🔧 Technologies de Pointe Utilisées</h2>
      
      <h3>⚡ Performance Extrême</h3>
      <ul>
        <li><strong>Next.js 14</strong> - Framework ultra-rapide</li>
        <li><strong>Vercel Edge</strong> - CDN mondial</li>
        <li><strong>WebP/AVIF</strong> - Images optimisées</li>
        <li><strong>Lazy Loading</strong> - Chargement intelligent</li>
        <li><strong>Service Workers</strong> - Cache avancé</li>
      </ul>

      <h3>🎯 SEO Technique Avancé</h3>
      <ul>
        <li><strong>Schema.org</strong> - Données structurées</li>
        <li><strong>Core Web Vitals</strong> - Métriques Google parfaites</li>
        <li><strong>Mobile-First</strong> - Optimisation mobile</li>
        <li><strong>AMP</strong> - Pages accélérées</li>
      </ul>

      <h2>📊 Résultats Spectaculaires - 5 Cas Réels</h2>
      
      <div class="case-studies">
        <div class="case-study">
          <h4>🍕 Restaurant "Chez Fatou"</h4>
          <p><strong>Secteur :</strong> Restauration</p>
          <p><strong>Résultat :</strong> +2620% de CA web</p>
          <p><strong>Temps :</strong> 3 mois</p>
        </div>
        
        <div class="case-study">
          <h4>👗 Boutique "Elegance Dakar"</h4>
          <p><strong>Secteur :</strong> Mode</p>
          <p><strong>Résultat :</strong> +890% de visiteurs</p>
          <p><strong>Temps :</strong> 4 mois</p>
        </div>
        
        <div class="case-study">
          <h4>🏠 "Déco Sénégal"</h4>
          <p><strong>Secteur :</strong> Décoration</p>
          <p><strong>Résultat :</strong> +1200% de leads</p>
          <p><strong>Temps :</strong> 2 mois</p>
        </div>
        
        <div class="case-study">
          <h4>💊 Pharmacie "Santé Plus"</h4>
          <p><strong>Secteur :</strong> Santé</p>
          <p><strong>Résultat :</strong> +450% de commandes</p>
          <p><strong>Temps :</strong> 6 semaines</p>
        </div>
        
        <div class="case-study">
          <h4>🚗 Garage "Auto Expert"</h4>
          <p><strong>Secteur :</strong> Automobile</p>
          <p><strong>Résultat :</strong> +670% de RDV</p>
          <p><strong>Temps :</strong> 5 semaines</p>
        </div>
      </div>

      <h2>🎨 Stratégies de Conversion Secrètes</h2>
      
      <h3>🧠 Psychologie de l'Utilisateur Sénégalais</h3>
      <ul>
        <li><strong>Confiance :</strong> Témoignages clients locaux</li>
        <li><strong>Urgence :</strong> Stocks limités, offres temporaires</li>
        <li><strong>Social Proof :</strong> "500+ clients satisfaits à Dakar"</li>
        <li><strong>Localisation :</strong> "Livraison gratuite à Dakar"</li>
      </ul>

      <h3>📱 Mobile-First (78% du trafic sénégalais)</h3>
      <ul>
        <li>Boutons tactiles optimisés</li>
        <li>Formulaires simplifiés</li>
        <li>Paiement mobile money</li>
        <li>WhatsApp intégré</li>
      </ul>

      <h2>🔍 SEO Local Sénégal : Dominer Google</h2>
      
      <h3>🎯 Mots-Clés Locaux Gagnants</h3>
      <ul>
        <li>"[service] Dakar"</li>
        <li>"[produit] Sénégal"</li>
        <li>"Livraison [quartier]"</li>
        <li>"Meilleur [service] Dakar"</li>
      </ul>

      <h3>📍 Google My Business Optimisé</h3>
      <ul>
        <li>Photos professionnelles</li>
        <li>Avis clients 5 étoiles</li>
        <li>Horaires à jour</li>
        <li>Posts réguliers</li>
      </ul>

      <h2>💰 ROI & Investissement</h2>
      
      <h3>💵 Coûts Réels</h3>
      <ul>
        <li><strong>Site vitrine :</strong> Solution sur mesure</li>
        <li><strong>E-commerce :</strong> Plateforme complète</li>
        <li><strong>Maintenance :</strong> Support continu</li>
        <li><strong>SEO :</strong> Optimisation garantie</li>
      </ul>

      <h3>📈 ROI Moyen</h3>
      <ul>
        <li><strong>Mois 1-2 :</strong> +100% de visibilité</li>
        <li><strong>Mois 3-4 :</strong> +300% de trafic</li>
        <li><strong>Mois 5-6 :</strong> +500% de conversions</li>
        <li><strong>ROI annuel :</strong> 800-1200%</li>
      </ul>

      <h2>🚀 Votre Site Web Peut Dominer</h2>
      
      <div class="action-plan">
        <h3>🎯 Plan d'Action Immédiat</h3>
        <ol>
          <li><strong>Audit gratuit</strong> de votre site actuel</li>
          <li><strong>Stratégie SEO</strong> personnalisée</li>
          <li><strong>Développement</strong> ultra-performant</li>
          <li><strong>Lancement</strong> et optimisation</li>
          <li><strong>Domination</strong> de votre marché</li>
        </ol>
      </div>
    `,
    author: {
      name: "OMA DIGITAL",
      avatar: "/images/logo.webp",
      role: "Expert Développement Web & SEO",
      bio: "Spécialiste en sites web ultra-performants. +500% de ROI moyen pour nos clients PME."
    },
    date: "2025-01-20",
    category: "PME Sénégal",
    readTime: "10 min",
    image: "/images/blog/sites-web-performants.svg",
    tags: ["Sites Web", "SEO", "PME", "Sénégal", "Performance", "Conversions"],
    featured: false,
    views: 2890,
    likes: 145,
    comments: 38,
    shares: 52,
    trending: true,
    difficulty: "Intermédiaire",
    estimatedROI: "800%",
    seoKeywords: "site web PME Sénégal, SEO Dakar, développement web Sénégal, performance site web",
    metaDescription: "5 PME sénégalaises qui dominent Google avec des sites ultra-performants. Stratégies SEO, techniques et ROI révélés.",
    readingTime: 10,
    wordCount: 1500,
    socialProof: "4.9/5 ⭐ (156 sites créés)",
    urgency: "Audit gratuit - 15 places ce mois"
  },
  {
    id: 4,
    title: "🎯 Marketing Digital Maroc : Stratégies Qui Génèrent +1M DH/Mois",
    excerpt: "RÉVÉLATION : Comment 3 PME marocaines ont explosé leur CA grâce au marketing digital. Campagnes, budgets et ROI détaillés + templates inclus.",
    content: `
      <div class="article-intro">
        <p class="lead">Trois PME marocaines ordinaires. Un point commun : elles génèrent maintenant +1M DH/mois grâce au marketing digital. Voici leurs stratégies exactes, budgets et résultats.</p>
      </div>

      <h2>🔥 Le Marketing Digital au Maroc : Opportunité en Or</h2>
      <p>Le marché digital marocain explose :</p>
      <ul>
        <li><strong>24M</strong> d'utilisateurs internet</li>
        <li><strong>18M</strong> sur les réseaux sociaux</li>
        <li><strong>+35%</strong> de croissance e-commerce/an</li>
        <li><strong>67%</strong> des PME ignorent encore le digital</li>
      </ul>

      <h2>🚀 Cas #1 : "Argan Beauty" - Cosmétiques Bio</h2>
      
      <h3>📊 Situation de Départ</h3>
      <ul>
        <li>CA mensuel : 45 000 DH</li>
        <li>Vente uniquement physique</li>
        <li>0 présence digitale</li>
        <li>Concurrence féroce</li>
      </ul>

      <h3>🎯 Stratégie Déployée</h3>
      
      <h4>📱 Social Media Marketing</h4>
      <ul>
        <li><strong>Instagram :</strong> Contenu beauté quotidien</li>
        <li><strong>Facebook :</strong> Communauté de 50K femmes</li>
        <li><strong>TikTok :</strong> Tutoriels viraux</li>
        <li><strong>YouTube :</strong> Chaîne éducative</li>
      </ul>

      <h4>🎬 Content Marketing</h4>
      <ul>
        <li>Vidéos avant/après clients</li>
        <li>Témoignages authentiques</li>
        <li>Conseils beauté experts</li>
        <li>Stories Instagram quotidiennes</li>
      </ul>

      <h4>💰 Publicité Payante</h4>
      <ul>
        <li><strong>Facebook Ads :</strong> 8 000 DH/mois</li>
        <li><strong>Google Ads :</strong> 5 000 DH/mois</li>
        <li><strong>Instagram Ads :</strong> 4 000 DH/mois</li>
        <li><strong>Influenceurs :</strong> 6 000 DH/mois</li>
      </ul>

      <h3>📈 Résultats Explosifs (8 Mois)</h3>
      <ul>
        <li><strong>CA mensuel :</strong> 1.2M DH (+2567%)</li>
        <li><strong>Followers :</strong> 180K sur tous réseaux</li>
        <li><strong>E-commerce :</strong> 75% du CA</li>
        <li><strong>ROI publicité :</strong> 450%</li>
      </ul>

      <h2>💎 Cas #2 : "Tech Solutions" - Services IT</h2>
      
      <h3>🎯 Stratégie B2B LinkedIn</h3>
      
      <h4>🔗 LinkedIn Marketing</h4>
      <ul>
        <li>Contenu éducatif quotidien</li>
        <li>Études de cas clients</li>
        <li>Webinaires gratuits</li>
        <li>Networking actif</li>
      </ul>

      <h4>📧 Email Marketing</h4>
      <ul>
        <li>Newsletter tech hebdomadaire</li>
        <li>Séquences de nurturing</li>
        <li>Invitations événements</li>
        <li>Offres exclusives</li>
      </ul>

      <h3>📊 Résultats B2B</h3>
      <ul>
        <li><strong>Leads qualifiés :</strong> +890%</li>
        <li><strong>Contrats signés :</strong> +340%</li>
        <li><strong>Valeur moyenne :</strong> +120%</li>
        <li><strong>CA mensuel :</strong> 1.8M DH</li>
      </ul>

      <h2>🍕 Cas #3 : "Pizza Express" - Restauration</h2>
      
      <h3>📱 Stratégie Omnicanale</h3>
      
      <h4>🛵 Marketing de Proximité</h4>
      <ul>
        <li>Géolocalisation Facebook</li>
        <li>Google My Business optimisé</li>
        <li>Partenariats influenceurs locaux</li>
        <li>Événements quartier</li>
      </ul>

      <h4>🎁 Programmes de Fidélité</h4>
      <ul>
        <li>App mobile avec points</li>
        <li>Offres personnalisées</li>
        <li>Parrainage récompensé</li>
        <li>Challenges sociaux</li>
      </ul>

      <h3>📈 Croissance Fulgurante</h3>
      <ul>
        <li><strong>Commandes/jour :</strong> 45 → 320</li>
        <li><strong>App downloads :</strong> 25K</li>
        <li><strong>Taux de fidélité :</strong> 67%</li>
        <li><strong>CA mensuel :</strong> 1.1M DH</li>
      </ul>

      <h2>🎨 Templates & Stratégies Gagnantes</h2>
      
      <h3>📱 Template Post Instagram</h3>
      <div class="template">
        <p><strong>Hook :</strong> "🔥 AVANT/APRÈS incroyable !"</p>
        <p><strong>Problème :</strong> "Tu galères avec [problème] ?"</p>
        <p><strong>Solution :</strong> "Voici comment [solution]"</p>
        <p><strong>Preuve :</strong> Photo/vidéo résultat</p>
        <p><strong>CTA :</strong> "DM pour en savoir plus !"</p>
      </div>

      <h3>📧 Template Email Marketing</h3>
      <div class="template">
        <p><strong>Objet :</strong> "[Prénom], cette erreur coûte cher"</p>
        <p><strong>Accroche :</strong> Histoire personnelle</p>
        <p><strong>Problème :</strong> Douleur client</p>
        <p><strong>Solution :</strong> Votre produit/service</p>
        <p><strong>CTA :</strong> Bouton d'action clair</p>
      </div>

      <h2>💰 Budgets & ROI par Canal</h2>
      
      <h3>📊 Répartition Budget Type (PME)</h3>
      <ul>
        <li><strong>Facebook/Instagram :</strong> 40% (ROI: 350%)</li>
        <li><strong>Google Ads :</strong> 25% (ROI: 280%)</li>
        <li><strong>Content Creation :</strong> 20% (ROI: 450%)</li>
        <li><strong>Influenceurs :</strong> 10% (ROI: 200%)</li>
        <li><strong>Email Marketing :</strong> 5% (ROI: 600%)</li>
      </ul>

      <h3>💵 Budgets Recommandés</h3>
      <ul>
        <li><strong>Startup :</strong> 5 000 - 15 000 DH/mois</li>
        <li><strong>PME :</strong> 15 000 - 50 000 DH/mois</li>
        <li><strong>Grande entreprise :</strong> 50 000+ DH/mois</li>
      </ul>

      <h2>🚀 Plan d'Action 90 Jours</h2>
      
      <h3>📅 Mois 1 : Fondations</h3>
      <ul>
        <li>Audit digital complet</li>
        <li>Stratégie personnalisée</li>
        <li>Setup outils & comptes</li>
        <li>Création contenu initial</li>
      </ul>

      <h3>📅 Mois 2 : Lancement</h3>
      <ul>
        <li>Campagnes publicitaires</li>
        <li>Content marketing actif</li>
        <li>Community management</li>
        <li>Optimisations A/B</li>
      </ul>

      <h3>📅 Mois 3 : Scaling</h3>
      <ul>
        <li>Augmentation budgets</li>
        <li>Nouveaux canaux</li>
        <li>Automatisations</li>
        <li>Mesure ROI final</li>
      </ul>

      <h2>🎯 Votre Tour de Dominer</h2>
      
      <div class="final-offer">
        <h3>🎁 Offre Spéciale Marketing Digital</h3>
        <ul>
          <li>✅ Audit digital gratuit (valeur 8000 DH)</li>
          <li>✅ Stratégie personnalisée</li>
          <li>✅ Templates & scripts inclus</li>
          <li>✅ 3 mois d'accompagnement</li>
          <li>✅ Garantie ROI ou remboursé</li>
        </ul>
        
        <p class="urgency">⚡ <strong>Dernière chance :</strong> 5 places seulement en janvier</p>
      </div>
    `,
    author: {
      name: "OMA DIGITAL",
      avatar: "/images/logo.webp",
      role: "Expert Marketing Digital & Growth",
      bio: "Agence #1 au Maroc en marketing digital. +1M DH de CA généré pour nos clients."
    },
    date: "2025-01-18",
    category: "PME Maroc",
    readTime: "15 min",
    image: "/images/blog/marketing-digital-maroc.svg",
    tags: ["Marketing Digital", "Maroc", "PME", "ROI", "Stratégie", "Croissance"],
    featured: false,
    views: 5234,
    likes: 298,
    comments: 76,
    shares: 134,
    trending: true,
    difficulty: "Avancé",
    estimatedROI: "450%",
    seoKeywords: "marketing digital Maroc, PME Maroc, stratégie digitale, ROI marketing",
    metaDescription: "3 PME marocaines qui génèrent +1M DH/mois avec le marketing digital. Stratégies, budgets et templates révélés.",
    readingTime: 15,
    wordCount: 2100,
    socialProof: "4.9/5 ⭐ (234 campagnes réussies)",
    urgency: "5 places restantes en janvier"
  }
];

export function OptimalBlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [showScrollPopup, setShowScrollPopup] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [visitorCount, setVisitorCount] = useState(0);
  const [recentSignups, setRecentSignups] = useState([]);

  // Marketing automation effects
  useEffect(() => {
    // Simulate visitor counter
    const baseCount = 1247;
    const randomAdd = Math.floor(Math.random() * 50);
    setVisitorCount(baseCount + randomAdd);

    // Show notification after 3 seconds
    const notificationTimer = setTimeout(() => {
      setShowNotification(true);
    }, 3000);

    // Show scroll popup after scrolling 50%
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50 && !showScrollPopup) {
        setShowScrollPopup(true);
      }
    };

    // Exit intent detection
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !showExitIntent) {
        setShowExitIntent(true);
      }
    };

    // Simulate recent signups
    const signups = [
      { name: "Amadou D.", location: "Dakar", time: "il y a 2 min" },
      { name: "Fatima M.", location: "Casablanca", time: "il y a 5 min" },
      { name: "Ibrahim S.", location: "Thiès", time: "il y a 8 min" },
      { name: "Aicha B.", location: "Rabat", time: "il y a 12 min" }
    ];
    setRecentSignups(signups);

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      clearTimeout(notificationTimer);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showScrollPopup, showExitIntent]);

  // Filter articles based on category and search
  const filteredArticles = useMemo(() => {
    return mockArticles.filter(article => {
      const matchesCategory = selectedCategory === 'Tous' || article.category === selectedCategory;
      const matchesSearch = searchTerm === '' || 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  const featuredArticle = mockArticles.find(article => article.featured);

  return (
    <>
      <SEOHelmet 
        title="Insights IA & Transformation Digitale - OMA Blog"
        description="Actualités, conseils pratiques et études de cas sur l'automatisation et l'IA pour les PME en Afrique de l'Ouest & du Nord. Automatisation Sénégal, IA PME Dakar, Chatbots Maroc."
        keywords="automatisation Sénégal, IA PME Dakar, chatbots Maroc, transformation digitale Afrique, OMA Digital blog"
        url="https://oma-digital.sn/blog"
        image="https://oma-digital.sn/images/blog-og.webp"
        type="website"
        blogPostSchema={{
          "@context": "https://schema.org",
          "@type": "Blog",
          "name": "OMA Digital Blog - Insights IA & Transformation Digitale",
          "description": "Actualités, conseils pratiques et études de cas sur l'automatisation et l'IA pour les PME en Afrique de l'Ouest & du Nord",
          "url": "https://oma-digital.sn/blog",
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://oma-digital.sn/blog"
          },
          "publisher": {
            "@type": "Organization",
            "name": "OMA Digital",
            "logo": {
              "@type": "ImageObject",
              "url": "https://oma-digital.sn/images/logo.webp"
            }
          },
          "author": {
            "@type": "Organization",
            "name": "OMA Digital"
          }
        }}
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section du Blog - Agent Marketing */}
        <section className="relative py-20 md:py-24 bg-gradient-to-br from-orange-50 via-orange-100 to-red-50 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500 rounded-full animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 bg-red-500 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-yellow-500 rounded-full animate-ping"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              {/* Badge Marketing */}
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold mb-8 shadow-xl animate-pulse">
                <BookOpen className="w-5 h-5 mr-2" />
                🚀 AGENT MARKETING #1 AU SÉNÉGAL & MAROC
              </div>
              
              {/* Titre Principal Percutant */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  OMA BLOG
                </span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-700">
                  Votre Machine à Clients
                </span>
              </h1>
              
              {/* Sous-titre Marketing */}
              <p className="text-xl md:text-2xl text-gray-700 max-w-5xl mx-auto mb-8 leading-relaxed">
                <span className="font-bold text-orange-600">+300% de CA</span> pour les PME qui appliquent nos stratégies IA. 
                <br />
                <span className="text-lg">Cas réels • ROI prouvé • Techniques exclusives</span>
              </p>
              
              {/* Stats Impressionnantes */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-5xl mx-auto mb-8 md:mb-10">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-xl md:text-2xl font-black text-orange-600">150+</div>
                  <div className="text-xs md:text-sm text-gray-600">PME Transformées</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-xl md:text-2xl font-black text-green-600">+300%</div>
                  <div className="text-xs md:text-sm text-gray-600">ROI Moyen</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-xl md:text-2xl font-black text-blue-600">24/7</div>
                  <div className="text-xs md:text-sm text-gray-600">Support IA</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-xl md:text-2xl font-black text-purple-600">4.9★</div>
                  <div className="text-xs md:text-sm text-gray-600">Note Clients</div>
                </div>
              </div>
              
              {/* Barre de recherche améliorée */}
              <div className="max-w-3xl mx-auto mb-10">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-orange-500 w-6 h-6 group-focus-within:scale-110 transition-transform" />
                  <input
                    type="text"
                    placeholder="🔍 Tapez votre défi business (ex: automatiser WhatsApp, booster ventes...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 text-lg border-3 border-orange-300 rounded-2xl focus:ring-4 focus:ring-orange-200 focus:border-orange-500 shadow-xl bg-white/90 backdrop-blur-sm font-medium"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                      Gratuit
                    </span>
                  </div>
                </div>
              </div>
              
              {/* CTA Puissants */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link 
                  href="#newsletter" 
                  className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105"
                >
                  <span>🎯 NEWSLETTER SECRÈTE IA</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/#contact" 
                  className="group bg-white hover:bg-gray-50 text-orange-600 border-3 border-orange-500 px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                >
                  <span>💬 AUDIT GRATUIT</span>
                  <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
              
              {/* Urgence Marketing */}
              <div className="mt-8 inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse shadow-lg">
                ⚡ ATTENTION : Seulement 15 audits gratuits ce mois !
              </div>
            </div>
          </div>
        </section>

        {/* Catégories en avant */}
        <section className="py-8 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Marketing */}
            <div className="lg:col-span-1 space-y-8">
              {/* Articles recommandés */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                  Articles Populaires
                </h3>
                <div className="space-y-4">
                  {mockArticles.slice(0, 3).map(article => (
                    <Link 
                      key={article.id} 
                      href={`/blog/${article.id}`}
                      className="block group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                          <OptimizedImage
                            src={article.image}
                            alt={article.title}
                            width={64}
                            height={64}
                            objectFit="cover"
                            className="w-full h-full"
                            quality={70}
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 group-hover:text-orange-600 line-clamp-2 text-sm">
                            {article.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA WhatsApp & Devis rapide */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Besoin d'aide ?</h3>
                <div className="space-y-3">
                  <a 
                    href="https://wa.me/221701193811" 
                    className="flex items-center space-x-3 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <div>
                      <div className="font-medium">WhatsApp Direct</div>
                      <div className="text-sm opacity-90">Réponse immédiate</div>
                    </div>
                  </a>
                  
                  <Link 
                    href="/#contact" 
                    className="flex items-center space-x-3 p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    <div>
                      <div className="font-medium">Consultation Gratuite</div>
                      <div className="text-sm opacity-90">Devis personnalisé</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Newsletter Form */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Newsletter IA</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Recevez nos derniers insights sur l'IA et l'automatisation pour PME
                </p>
                <NewsletterSignup />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Featured Article */}
              {featuredArticle && selectedCategory === 'Tous' && !searchTerm && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 text-orange-500 mr-2" />
                    Article à la une
                  </h2>
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500">
                    <div className="grid lg:grid-cols-2 gap-0">
                      <div className="aspect-[16/10] lg:aspect-auto relative">
                        <OptimizedImage
                          src={featuredArticle.image}
                          alt={featuredArticle.title}
                          width={600}
                          height={400}
                          objectFit="cover"
                          className="w-full h-full"
                          quality={90}
                          priority
                        />
                        <div className="absolute top-6 right-6 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl">
                          ARTICLE PHARE
                        </div>
                      </div>
                      <div className="p-8 lg:p-12 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {featuredArticle.category}
                          </span>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            ROI: {featuredArticle.estimatedROI}
                          </span>
                        </div>
                        
                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                          {featuredArticle.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                          {featuredArticle.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center space-x-3">
                            <OptimizedImage
                              src={featuredArticle.author.avatar}
                              alt={featuredArticle.author.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{featuredArticle.author.name}</div>
                              <div className="text-sm text-gray-500">{featuredArticle.author.role}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(featuredArticle.date).toLocaleDateString('fr-FR')}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{featuredArticle.readTime}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/blog/${featuredArticle.id}`}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                          >
                            <span>Lire l'article</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Articles Grid */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCategory === 'Tous' ? 'Tous les articles' : selectedCategory}
                  </h2>
                  <div className="text-gray-600">
                    {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {filteredArticles
                    .filter(article => !article.featured || selectedCategory !== 'Tous' || searchTerm)
                    .map((article, index) => (
                      <article 
                        key={article.id} 
                        className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-3xl transition-all duration-500 hover:-translate-y-3 group border border-orange-100 relative"
                      >
                        {/* Badge Urgence */}
                        {article.urgency && (
                          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                            🔥 {article.urgency}
                          </div>
                        )}
                        
                        <div className="aspect-[16/10] relative overflow-hidden">
                          <OptimizedImage
                            src={article.image}
                            alt={article.title}
                            width={500}
                            height={300}
                            objectFit="cover"
                            className="w-full h-full group-hover:scale-110 transition-transform duration-700"
                            quality={85}
                            loading={index < 2 ? "eager" : "lazy"}
                          />
                          
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          {/* Badges Top */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                              {article.category}
                            </span>
                            {article.trending && (
                              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-bounce shadow-lg">
                                <TrendingUp className="w-3 h-3" />
                                VIRAL
                              </span>
                            )}
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                              ROI: {article.estimatedROI}
                            </span>
                          </div>
                          
                          {/* Badge Difficulté */}
                          <div className="absolute bottom-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                              article.difficulty === 'Débutant' ? 'bg-green-100 text-green-800' :
                              article.difficulty === 'Intermédiaire' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              📚 {article.difficulty}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          {/* Meta Info */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-orange-500" />
                              <span className="text-sm text-gray-600">{new Date(article.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{article.readTime}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{article.views.toLocaleString()}</span>
                              </span>
                            </div>
                          </div>
                          
                          {/* Titre Percutant */}
                          <h3 className="font-black text-xl text-gray-900 mb-4 leading-tight hover:text-orange-600 transition-colors cursor-pointer line-clamp-2 group-hover:text-orange-600">
                            <Link href={`/blog/${article.id}`}>
                              {article.title}
                            </Link>
                          </h3>
                          
                          {/* Extrait Marketing */}
                          <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed font-medium">
                            {article.excerpt}
                          </p>
                          
                          {/* Social Proof */}
                          {article.socialProof && (
                            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-gray-700">{article.socialProof}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {article.wordCount} mots
                              </div>
                            </div>
                          )}
                          
                          {/* Auteur */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                              <OptimizedImage
                                src={article.author.avatar}
                                alt={article.author.name}
                                width={40}
                                height={40}
                                className="rounded-full border-2 border-orange-200"
                              />
                              <div>
                                <div className="text-sm font-bold text-gray-900">✍️ {article.author.name}</div>
                                <div className="text-xs text-gray-600">{article.author.role}</div>
                              </div>
                            </div>
                            
                            {/* Engagement Stats */}
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Heart className="w-3 h-3 text-red-500" />
                                <span>{article.likes}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MessageCircle className="w-3 h-3 text-blue-500" />
                                <span>{article.comments}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Share2 className="w-3 h-3 text-green-500" />
                                <span>{article.shares}</span>
                              </span>
                            </div>
                          </div>
                          
                          {/* CTA Puissant */}
                          <Link
                            href={`/blog/${article.id}`}
                            className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-4 rounded-xl font-black transition-all duration-300 flex items-center justify-center space-x-3 w-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                          >
                            <span>🚀 DÉCOUVRIR LES SECRETS</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                          
                          {/* Teaser Bonus */}
                          <div className="mt-3 text-center">
                            <span className="text-xs text-gray-500 font-medium">
                              💎 + Templates & Scripts inclus
                            </span>
                          </div>
                        </div>
                      </article>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à automatiser votre PME au Sénégal ou au Maroc ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Contactez-nous dès aujourd'hui pour une consultation gratuite et découvrez comment l'IA peut transformer votre business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/221701193811" 
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
              
              <Link 
                href="/#contact" 
                className="bg-white hover:bg-gray-100 text-orange-600 px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <span>Consultation gratuite</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* CSS Styles intégrés */}
        <Head>
          <link rel="stylesheet" href="/styles/blog-marketing.css" />
        </Head>

        {/* Notification Social Proof */}
        {showNotification && (
          <div className="fixed bottom-4 md:bottom-6 left-4 md:left-6 z-50 max-w-xs md:max-w-sm">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3 md:p-4 transform transition-all duration-500 animate-slide-up">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-bold text-gray-900">🔥 Activité en temps réel</span>
                </div>
                <button 
                  onClick={() => setShowNotification(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {recentSignups.slice(0, 2).map((signup, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">{signup.name}</span>
                      <span className="text-gray-600"> de {signup.location}</span>
                      <div className="text-xs text-gray-500">S'est inscrit {signup.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{visitorCount} visiteurs aujourd'hui</span>
                  <span className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>4.9/5 (127 avis)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Exit Intent Popup */}
        {showExitIntent && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-3xl max-w-sm md:max-w-lg w-full p-4 md:p-8 relative transform transition-all duration-500 animate-zoom-in">
              <button
                onClick={() => setShowExitIntent(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-red-500" />
                </div>
                
                <h3 className="text-2xl font-black text-gray-900 mb-4">
                  ⚠️ ATTENDEZ ! Ne Partez Pas Sans Ça...
                </h3>
                
                <p className="text-gray-700 mb-6 text-lg">
                  <strong>OFFRE EXCLUSIVE :</strong> Recevez notre guide secret 
                  <span className="text-orange-600 font-bold"> "7 Stratégies IA pour +300% de CA"</span> 
                  <strong>GRATUITEMENT</strong>
                </p>
                
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-orange-800 mb-2">🎁 Ce que vous recevrez :</h4>
                  <ul className="text-left text-sm text-orange-700 space-y-1">
                    <li>✅ Templates de chatbots qui convertissent</li>
                    <li>✅ Scripts de vente automatisés</li>
                    <li>✅ Stratégies WhatsApp Business</li>
                    <li>✅ Cas d'études avec ROI détaillé</li>
                  </ul>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Link
                    href="/#contact"
                    onClick={() => setShowExitIntent(false)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-black transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>🚀 OUI, JE VEUX LE GUIDE GRATUIT</span>
                  </Link>
                  
                  <button
                    onClick={() => setShowExitIntent(false)}
                    className="text-gray-500 text-sm hover:text-gray-700"
                  >
                    Non merci, je préfère rater cette opportunité
                  </button>
                </div>
                
                <div className="mt-4 text-xs text-gray-500">
                  ⏰ Offre limitée - expire dans 24h
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scroll Popup */}
        {showScrollPopup && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-2xl p-6 transform transition-all duration-500 animate-slide-up">
              <button
                onClick={() => setShowScrollPopup(false)}
                className="absolute top-2 right-2 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-3 mb-3">
                <Award className="w-8 h-8" />
                <div>
                  <h4 className="font-bold">🎯 Vous lisez comme un PRO !</h4>
                  <p className="text-sm opacity-90">Réclamez votre bonus</p>
                </div>
              </div>
              
              <p className="text-sm mb-4 opacity-95">
                Puisque vous êtes arrivé jusqu'ici, voici un <strong>audit gratuit</strong> de votre business !
              </p>
              
              <Link
                href="/#contact"
                onClick={() => setShowScrollPopup(false)}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2 w-full"
              >
                <span>Réclamer mon audit gratuit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Floating Social Proof */}
        <div className="fixed top-1/2 left-0 transform -translate-y-1/2 z-40">
          <div className="bg-white shadow-xl rounded-r-xl p-3 border-l-4 border-orange-500">
            <div className="text-center">
              <div className="text-2xl font-black text-orange-600">{visitorCount}</div>
              <div className="text-xs text-gray-600">visiteurs</div>
              <div className="text-xs text-gray-600">aujourd'hui</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}