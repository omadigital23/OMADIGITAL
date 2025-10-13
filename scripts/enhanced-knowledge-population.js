#!/usr/bin/env node

/**
 * Enhanced Knowledge Base Population Script
 * Populates the knowledge base with comprehensive OMA Digital services information
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Enhanced OMA Digital knowledge base content
const enhancedKnowledgeBase = [
  // Services détaillés en français
  {
    title: 'Automatisation WhatsApp Business Complète',
    content: `OMA Digital propose la solution d'automatisation WhatsApp la plus avancée du Sénégal pour PME. 

🤖 **Fonctionnalités incluses :**
• Réponses automatiques intelligentes 24/7
• Gestion complète des commandes et paiements
• Intégration Orange Money, Wave, Free Money
• Suivi client automatisé avec CRM intégré
• Menu digital interactif avec catalogue produits
• Notifications push personnalisées
• Analytics et rapports détaillés

💰 **Tarification :** 50 000 CFA/mois
📈 **ROI garanti :** 200% en 6 mois
⚡ **Installation :** 48h maximum
🎓 **Formation :** Incluse pour toute votre équipe

Parfait pour : restaurants, boutiques, services, e-commerce, artisans, consultants.`,
    category: 'services',
    language: 'fr',
    keywords: ['whatsapp', 'automatisation', 'chatbot', 'pme', 'senegal', 'roi', 'prix', 'tarif', 'orange money', 'wave', 'commandes']
  },

  {
    title: 'Développement Web Ultra-Moderne',
    content: `Sites web professionnels nouvelle génération pour entreprises sénégalaises.

🌐 **Technologies de pointe :**
• React.js et Next.js pour performance maximale
• Design responsive mobile-first
• SEO optimisé pour le marché sénégalais
• Hébergement cloud sécurisé inclus
• SSL et sécurité avancée
• Intégration réseaux sociaux
• Analytics Google intégré

💼 **Types de sites :**
• Sites vitrine professionnels
• E-commerce avec paiement mobile
• Plateformes de services
• Portails d'entreprise
• Applications web métier

💰 **À partir de :** 200 000 CFA
⚡ **Livraison :** 2-4 semaines
🔧 **Maintenance :** 6 mois inclus`,
    category: 'services',
    language: 'fr',
    keywords: ['site web', 'développement', 'react', 'nextjs', 'ecommerce', 'responsive', 'seo', 'hébergement']
  },

  {
    title: 'Applications Mobiles Natives',
    content: `Applications mobiles sur mesure pour iOS et Android, adaptées au marché sénégalais.

📱 **Spécialités :**
• Applications e-commerce avec paiement mobile
• Apps de livraison et logistique
• Plateformes de services à domicile
• Applications éducatives
• Solutions de gestion d'entreprise
• Apps de réservation et booking

🛠️ **Technologies :**
• React Native pour iOS/Android
• Intégration APIs locales (Orange, Wave)
• Notifications push avancées
• Mode hors-ligne disponible
• Synchronisation cloud automatique

💰 **À partir de :** 500 000 CFA
📅 **Développement :** 6-12 semaines
🎯 **Support :** 1 an inclus`,
    category: 'services',
    language: 'fr',
    keywords: ['application mobile', 'ios', 'android', 'react native', 'ecommerce mobile', 'paiement mobile']
  },

  {
    title: 'Marketing Digital Performance',
    content: `Stratégies marketing digital sur mesure pour PME sénégalaises avec ROI mesurable.

📈 **Services inclus :**
• Audit digital complet gratuit
• Stratégie réseaux sociaux (Facebook, Instagram, LinkedIn)
• Campagnes publicitaires ciblées
• Content marketing et création de contenu
• Email marketing automatisé
• SEO local pour Dakar et régions
• Analytics et reporting mensuel

🎯 **Spécialisations sectorielles :**
• Restaurants et food delivery
• Mode et beauté
• Services professionnels
• E-commerce et retail
• Immobilier
• Santé et bien-être

💰 **À partir de :** 75 000 CFA/mois
📊 **ROI moyen :** +150% en 3 mois
📱 **Gestion :** Équipe dédiée`,
    category: 'services',
    language: 'fr',
    keywords: ['marketing digital', 'réseaux sociaux', 'facebook', 'instagram', 'publicité', 'seo', 'content marketing']
  },

  // Services en anglais
  {
    title: 'Complete WhatsApp Business Automation',
    content: `OMA Digital offers Senegal's most advanced WhatsApp automation solution for SMEs.

🤖 **Features included:**
• Intelligent 24/7 automatic responses
• Complete order and payment management
• Orange Money, Wave, Free Money integration
• Automated customer tracking with integrated CRM
• Interactive digital menu with product catalog
• Personalized push notifications
• Detailed analytics and reports

💰 **Pricing:** 50,000 CFA/month
📈 **Guaranteed ROI:** 200% in 6 months
⚡ **Installation:** Maximum 48h
🎓 **Training:** Included for your entire team

Perfect for: restaurants, shops, services, e-commerce, artisans, consultants.`,
    category: 'services',
    language: 'en',
    keywords: ['whatsapp', 'automation', 'chatbot', 'sme', 'senegal', 'roi', 'price', 'orange money', 'wave', 'orders']
  },

  {
    title: 'Ultra-Modern Web Development',
    content: `Next-generation professional websites for Senegalese businesses.

🌐 **Cutting-edge technologies:**
• React.js and Next.js for maximum performance
• Mobile-first responsive design
• SEO optimized for Senegalese market
• Secure cloud hosting included
• SSL and advanced security
• Social media integration
• Integrated Google Analytics

💼 **Website types:**
• Professional showcase sites
• E-commerce with mobile payment
• Service platforms
• Corporate portals
• Business web applications

💰 **Starting from:** 200,000 CFA
⚡ **Delivery:** 2-4 weeks
🔧 **Maintenance:** 6 months included`,
    category: 'services',
    language: 'en',
    keywords: ['website', 'development', 'react', 'nextjs', 'ecommerce', 'responsive', 'seo', 'hosting']
  },

  // Contact et support
  {
    title: 'Contact et Support OMA Digital',
    content: `Contactez OMA Digital pour tous vos projets de digitalisation.

📞 **Coordonnées principales :**
• Téléphone/WhatsApp : +212 701 193 811
• Email professionnel : omasenegal25@gmail.com
• Site web : www.oma-digital.com

📍 **Localisation :**
• Siège social : Liberté 6, Dakar, Sénégal
• Zone d'intervention : Tout le Sénégal
• Déplacements possibles : Thiès, Saint-Louis, Kaolack

🕒 **Horaires d'ouverture :**
• Lundi - Vendredi : 8h00 - 18h00
• Samedi : 9h00 - 13h00
• Support WhatsApp : 24h/7j

⚡ **Réactivité garantie :**
• Réponse WhatsApp : < 30 minutes
• Réponse email : < 2 heures
• Devis gratuit : < 24 heures
• Consultation gratuite : Sur rendez-vous`,
    category: 'contact',
    language: 'fr',
    keywords: ['contact', 'téléphone', 'email', 'whatsapp', 'dakar', 'support', 'horaires', 'devis']
  },

  {
    title: 'Contact and Support OMA Digital',
    content: `Contact OMA Digital for all your digitalization projects.

📞 **Main contact details:**
• Phone/WhatsApp: +212 701 193 811
• Professional email: omasenegal25@gmail.com
• Website: www.oma-digital.com

📍 **Location:**
• Head office: Liberté 6, Dakar, Senegal
• Service area: All of Senegal
• Possible travel: Thiès, Saint-Louis, Kaolack

🕒 **Opening hours:**
• Monday - Friday: 8am - 6pm
• Saturday: 9am - 1pm
• WhatsApp support: 24/7

⚡ **Guaranteed responsiveness:**
• WhatsApp response: < 30 minutes
• Email response: < 2 hours
• Free quote: < 24 hours
• Free consultation: By appointment`,
    category: 'contact',
    language: 'en',
    keywords: ['contact', 'phone', 'email', 'whatsapp', 'dakar', 'support', 'hours', 'quote']
  },

  // Cas d'usage spécifiques
  {
    title: 'Solution Restaurant et Livraison',
    content: `Automatisation complète pour restaurants et services de livraison au Sénégal.

🍽️ **Fonctionnalités restaurant :**
• Menu digital interactif avec photos
• Prise de commandes automatique 24/7
• Gestion des stocks en temps réel
• Calcul automatique des prix et promotions
• Intégration systèmes de caisse existants
• Suivi livraison en temps réel
• Collecte avis clients automatisée

💳 **Paiements intégrés :**
• Orange Money
• Wave
• Free Money
• Paiement à la livraison
• Cartes bancaires (optionnel)

📊 **Résultats moyens :**
• +40% d'augmentation des ventes
• -60% de temps de gestion des commandes
• +25% de satisfaction client
• ROI de 300% en 4 mois

💰 **Tarif spécial restaurants :** 45 000 CFA/mois`,
    category: 'use_cases',
    language: 'fr',
    keywords: ['restaurant', 'livraison', 'menu', 'commandes', 'orange money', 'wave', 'caisse', 'stocks']
  },

  {
    title: 'Solution E-commerce et Boutiques',
    content: `Plateforme e-commerce complète pour boutiques sénégalaises.

🛍️ **Fonctionnalités e-commerce :**
• Catalogue produits avec recherche avancée
• Gestion automatique des stocks
• Système de commandes WhatsApp
• Panier d'achat intelligent
• Promotions et codes de réduction
• Suivi des expéditions
• Programme de fidélité client

💼 **Gestion business :**
• Dashboard analytics en temps réel
• Rapports de ventes automatiques
• Gestion des fournisseurs
• Comptabilité simplifiée
• Export données Excel/PDF

🚀 **Avantages concurrentiels :**
• Vente 24h/7j sans intervention
• Réduction des coûts opérationnels
• Expansion géographique facilitée
• Base de données clients enrichie

💰 **Package e-commerce :** 60 000 CFA/mois`,
    category: 'use_cases',
    language: 'fr',
    keywords: ['ecommerce', 'boutique', 'catalogue', 'stocks', 'ventes', 'dashboard', 'fidélité']
  },

  // FAQ détaillées
  {
    title: 'FAQ - Questions Fréquentes Automatisation',
    content: `Réponses aux questions les plus fréquentes sur nos services d'automatisation.

❓ **Comment fonctionne l'automatisation WhatsApp ?**
Notre système utilise l'intelligence artificielle pour comprendre les messages de vos clients et répondre automatiquement. Il peut traiter les commandes, donner des informations sur vos produits, programmer des rappels et bien plus.

❓ **Combien de temps pour la mise en place ?**
Maximum 48 heures pour une installation complète. Nous configurons tout : menus, réponses automatiques, intégrations paiement, formation de votre équipe.

❓ **La formation est-elle incluse ?**
Oui, formation complète de 2 heures pour votre équipe + manuel d'utilisation + support technique 6 mois.

❓ **Puis-je modifier les réponses automatiques ?**
Absolument ! Interface simple pour modifier tous les messages, ajouter de nouveaux produits, changer les prix, etc.

❓ **Que se passe-t-il si le système ne comprend pas ?**
Le système transfère automatiquement vers un humain et apprend de chaque interaction pour s'améliorer.

❓ **Y a-t-il des frais cachés ?**
Aucun frais caché. Prix fixe mensuel tout inclus : installation, formation, support, mises à jour.`,
    category: 'faq',
    language: 'fr',
    keywords: ['faq', 'questions', 'automatisation', 'whatsapp', 'formation', 'installation', 'prix', 'support']
  },

  // Informations techniques
  {
    title: 'Sécurité et Conformité des Données',
    content: `OMA Digital respecte les plus hauts standards de sécurité et de protection des données.

🔒 **Sécurité technique :**
• Chiffrement end-to-end de toutes les communications
• Serveurs sécurisés avec certificats SSL
• Sauvegardes automatiques quotidiennes
• Accès sécurisé avec authentification 2FA
• Monitoring 24/7 des systèmes

📋 **Conformité réglementaire :**
• Respect du RGPD européen
• Conformité lois sénégalaises sur les données
• Hébergement des données au Sénégal
• Politique de confidentialité transparente
• Droit à l'oubli respecté

🏆 **Certifications en cours :**
• ISO 27001 (Sécurité de l'information)
• ISO 9001 (Qualité)
• Certification WhatsApp Business officielle

🛡️ **Protection des données clients :**
• Aucune revente de données
• Accès limité aux équipes autorisées
• Logs d'audit complets
• Suppression automatique après inactivité`,
    category: 'technical',
    language: 'fr',
    keywords: ['sécurité', 'rgpd', 'données', 'chiffrement', 'ssl', 'iso', 'conformité', 'protection']
  }
];

async function populateEnhancedKnowledgeBase() {
  console.log('🚀 Starting enhanced knowledge base population...');

  try {
    // Clear existing knowledge base
    console.log('🧹 Clearing existing knowledge base...');
    const { error: deleteError } = await supabase
      .from('knowledge_base')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except non-existent ID

    if (deleteError) {
      console.warn('⚠️ Warning during cleanup:', deleteError.message);
    }

    // Insert enhanced knowledge base items
    console.log('📚 Inserting enhanced knowledge base items...');
    
    for (let i = 0; i < enhancedKnowledgeBase.length; i++) {
      const item = enhancedKnowledgeBase[i];
      
      console.log(`📝 Inserting item ${i + 1}/${enhancedKnowledgeBase.length}: ${item.title.substring(0, 50)}...`);
      
      const { error: insertError } = await supabase
        .from('knowledge_base')
        .insert({
          title: item.title,
          content: item.content,
          category: item.category,
          language: item.language,
          keywords: item.keywords,
          is_active: true
        });

      if (insertError) {
        console.error(`❌ Error inserting item "${item.title}":`, insertError.message);
      } else {
        console.log(`✅ Successfully inserted: ${item.title}`);
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Verify insertion
    console.log('🔍 Verifying knowledge base population...');
    
    const { data: frenchItems, error: frenchError } = await supabase
      .from('knowledge_base')
      .select('count(*)')
      .eq('language', 'fr')
      .eq('is_active', true);

    const { data: englishItems, error: englishError } = await supabase
      .from('knowledge_base')
      .select('count(*)')
      .eq('language', 'en')
      .eq('is_active', true);

    if (frenchError || englishError) {
      console.error('❌ Error verifying insertion:', frenchError || englishError);
    } else {
      const frenchCount = frenchItems?.[0]?.count || 0;
      const englishCount = englishItems?.[0]?.count || 0;
      const totalCount = frenchCount + englishCount;

      console.log('📊 Knowledge base population summary:');
      console.log(`   • French items: ${frenchCount}`);
      console.log(`   • English items: ${englishCount}`);
      console.log(`   • Total items: ${totalCount}`);
      console.log(`   • Expected items: ${enhancedKnowledgeBase.length}`);

      if (totalCount === enhancedKnowledgeBase.length) {
        console.log('🎉 Enhanced knowledge base population completed successfully!');
      } else {
        console.warn('⚠️ Some items may not have been inserted correctly');
      }
    }

    // Test search functionality
    console.log('🔍 Testing search functionality...');
    
    const testQueries = [
      { query: 'whatsapp', language: 'fr' },
      { query: 'automation', language: 'en' },
      { query: 'prix', language: 'fr' },
      { query: 'contact', language: 'fr' }
    ];

    for (const test of testQueries) {
      const { data: searchResults, error: searchError } = await supabase
        .from('knowledge_base')
        .select('title, category')
        .eq('language', test.language)
        .eq('is_active', true)
        .textSearch('content', test.query, { type: 'websearch' })
        .limit(3);

      if (searchError) {
        console.error(`❌ Search test failed for "${test.query}":`, searchError.message);
      } else {
        console.log(`✅ Search test "${test.query}" (${test.language}): ${searchResults?.length || 0} results`);
      }
    }

    console.log('🎯 Enhanced knowledge base setup completed!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Test your chatbot with various queries');
    console.log('2. Monitor response quality and relevance');
    console.log('3. Add more specific content as needed');
    console.log('4. Update keywords for better search results');

  } catch (error) {
    console.error('❌ Fatal error during knowledge base population:', error);
    process.exit(1);
  }
}

// Run the population script
populateEnhancedKnowledgeBase();