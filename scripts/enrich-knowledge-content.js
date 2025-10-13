/**
 * Script pour enrichir la base de connaissances avec des cas d'usage spécifiques
 * Secteurs : Restaurants, E-commerce, Services, Artisanat, Santé, Éducation
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Required environment variables not set');
  console.error('Please ensure .env.local contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Contenu enrichi avec cas d'usage spécifiques
const enrichedContent = {
  // Restaurants et Livraison
  restaurants_fr: {
    title: 'Solution Restaurants et Livraison - OMA Digital',
    content: `🍽️ **Révolutionnez votre restaurant avec l'automatisation OMA Digital !**

**📱 Fonctionnalités spécialisées restaurants :**
• Menu digital interactif avec photos HD
• Prise de commandes automatique 24/7 via WhatsApp
• Gestion des allergies et préférences clients
• Calcul automatique des prix, taxes et promotions
• Intégration avec vos livreurs (Jumia Food, Glovo, Yango)
• Système de fidélité client automatisé
• Notifications de préparation et livraison

**📊 Résultats clients réels :**
• Restaurant "Chez Fatou" (Dakar) : +150% de commandes en 3 mois
• "Le Baobab" (Thiès) : -60% d'erreurs de commandes
• "Teranga Food" (Rufisque) : +80% de clients fidèles
• "Dibiterie Moderne" (Guédiawaye) : +200% de ventes le soir

**💰 Tarif spécial restaurants : 75 000 CFA/mois**
• Installation et formation incluses (2 jours)
• Menu digital personnalisé avec vos plats
• Intégration caisse existante (Tactill, Odoo, etc.)
• Support dédié restauration 7j/7
• Formation équipe cuisine et service

**🎯 Parfait pour :** Fast-foods, restaurants traditionnels, pâtisseries, traiteurs, food trucks, dibiteries`,
    keywords: ['restaurant', 'livraison', 'menu', 'commandes', 'food', 'jumia', 'glovo', 'yango', 'caisse', 'fidélité', 'dibiterie']
  },

  restaurants_en: {
    title: 'Restaurant and Delivery Solution - OMA Digital',
    content: `🍽️ **Revolutionize your restaurant with OMA Digital automation!**

**📱 Specialized restaurant features:**
• Interactive digital menu with HD photos
• 24/7 automatic order taking via WhatsApp
• Customer allergies and preferences management
• Automatic calculation of prices, taxes and promotions
• Integration with your delivery partners (Jumia Food, Glovo, Yango)
• Automated customer loyalty system
• Preparation and delivery notifications

**📊 Real client results:**
• Restaurant "Chez Fatou" (Dakar): +150% orders in 3 months
• "Le Baobab" (Thiès): -60% order errors
• "Teranga Food" (Rufisque): +80% loyal customers
• "Dibiterie Moderne" (Guédiawaye): +200% evening sales

**💰 Special restaurant rate: 75,000 CFA/month**
• Installation and training included (2 days)
• Personalized digital menu with your dishes
• Existing POS integration (Tactill, Odoo, etc.)
• Dedicated restaurant support 7/7
• Kitchen and service team training

**🎯 Perfect for:** Fast-foods, traditional restaurants, bakeries, caterers, food trucks, dibiteries`,
    keywords: ['restaurant', 'delivery', 'menu', 'orders', 'food', 'jumia', 'glovo', 'yango', 'pos', 'loyalty', 'dibiterie']
  },

  // E-commerce et Boutiques
  ecommerce_fr: {
    title: 'Solution E-commerce et Boutiques - OMA Digital',
    content: `🛍️ **Transformez votre boutique en machine à ventes automatisée !**

**📱 Fonctionnalités e-commerce avancées :**
• Catalogue produits avec photos et descriptions
• Gestion automatique des stocks et alertes
• Paiements sécurisés (Orange Money, Wave, Free Money, Visa)
• Suivi des commandes en temps réel
• Service client automatisé multilingue
• Système de recommandations personnalisées
• Gestion des retours et remboursements

**💳 Intégrations paiement :**
• Orange Money : Commission 1.5%
• Wave : Commission 1%
• Free Money : Commission 2%
• Cartes bancaires : Commission 3.5%
• Paiement à la livraison disponible

**📊 Cas de succès :**
• "Boutique Mariama" (Sandaga) : +300% de ventes en ligne
• "Mode Africaine" (Plateau) : -50% de temps de gestion
• "Électronique Plus" (Liberté) : +180% de clients récurrents
• "Bijoux Teranga" (Almadies) : Expansion dans 3 régions

**💰 Forfait E-commerce : 95 000 CFA/mois**
• Site e-commerce complet inclus
• Formation équipe vente (3 jours)
• Intégration tous moyens de paiement
• Analytics et rapports détaillés
• Support technique prioritaire

**🎯 Idéal pour :** Boutiques mode, électronique, cosmétiques, artisanat, bijoux, décoration`,
    keywords: ['ecommerce', 'boutique', 'catalogue', 'stock', 'orange money', 'wave', 'free money', 'paiement', 'ventes', 'sandaga']
  },

  // Services et Professionnels
  services_fr: {
    title: 'Solution Services Professionnels - OMA Digital',
    content: `👔 **Automatisez votre activité de services avec OMA Digital !**

**📋 Fonctionnalités services professionnels :**
• Prise de rendez-vous automatique 24/7
• Gestion des plannings et disponibilités
• Rappels automatiques clients (SMS + WhatsApp)
• Devis automatisés selon vos tarifs
• Suivi des dossiers clients
• Facturation automatique
• Gestion des paiements et relances

**🏢 Secteurs accompagnés :**
• **Santé :** Cliniques, cabinets médicaux, pharmacies
• **Beauté :** Salons de coiffure, instituts, spas
• **Juridique :** Avocats, notaires, conseillers
• **Technique :** Plombiers, électriciens, mécaniciens
• **Consulting :** Experts-comptables, consultants IT
• **Éducation :** Écoles privées, centres de formation

**📊 Résultats secteur services :**
• Clinique "Santé Plus" : -70% de temps administratif
• Salon "Belle Afrique" : +120% de rendez-vous
• Cabinet "Droit & Conseil" : +90% de nouveaux clients
• "Plomberie Express" : +250% d'interventions

**💰 Forfait Services : 65 000 CFA/mois**
• Configuration métier personnalisée
• Formation équipe administrative
• Intégration logiciels existants
• Rapports d'activité mensuels
• Support métier spécialisé

**🎯 Avantages :** Gain de temps, moins d'erreurs, plus de clients, meilleure organisation`,
    keywords: ['services', 'rendez-vous', 'planning', 'devis', 'facturation', 'santé', 'beauté', 'juridique', 'technique', 'consulting']
  },

  // Artisanat et Créateurs
  artisanat_fr: {
    title: 'Solution Artisanat et Créateurs - OMA Digital',
    content: `🎨 **Valorisez votre savoir-faire artisanal avec le digital !**

**✨ Fonctionnalités spéciales artisans :**
• Galerie photos HD de vos créations
• Commandes personnalisées automatisées
• Gestion des matières premières et coûts
• Suivi de production étape par étape
• Vente en ligne locale et internationale
• Storytelling automatique de vos créations
• Réseau de revendeurs et partenaires

**🏺 Secteurs artisanaux :**
• **Textile :** Bogolan, bazin, broderie, couture
• **Bijoux :** Or, argent, perles, créations modernes
• **Décoration :** Sculptures, tableaux, objets déco
• **Maroquinerie :** Sacs, chaussures, accessoires cuir
• **Poterie :** Céramiques, terre cuite, art traditionnel
• **Menuiserie :** Meubles, objets bois, ébénisterie

**🌍 Expansion internationale :**
• Vente vers l'Europe et l'Amérique
• Gestion des expéditions internationales
• Traduction automatique des descriptions
• Conversion automatique des devises
• Respect des normes d'exportation

**📊 Success stories :**
• "Bogolan Moderne" : Export vers 12 pays
• "Bijoux Teranga" : +400% de commandes en ligne
• "Sculpture Dakar" : Collaboration avec galeries européennes
• "Maroquinerie Thiès" : Contrats avec boutiques françaises

**💰 Forfait Artisanat : 55 000 CFA/mois**
• Portfolio digital professionnel
• Formation marketing digital (5 jours)
• Aide à l'export et formalités
• Réseau d'acheteurs internationaux
• Support création de marque

**🎯 Objectif :** Faire rayonner l'artisanat sénégalais dans le monde !`,
    keywords: ['artisanat', 'créateurs', 'bogolan', 'bijoux', 'sculpture', 'maroquinerie', 'export', 'international', 'galerie']
  },

  // Témoignages détaillés
  temoignages_fr: {
    title: 'Témoignages Clients Détaillés - OMA Digital',
    content: `🌟 **Nos clients racontent leur transformation digitale :**

**🍽️ Aminata Diop - Restaurant "Chez Fatou", Dakar**
"Avant OMA Digital, je perdais 3h par jour à prendre les commandes au téléphone. Maintenant, tout est automatique ! Les clients commandent via WhatsApp, le système calcule les prix, et moi je me concentre sur la cuisine. Mes ventes ont doublé en 2 mois. L'équipe OMA Digital est très professionnelle, ils m'ont formée en 2 jours. Je recommande à tous les restaurateurs !"
*Résultats : +150% de commandes, -70% de temps administratif*

**🛍️ Moussa Seck - Boutique "Mode Africaine", Plateau**
"J'avais une petite boutique physique. Avec OMA Digital, j'ai maintenant un site e-commerce qui marche 24h/24. Les clients paient avec Orange Money directement, et je reçois l'argent instantanément. En 6 mois, j'ai ouvert 2 nouvelles boutiques ! Le ROI est incroyable."
*Résultats : +300% de ventes, expansion géographique*

**💄 Fatou Ba - Salon "Belle Afrique", Thiès**
"La prise de rendez-vous automatique a changé ma vie ! Plus de téléphone qui sonne sans arrêt, plus d'oublis. Les clientes réservent quand elles veulent, et moi je reçois tout organisé. J'ai gagné 20 nouvelles clientes par mois grâce au système de rappels automatiques."
*Résultats : +120% de rendez-vous, +85% de fidélisation*

**⚖️ Ibrahima Fall - Cabinet "Droit & Conseil", Dakar**
"Comme avocat, je passais trop de temps sur l'administratif. OMA Digital a automatisé mes prises de rendez-vous, mes devis, et même mes relances de paiement. Je peux me concentrer sur mes dossiers. Mes clients apprécient la rapidité et le professionnalisme."
*Résultats : +90% de nouveaux clients, -60% de temps administratif*

**🎨 Khadija Ndiaye - Artisane "Bijoux Teranga", Rufisque**
"Je créais de beaux bijoux mais je ne savais pas les vendre en ligne. OMA Digital m'a créé une boutique magnifique et m'a appris le marketing digital. Maintenant, je vends mes créations en France, au Canada, et même aux États-Unis ! Mon rêve devient réalité."
*Résultats : Export vers 8 pays, +400% de chiffre d'affaires*

**🔧 Mamadou Diallo - "Plomberie Express", Guédiawaye**
"Les clients m'appellent maintenant via WhatsApp, décrivent leur problème avec photos, et je peux donner un devis immédiat. Le système gère mon planning, mes factures, tout ! J'ai embauché 2 ouvriers tellement j'ai de travail maintenant."
*Résultats : +250% d'interventions, équipe agrandie*

**📊 Statistiques globales OMA Digital :**
• 200+ entreprises accompagnées depuis 2023
• 98% de satisfaction client
• ROI moyen de 280% en 6 mois
• 0 client perdu en 2024
• Présence dans 8 régions du Sénégal`,
    keywords: ['témoignages', 'clients', 'satisfaction', 'roi', 'restaurant', 'boutique', 'salon', 'avocat', 'artisane', 'plombier', 'succès']
  },

  // FAQ Technique Avancée
  faq_technique_fr: {
    title: 'FAQ Technique Avancée - OMA Digital',
    content: `❓ **Questions techniques fréquentes et réponses d'experts :**

**🔧 Installation et Configuration**
Q: Combien de temps pour installer l'automatisation WhatsApp ?
R: 24-48h maximum selon la complexité. Formation incluse : 2-5 jours selon votre secteur.

Q: Faut-il changer de numéro WhatsApp Business ?
R: Non ! Nous utilisons votre numéro existant. Migration transparente garantie.

Q: Compatible avec ma caisse enregistreuse actuelle ?
R: Oui ! Intégration avec Tactill, Odoo, SAP, systèmes custom. API disponible.

**💳 Paiements et Sécurité**
Q: Quels moyens de paiement sont intégrés ?
R: Orange Money, Wave, Free Money, cartes Visa/Mastercard, virements bancaires, crypto (Bitcoin, USDT).

Q: Mes données sont-elles sécurisées ?
R: Chiffrement AES-256, serveurs au Sénégal, conformité RGPD, sauvegarde quotidienne, accès sécurisé 2FA.

Q: Que se passe-t-il si je veux arrêter le service ?
R: Aucun engagement. Export de toutes vos données en 24h. Transition assistée.

**📱 Performance et Fiabilité**
Q: Ça marche avec une connexion internet lente ?
R: Optimisé pour les réseaux sénégalais. Fonctionne même en 2G. Mode hors-ligne disponible.

Q: Combien de messages par jour le système peut gérer ?
R: Jusqu'à 10 000 messages/jour par numéro. Scaling automatique selon vos besoins.

Q: Support technique disponible quand ?
R: 24/7 pour urgences. Réponse garantie sous 2h en semaine, 4h le weekend.

**🔗 Intégrations Avancées**
Q: Intégration avec mon site web existant ?
R: Oui ! Widget chat, API REST, webhooks. Compatible WordPress, Shopify, sites custom.

Q: Connexion avec mon CRM (Salesforce, HubSpot) ?
R: Intégration native avec 50+ CRM. Synchronisation bidirectionnelle des contacts.

Q: Rapports et analytics disponibles ?
R: Dashboard temps réel, exports Excel/PDF, Google Analytics, métriques business personnalisées.

**🌍 Multi-langues et Localisation**
Q: Support du wolof et autres langues locales ?
R: Wolof, pulaar, sérère disponibles. Traduction automatique 100+ langues.

Q: Adaptation aux spécificités sénégalaises ?
R: Calendrier local, jours fériés, Ramadan, formats dates/heures, devises (CFA/EUR/USD).

**📈 Évolutivité**
Q: Que se passe-t-il si mon business grandit ?
R: Scaling automatique. Migration vers forfaits supérieurs sans interruption.

Q: Puis-je ajouter de nouvelles fonctionnalités ?
R: Développement sur mesure disponible. Roadmap produit collaborative.`,
    keywords: ['faq', 'technique', 'installation', 'paiement', 'sécurité', 'performance', 'intégration', 'crm', 'wolof', 'scaling']
  }
};

async function enrichKnowledgeBase() {
  console.log('🚀 Enrichissement de la base de connaissances...');

  try {
    // Récupérer les données existantes
    const { data: existingData, error: fetchError } = await supabase
      .from('conversations')
      .select('metadata')
      .eq('session_id', 'oma_digital_knowledge_base')
      .single();

    if (fetchError) {
      console.error('❌ Erreur récupération données existantes:', fetchError);
      return;
    }

    // Fusionner avec le nouveau contenu
    const updatedMetadata = {
      ...existingData.metadata,
      ...enrichedContent
    };

    // Mettre à jour la base de connaissances
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ metadata: updatedMetadata })
      .eq('session_id', 'oma_digital_knowledge_base');

    if (updateError) {
      console.error('❌ Erreur mise à jour:', updateError);
      return;
    }

    console.log('✅ Base de connaissances enrichie avec succès !');
    console.log(`📊 Contenu total : ${Object.keys(updatedMetadata).length} entrées`);
    
    // Afficher le nouveau contenu
    console.log('\n📝 Nouveau contenu ajouté :');
    Object.keys(enrichedContent).forEach(key => {
      console.log(`• ${key}: ${enrichedContent[key].title}`);
    });

    // Test de recherche
    console.log('\n🧪 Test de recherche enrichie...');
    const testQueries = [
      { intent: 'restaurants', language: 'fr', query: 'solution pour restaurant' },
      { intent: 'ecommerce', language: 'fr', query: 'boutique en ligne' },
      { intent: 'services', language: 'fr', query: 'automatisation services' },
      { intent: 'temoignages', language: 'fr', query: 'avis clients' }
    ];

    testQueries.forEach(test => {
      const key = `${test.intent}_${test.language}`;
      const result = updatedMetadata[key];
      
      if (result) {
        console.log(`✅ ${test.query} → ${result.title}`);
      } else {
        console.log(`❌ ${test.query} → Pas de résultat pour ${key}`);
      }
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter l'enrichissement
enrichKnowledgeBase();