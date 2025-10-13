#!/usr/bin/env node

/**
 * Script to populate the knowledge base with OMA Digital service offerings in French and English
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'] || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// OMA Digital service offerings in French and English
const knowledgeBaseEntries = [
  // French entries
  {
    title: "Automatisation intelligente WhatsApp Business",
    content: "Création de chatbots multicanaux pour WhatsApp Business avec automatisation des réponses, des relances et des actions backend. Intégration avec n8n pour workflows automatisés. Personnalisation conversationnelle avec suivi de session, contexte et conversion. ROI de 200% garanti en 90 jours.",
    category: "Services",
    subcategory: "Automatisation",
    language: "fr-FR",
    keywords: ["whatsapp", "automatisation", "chatbot", "business", "roi", "n8n", "workflows"],
    priority: 10,
    tags: ["whatsapp", "automatisation", "chatbot", "business", "roi"],
    is_active: true
  },
  {
    title: "Sites web ultra-rapides",
    content: "Développement de sites web modernes avec Next.js, Vercel et Supabase. Performance garantie avec Core Web Vitals optimisés. Interfaces réactives pour clients, partenaires ou employés. Connexion sécurisée aux workflows automatisés et aux bases de données.",
    category: "Services",
    subcategory: "Développement Web",
    language: "fr-FR",
    keywords: ["site", "web", "nextjs", "vercel", "performance", "react", "frontend"],
    priority: 9,
    tags: ["site", "web", "performance", "react", "frontend"],
    is_active: true
  },
  {
    title: "Applications mobiles sur mesure",
    content: "Développement d'applications mobiles iOS/Android avec React Native. Interfaces modernes et intuitives. Connexion sécurisée aux APIs et bases de données. Expériences digitales cohérentes avec votre image de marque.",
    category: "Services",
    subcategory: "Applications Mobiles",
    language: "fr-FR",
    keywords: ["application", "mobile", "ios", "android", "react", "native"],
    priority: 8,
    tags: ["application", "mobile", "ios", "android", "react"],
    is_active: true
  },
  {
    title: "Bases de connaissances & assistants intelligents",
    content: "Connexion à Supabase pour stocker et interroger dynamiquement les contenus (FAQ, offres, articles). Agents intelligents capables de répondre à des questions complexes en temps réel. Indexation et structuration des données pour une recherche rapide et pertinente.",
    category: "Services",
    subcategory: "IA & Knowledge Base",
    language: "fr-FR",
    keywords: ["base", "connaissances", "assistant", "ia", "supabase", "rag"],
    priority: 7,
    tags: ["base", "connaissances", "assistant", "ia", "supabase"],
    is_active: true
  },
  {
    title: "Déploiement sécurisé & infrastructure cloud",
    content: "Mise en place de serveurs cloud (VM) avec Docker, Nginx, DNS, SSL. Reverse proxy et routage sécurisé pour webhooks, APIs, et accès client. Surveillance, alertes et renouvellement automatique des certificats SSL.",
    category: "Services",
    subcategory: "Infrastructure",
    language: "fr-FR",
    keywords: ["cloud", "docker", "nginx", "ssl", "dns", "sécurité"],
    priority: 6,
    tags: ["cloud", "docker", "nginx", "ssl", "sécurité"],
    is_active: true
  },
  {
    title: "Optimisation de la conversion & branding digital",
    content: "Chatbots orientés conversion avec tracking, segmentation et relances. Expériences digitales cohérentes avec votre image de marque. Monitoring de réputation de domaine & SEO technique (Google Search Console).",
    category: "Services",
    subcategory: "Marketing Digital",
    language: "fr-FR",
    keywords: ["conversion", "branding", "seo", "tracking", "marketing"],
    priority: 5,
    tags: ["conversion", "branding", "seo", "marketing"],
    is_active: true
  },

  // English entries
  {
    title: "Intelligent WhatsApp Business Automation",
    content: "Creation of multi-channel chatbots for WhatsApp Business with automation of responses, follow-ups and backend actions. Integration with n8n for automated workflows. Conversational personalization with session tracking, context and conversion. Guaranteed 200% ROI in 90 days.",
    category: "Services",
    subcategory: "Automation",
    language: "en-US",
    keywords: ["whatsapp", "automation", "chatbot", "business", "roi", "n8n", "workflows"],
    priority: 10,
    tags: ["whatsapp", "automation", "chatbot", "business", "roi"],
    is_active: true
  },
  {
    title: "Ultra-fast websites",
    content: "Development of modern websites with Next.js, Vercel and Supabase. Guaranteed performance with optimized Core Web Vitals. Responsive interfaces for customers, partners or employees. Secure connection to automated workflows and databases.",
    category: "Services",
    subcategory: "Web Development",
    language: "en-US",
    keywords: ["website", "web", "nextjs", "vercel", "performance", "react", "frontend"],
    priority: 9,
    tags: ["website", "web", "performance", "react", "frontend"],
    is_active: true
  },
  {
    title: "Custom mobile applications",
    content: "Development of iOS/Android mobile applications with React Native. Modern and intuitive interfaces. Secure connection to APIs and databases. Digital experiences consistent with your brand image.",
    category: "Services",
    subcategory: "Mobile Applications",
    language: "en-US",
    keywords: ["application", "mobile", "ios", "android", "react", "native"],
    priority: 8,
    tags: ["application", "mobile", "ios", "android", "react"],
    is_active: true
  },
  {
    title: "Knowledge bases & intelligent assistants",
    content: "Connection to Supabase to dynamically store and query content (FAQs, offers, articles). Intelligent agents capable of answering complex questions in real time. Indexing and structuring of data for fast and relevant search.",
    category: "Services",
    subcategory: "AI & Knowledge Base",
    language: "en-US",
    keywords: ["knowledge", "base", "assistant", "ai", "supabase", "rag"],
    priority: 7,
    tags: ["knowledge", "base", "assistant", "ai", "supabase"],
    is_active: true
  },
  {
    title: "Secure deployment & cloud infrastructure",
    content: "Setting up cloud servers (VM) with Docker, Nginx, DNS, SSL. Secure reverse proxy and routing for webhooks, APIs, and client access. Monitoring, alerts and automatic renewal of SSL certificates.",
    category: "Services",
    subcategory: "Infrastructure",
    language: "en-US",
    keywords: ["cloud", "docker", "nginx", "ssl", "dns", "security"],
    priority: 6,
    tags: ["cloud", "docker", "nginx", "ssl", "security"],
    is_active: true
  },
  {
    title: "Conversion optimization & digital branding",
    content: "Conversion-oriented chatbots with tracking, segmentation and follow-ups. Digital experiences consistent with your brand image. Domain reputation monitoring & technical SEO (Google Search Console).",
    category: "Services",
    subcategory: "Digital Marketing",
    language: "en-US",
    keywords: ["conversion", "branding", "seo", "tracking", "marketing"],
    priority: 5,
    tags: ["conversion", "branding", "seo", "marketing"],
    is_active: true
  }
];

async function populateKnowledgeBase() {
  console.log('🔍 Populating knowledge base with OMA Digital service offerings...');
  
  try {
    // Insert all knowledge base entries
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(knowledgeBaseEntries);
    
    if (error) {
      console.error('❌ Error inserting knowledge base entries:', error);
      process.exit(1);
    }
    
    console.log(`✅ Successfully inserted ${knowledgeBaseEntries.length} knowledge base entries`);
    console.log('📝 Knowledge base populated with OMA Digital service offerings in French and English');
    
  } catch (error) {
    console.error('❌ Error populating knowledge base:', error);
    process.exit(1);
  }
}

// Run the script
populateKnowledgeBase();