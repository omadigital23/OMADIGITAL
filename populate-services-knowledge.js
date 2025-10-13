/**
 * Script to populate the knowledge base with enhanced OMA Digital services information
 */

// Import required modules
const { createClient } = require('@supabase/supabase-js');

// Configuration
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Enhanced OMA Digital services information
const enhancedServicesData = [
  // French version
  {
    title: "Résumé des offres OMA Digital",
    content: "OMA est votre partenaire de croissance digitale, spécialisé dans les solutions technologiques conçues sur mesure pour les petites et moyennes entreprises (PME) au Sénégal. Nous traduisons vos besoins en outils digitaux puissants qui vous font gagner du temps et de l'argent.",
    category: "company_overview",
    language: "fr",
    keywords: ['oma', 'partenaire', 'croissance', 'digitale', 'pme', 'senegal', 'outils', 'temps', 'argent'],
    is_active: true
  },
  {
    title: "Création de sites web - OMA Digital",
    content: "Nous créons : Des sites web professionnels qui capturent l'essence de votre marque. Votre gain : Une présence en ligne percutante, optimisée pour le référencement local, qui attire et convertit vos visiteurs en clients.",
    category: "services",
    language: "fr",
    keywords: ['site web', 'professionnel', 'marque', 'présence en ligne', 'référencement', 'visiteurs', 'clients'],
    is_active: true
  },
  {
    title: "Création d'applications mobiles - OMA Digital",
    content: "Nous créons : Des applications mobiles intuitives pour engager vos clients directement sur leurs smartphones. Votre gain : Une fidélisation accrue, un canal de vente direct et une expérience utilisateur unique qui vous démarque.",
    category: "services",
    language: "fr",
    keywords: ['application mobile', 'smartphones', 'fidélisation', 'vente', 'expérience utilisateur'],
    is_active: true
  },
  {
    title: "Chatbots & Automatisation - OMA Digital",
    content: "Nous créons : Des chatbots simples et multimodaux qui interagissent par texte et par la voix. Votre gain : Un support client instantané 24/7, une qualification automatique des prospects et une automatisation de WhatsApp et des autres réseaux sociaux pour ne plus perdre une seule demande.",
    category: "services",
    language: "fr",
    keywords: ['chatbot', 'automatisation', 'texte', 'voix', 'support client', 'prospects', 'whatsapp', 'réseaux sociaux'],
    is_active: true
  },
  {
    title: "Marketing digital - OMA Digital",
    content: "Nous créons : Des stratégies de marketing sur mesure, axées sur la performance. Votre gain : Une visibilité accrue sur les réseaux sociaux, l'acquisition de nouveaux clients et la mise en place de campagnes publicitaires qui génèrent des résultats concrets.",
    category: "services",
    language: "fr",
    keywords: ['marketing digital', 'stratégie', 'performance', 'réseaux sociaux', 'clients', 'campagnes', 'résultats'],
    is_active: true
  },

  // English version
  {
    title: "OMA Digital Services Overview",
    content: "OMA is your digital growth partner, specialized in technological solutions designed specifically for small and medium enterprises (SMEs) in Senegal. We translate your needs into powerful digital tools that save you time and money.",
    category: "company_overview",
    language: "en",
    keywords: ['oma', 'growth partner', 'digital', 'sme', 'senegal', 'tools', 'time', 'money'],
    is_active: true
  },
  {
    title: "Website Creation - OMA Digital",
    content: "We create: Professional websites that capture your brand's essence. Your benefit: A powerful online presence, optimized for local SEO, that attracts and converts your visitors into customers.",
    category: "services",
    language: "en",
    keywords: ['website', 'professional', 'brand', 'online presence', 'seo', 'visitors', 'customers'],
    is_active: true
  },
  {
    title: "Mobile App Development - OMA Digital",
    content: "We create: Intuitive mobile apps to engage your customers directly on their smartphones. Your benefit: Increased customer loyalty, a direct sales channel and a unique user experience that sets you apart.",
    category: "services",
    language: "en",
    keywords: ['mobile app', 'smartphones', 'loyalty', 'sales', 'user experience'],
    is_active: true
  },
  {
    title: "Chatbots & Automation - OMA Digital",
    content: "We create: Simple and multimodal chatbots that interact through text and voice. Your benefit: Instant 24/7 customer support, automatic prospect qualification and automation of WhatsApp and other social networks so you never lose a single request.",
    category: "services",
    language: "en",
    keywords: ['chatbot', 'automation', 'text', 'voice', 'customer support', 'prospects', 'whatsapp', 'social networks'],
    is_active: true
  },
  {
    title: "Digital Marketing - OMA Digital",
    content: "We create: Custom marketing strategies focused on performance. Your benefit: Increased visibility on social networks, acquisition of new customers and implementation of advertising campaigns that generate concrete results.",
    category: "services",
    language: "en",
    keywords: ['digital marketing', 'strategy', 'performance', 'social networks', 'customers', 'campaigns', 'results'],
    is_active: true
  }
];

async function populateServicesKnowledge() {
  console.log('🔍 Populating Knowledge Base with Enhanced Services Information...\n');
  
  try {
    // Insert new data
    console.log(`Inserting ${enhancedServicesData.length} enhanced service entries...`);
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(enhancedServicesData);
    
    if (error) {
      console.error('❌ Failed to insert enhanced services data:', error.message);
      return false;
    }
    
    console.log('✅ Enhanced services information populated successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error populating enhanced services information:', error.message);
    return false;
  }
}

async function verifyServicesKnowledge() {
  console.log('\n🔍 Verifying Enhanced Services Knowledge...\n');
  
  try {
    // Check if data was inserted
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, title, content, category, language')
      .in('category', ['company_overview', 'services'])
      .limit(10);
    
    if (error) {
      console.error('❌ Verification failed:', error.message);
      return false;
    }
    
    console.log(`✅ Verification successful! Found ${data.length} enhanced service entries in knowledge base.`);
    
    if (data.length > 0) {
      console.log('\nEnhanced service entries:');
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
  console.log('🚀 Populating Knowledge Base with Enhanced OMA Digital Services\n');
  console.log('=========================================================\n');
  
  const populated = await populateServicesKnowledge();
  if (!populated) {
    process.exit(1);
  }
  
  const verified = await verifyServicesKnowledge();
  if (!verified) {
    process.exit(1);
  }
  
  console.log('\n🎉 Enhanced Services Knowledge Base Population Complete!');
  console.log('The chatbot should now be able to provide more detailed information about OMA Digital services.');
}

main();