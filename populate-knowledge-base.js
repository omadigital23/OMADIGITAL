/**
 * Script to populate the knowledge base with initial data
 */

// Import required modules
const { createClient } = require('@supabase/supabase-js');

// Configuration
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY']; // Use service role key instead of anon key

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Knowledge base data
const knowledgeBaseData = [
  // Services OMA Digital en français
  {
    title: "Services d'automatisation WhatsApp",
    content: "OMA Digital propose des solutions d'automatisation WhatsApp pour PME sénégalaises. Nos services incluent : chatbots intelligents, réponses automatiques, gestion des commandes, suivi client, intégration CRM. Prix : 50 000 CFA/mois avec ROI garanti de 200% en 6 mois. Parfait pour restaurants, boutiques, services, e-commerce.",
    category: "services",
    language: "fr",
    keywords: ['whatsapp', 'automatisation', 'chatbot', 'pme', 'senegal', 'roi', 'prix', 'tarif'],
    is_active: true
  },
  {
    title: "Développement web et mobile",
    content: "OMA Digital développe des sites web modernes et applications mobiles pour entreprises sénégalaises. Technologies : React, Next.js, React Native, Node.js. Services : sites vitrine, e-commerce, applications métier, maintenance. Responsive design, SEO optimisé, hébergement inclus.",
    category: "services",
    language: "fr",
    keywords: ['site web', 'application mobile', 'développement', 'react', 'nextjs', 'ecommerce'],
    is_active: true
  },
  {
    title: "Transformation digitale PME",
    content: "Accompagnement complet des PME dans leur transformation digitale. Audit digital, stratégie, formation équipes, mise en place outils, suivi performance. Spécialisé secteur sénégalais : commerce, restauration, services, artisanat.",
    category: "services",
    language: "fr",
    keywords: ['transformation digitale', 'pme', 'audit', 'formation', 'stratégie'],
    is_active: true
  },
  {
    title: "Contact et support",
    content: "Contactez OMA Digital : Téléphone/WhatsApp +212 701 193 811, Email omasenegal25@gmail.com. Horaires : Lundi-Vendredi 9h-18h. Support technique 24/7. Devis gratuit sous 24h. Siège social Dakar, interventions tout Sénégal.",
    category: "contact",
    language: "fr",
    keywords: ['contact', 'téléphone', 'email', 'support', 'devis', 'dakar'],
    is_active: true
  },
  {
    title: "Tarification et ROI",
    content: "Nos tarifs démarrent à 50 000 CFA/mois pour l'automatisation WhatsApp. ROI moyen 200% en 6 mois. Devis personnalisé gratuit. Paiement flexible : mensuel, trimestriel, annuel. Garantie satisfaction. Pas de frais cachés.",
    category: "pricing",
    language: "fr",
    keywords: ['prix', 'tarif', 'roi', 'devis', 'paiement', 'garantie'],
    is_active: true
  },

  // Services OMA Digital en anglais
  {
    title: "WhatsApp Automation Services",
    content: "OMA Digital provides WhatsApp automation solutions for Senegalese SMEs. Our services include: intelligent chatbots, automatic responses, order management, customer tracking, CRM integration. Price: 50,000 CFA/month with guaranteed 200% ROI in 6 months. Perfect for restaurants, shops, services, e-commerce.",
    category: "services",
    language: "en",
    keywords: ['whatsapp', 'automation', 'chatbot', 'sme', 'senegal', 'roi', 'price', 'cost'],
    is_active: true
  },
  {
    title: "Web and Mobile Development",
    content: "OMA Digital develops modern websites and mobile applications for Senegalese businesses. Technologies: React, Next.js, React Native, Node.js. Services: showcase sites, e-commerce, business applications, maintenance. Responsive design, SEO optimized, hosting included.",
    category: "services",
    language: "en",
    keywords: ['website', 'mobile app', 'development', 'react', 'nextjs', 'ecommerce'],
    is_active: true
  },
  {
    title: "Digital Transformation for SMEs",
    content: "Complete support for SMEs in their digital transformation. Digital audit, strategy, team training, tool implementation, performance monitoring. Specialized in Senegalese sector: commerce, restaurants, services, crafts.",
    category: "services",
    language: "en",
    keywords: ['digital transformation', 'sme', 'audit', 'training', 'strategy'],
    is_active: true
  },
  {
    title: "Contact and Support",
    content: "Contact OMA Digital: Phone/WhatsApp +212 701 193 811, Email omasenegal25@gmail.com. Hours: Monday-Friday 9am-6pm. 24/7 technical support. Free quote within 24h. Head office Dakar, interventions throughout Senegal.",
    category: "contact",
    language: "en",
    keywords: ['contact', 'phone', 'email', 'support', 'quote', 'dakar'],
    is_active: true
  },
  {
    title: "Pricing and ROI",
    content: "Our rates start at 50,000 CFA/month for WhatsApp automation. Average ROI 200% in 6 months. Free personalized quote. Flexible payment: monthly, quarterly, annual. Satisfaction guarantee. No hidden fees.",
    category: "pricing",
    language: "en",
    keywords: ['price', 'cost', 'roi', 'quote', 'payment', 'guarantee'],
    is_active: true
  },

  // FAQ bilingue
  {
    title: "Questions fréquentes - Automatisation",
    content: "Q: Comment fonctionne l'automatisation WhatsApp ? R: Notre système utilise l'IA pour répondre automatiquement aux clients, traiter les commandes, programmer des rappels. Q: Combien de temps pour la mise en place ? R: 48h maximum. Q: Formation incluse ? R: Oui, formation complète de votre équipe.",
    category: "faq",
    language: "fr",
    keywords: ['faq', 'questions', 'automatisation', 'formation', 'délai'],
    is_active: true
  },
  {
    title: "Frequently Asked Questions - Automation",
    content: "Q: How does WhatsApp automation work? A: Our system uses AI to automatically respond to customers, process orders, schedule reminders. Q: How long for setup? A: Maximum 48h. Q: Training included? A: Yes, complete training for your team.",
    category: "faq",
    language: "en",
    keywords: ['faq', 'questions', 'automation', 'training', 'setup'],
    is_active: true
  },

  // Cas d'usage spécifiques
  {
    title: "Restaurants et livraison",
    content: "Automatisation parfaite pour restaurants : prise de commandes automatique, menu digital, confirmation livraison, avis clients, promotions. Intégration possible avec systèmes de caisse existants. Augmentation moyenne des ventes de 40%.",
    category: "use_cases",
    language: "fr",
    keywords: ['restaurant', 'livraison', 'commandes', 'menu', 'caisse'],
    is_active: true
  },
  {
    title: "E-commerce et boutiques",
    content: "Solution idéale pour boutiques en ligne : catalogue produits, gestion stock, paiement mobile money, suivi commandes, service client automatisé. Compatible Orange Money, Wave, Free Money.",
    category: "use_cases",
    language: "fr",
    keywords: ['ecommerce', 'boutique', 'catalogue', 'stock', 'mobile money'],
    is_active: true
  },
  {
    title: "Restaurants and Delivery",
    content: "Perfect automation for restaurants: automatic order taking, digital menu, delivery confirmation, customer reviews, promotions. Possible integration with existing POS systems. Average sales increase of 40%.",
    category: "use_cases",
    language: "en",
    keywords: ['restaurant', 'delivery', 'orders', 'menu', 'pos'],
    is_active: true
  },
  {
    title: "E-commerce and Shops",
    content: "Ideal solution for online shops: product catalog, inventory management, mobile money payment, order tracking, automated customer service. Compatible with Orange Money, Wave, Free Money.",
    category: "use_cases",
    language: "en",
    keywords: ['ecommerce', 'shop', 'catalog', 'inventory', 'mobile money'],
    is_active: true
  },

  // Informations techniques
  {
    title: "Sécurité et conformité",
    content: "OMA Digital respecte les standards de sécurité : chiffrement end-to-end, conformité RGPD, sauvegarde automatique, accès sécurisé. Données hébergées au Sénégal. Certification ISO 27001 en cours.",
    category: "technical",
    language: "fr",
    keywords: ['sécurité', 'rgpd', 'chiffrement', 'sauvegarde', 'iso'],
    is_active: true
  },
  {
    title: "Security and Compliance",
    content: "OMA Digital meets security standards: end-to-end encryption, GDPR compliance, automatic backup, secure access. Data hosted in Senegal. ISO 27001 certification in progress.",
    category: "technical",
    language: "en",
    keywords: ['security', 'gdpr', 'encryption', 'backup', 'iso'],
    is_active: true
  }
];

async function populateKnowledgeBase() {
  console.log('🔍 Populating Knowledge Base...\n');
  
  try {
    // Clear existing data (if any)
    console.log('Clearing existing knowledge base data...');
    const { error: deleteError } = await supabase
      .from('knowledge_base')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
    
    if (deleteError) {
      console.warn('Warning: Could not clear existing data:', deleteError.message);
    }
    
    // Insert new data
    console.log(`Inserting ${knowledgeBaseData.length} knowledge base entries...`);
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(knowledgeBaseData);
    
    if (error) {
      console.error('❌ Failed to insert knowledge base data:', error.message);
      return false;
    }
    
    console.log('✅ Knowledge base populated successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error populating knowledge base:', error.message);
    return false;
  }
}

async function verifyKnowledgeBase() {
  console.log('\n🔍 Verifying Knowledge Base...\n');
  
  try {
    // Check if data was inserted
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, title, content, category, language')
      .limit(5);
    
    if (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }
    
    console.log(`✅ Verification successful! Found ${data.length} entries in knowledge base.`);
    
    if (data.length > 0) {
      console.log('\nSample entries:');
      data.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.title} (${entry.language}) - ${entry.category}`);
      });
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Run the population and verification
async function main() {
  console.log('🚀 Populating Knowledge Base with OMA Digital Data\n');
  console.log('===============================================\n');
  
  const populated = await populateKnowledgeBase();
  if (!populated) {
    process.exit(1);
  }
  
  const verified = await verifyKnowledgeBase();
  if (!verified) {
    process.exit(1);
  }
  
  console.log('\n🎉 Knowledge Base Population Complete!');
  console.log('The chatbot should now be able to retrieve context from the knowledge base.');
}

main();