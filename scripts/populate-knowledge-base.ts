import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Knowledge base entries in multiple languages
const knowledgeBaseEntries = [
  // French entries
  {
    title: "Création de Chatbots Multicanaux",
    content: `Nous créons des chatbots intelligents qui fonctionnent sur plusieurs plateformes :
- WhatsApp Business pour automatiser vos conversations clients
- Sites web avec interfaces conversationnelles modernes
- Facebook Messenger et autres canaux
- Intégration avec n8n pour automatiser les processus backend
- Suivi de session et contexte conversationnel pour une expérience personnalisée
- Optimisation pour la conversion avec tracking et relances automatiques`,
    category: "Services",
    subcategory: "Chatbots",
    language: "fr-FR",
    keywords: ["chatbot", "whatsapp", "automatisation", "conversation", "multicanal", "n8n"],
    priority: 9,
    tags: ["automatisation", "conversation", "ia", "client", "vente"]
  },
  {
    title: "Infrastructure Cloud Sécurisée",
    content: `Déploiement d'infrastructures cloud robustes et sécurisées :
- Configuration de serveurs virtuels (VM) avec Docker
- Mise en place de Nginx pour le reverse proxy
- Gestion DNS et certificats SSL avec renouvellement automatique
- Routage sécurisé pour webhooks, APIs et accès client
- Surveillance continue avec alertes en temps réel
- Maintenance et mises à jour automatisées`,
    category: "Services",
    subcategory: "Infrastructure",
    language: "fr-FR",
    keywords: ["cloud", "docker", "nginx", "ssl", "sécurité", "serveur"],
    priority: 8,
    tags: ["infrastructure", "sécurité", "cloud", "devops", "maintenance"]
  },
  {
    title: "Bases de Connaissances Intelligentes",
    content: `Systèmes de gestion de connaissances avec Supabase :
- Stockage et interrogation dynamique de contenus (FAQ, offres, articles)
- Agents intelligents capables de répondre à des questions complexes
- Indexation et structuration des données pour recherche rapide
- Mise à jour en temps réel des informations
- Personnalisation selon le profil utilisateur
- Tracking d'utilisation pour amélioration continue`,
    category: "Services",
    subcategory: "Knowledge Base",
    language: "fr-FR",
    keywords: ["knowledge base", "supabase", "faq", "base de données", "recherche"],
    priority: 7,
    tags: ["knowledge", "base de données", "faq", "recherche", "intelligence"]
  },
  {
    title: "Applications Web et Mobiles",
    content: `Développement d'applications sur mesure :
- Interfaces modernes et réactives avec Next.js
- Déploiement sur Vercel pour performance optimale
- Connexion sécurisée aux bases de données Supabase
- Expériences utilisateurs cohérentes avec votre marque
- Optimisation pour mobile et desktop
- Intégration avec workflows automatisés`,
    category: "Services",
    subcategory: "Développement",
    language: "fr-FR",
    keywords: ["application", "web", "mobile", "nextjs", "vercel", "interface"],
    priority: 8,
    tags: ["développement", "web", "mobile", "interface", "nextjs"]
  },
  {
    title: "Optimisation de Conversion",
    content: `Stratégies d'optimisation de conversion :
- Chatbots orientés conversion avec tracking et segmentation
- Relances automatiques personnalisées
- Expériences digitales cohérentes avec votre image de marque
- Monitoring de réputation de domaine
- SEO technique avec Google Search Console
- Analytics avancés pour mesure de performance`,
    category: "Services",
    subcategory: "Marketing",
    language: "fr-FR",
    keywords: ["conversion", "seo", "marketing", "tracking", "analytics"],
    priority: 9,
    tags: ["conversion", "marketing", "seo", "analytics", "performance"]
  },

  // English entries
  {
    title: "Multichannel Chatbot Creation",
    content: `We create intelligent chatbots that work across multiple platforms:
- WhatsApp Business for automating customer conversations
- Websites with modern conversational interfaces
- Facebook Messenger and other channels
- Integration with n8n for automating backend processes
- Session tracking and conversational context for personalized experience
- Conversion optimization with tracking and automatic follow-ups`,
    category: "Services",
    subcategory: "Chatbots",
    language: "en-US",
    keywords: ["chatbot", "whatsapp", "automation", "conversation", "multichannel", "n8n"],
    priority: 9,
    tags: ["automation", "conversation", "ai", "customer", "sales"]
  },
  {
    title: "Secure Cloud Infrastructure",
    content: `Deployment of robust and secure cloud infrastructures:
- Configuration of virtual servers (VM) with Docker
- Setup of Nginx for reverse proxy
- DNS management and SSL certificates with automatic renewal
- Secure routing for webhooks, APIs and client access
- Continuous monitoring with real-time alerts
- Automated maintenance and updates`,
    category: "Services",
    subcategory: "Infrastructure",
    language: "en-US",
    keywords: ["cloud", "docker", "nginx", "ssl", "security", "server"],
    priority: 8,
    tags: ["infrastructure", "security", "cloud", "devops", "maintenance"]
  },
  {
    title: "Intelligent Knowledge Bases",
    content: `Knowledge management systems with Supabase:
- Storage and dynamic querying of content (FAQ, offers, articles)
- Intelligent agents capable of answering complex questions
- Data indexing and structuring for fast search
- Real-time information updates
- Personalization according to user profile
- Usage tracking for continuous improvement`,
    category: "Services",
    subcategory: "Knowledge Base",
    language: "en-US",
    keywords: ["knowledge base", "supabase", "faq", "database", "search"],
    priority: 7,
    tags: ["knowledge", "database", "faq", "search", "intelligence"]
  },
  {
    title: "Web and Mobile Applications",
    content: `Custom application development:
- Modern and responsive interfaces with Next.js
- Deployment on Vercel for optimal performance
- Secure connection to Supabase databases
- User experiences consistent with your brand
- Optimization for mobile and desktop
- Integration with automated workflows`,
    category: "Services",
    subcategory: "Development",
    language: "en-US",
    keywords: ["application", "web", "mobile", "nextjs", "vercel", "interface"],
    priority: 8,
    tags: ["development", "web", "mobile", "interface", "nextjs"]
  },
  {
    title: "Conversion Optimization",
    content: `Conversion optimization strategies:
- Conversion-oriented chatbots with tracking and segmentation
- Personalized automatic follow-ups
- Digital experiences consistent with your brand image
- Domain reputation monitoring
- Technical SEO with Google Search Console
- Advanced analytics for performance measurement`,
    category: "Services",
    subcategory: "Marketing",
    language: "en-US",
    keywords: ["conversion", "seo", "marketing", "tracking", "analytics"],
    priority: 9,
    tags: ["conversion", "marketing", "seo", "analytics", "performance"]
  },

  // Spanish entries
  {
    title: "Creación de Chatbots Multicanal",
    content: `Creamos chatbots inteligentes que funcionan en múltiples plataformas:
- WhatsApp Business para automatizar conversaciones con clientes
- Sitios web con interfaces conversacionales modernas
- Facebook Messenger y otros canales
- Integración con n8n para automatizar procesos backend
- Seguimiento de sesiones y contexto conversacional para experiencia personalizada
- Optimización de conversión con seguimiento y seguimientos automáticos`,
    category: "Services",
    subcategory: "Chatbots",
    language: "es-ES",
    keywords: ["chatbot", "whatsapp", "automatización", "conversación", "multicanal", "n8n"],
    priority: 9,
    tags: ["automatización", "conversación", "ia", "cliente", "venta"]
  },
  {
    title: "Infraestructura Cloud Segura",
    content: `Despliegue de infraestructuras cloud robustas y seguras:
- Configuración de servidores virtuales (VM) con Docker
- Configuración de Nginx para proxy inverso
- Gestión de DNS y certificados SSL con renovación automática
- Enrutamiento seguro para webhooks, APIs y acceso de clientes
- Supervisión continua con alertas en tiempo real
- Mantenimiento y actualizaciones automatizadas`,
    category: "Services",
    subcategory: "Infrastructure",
    language: "es-ES",
    keywords: ["cloud", "docker", "nginx", "ssl", "seguridad", "servidor"],
    priority: 8,
    tags: ["infraestructura", "seguridad", "cloud", "devops", "mantenimiento"]
  },

  // Arabic entries
  {
    title: "إنشاء روبوتات الدردشة متعددة القنوات",
    content: `نقوم بإنشاء روبوتات دردشة ذكية تعمل على منصات متعددة:
- واتساب بيزنس لأتمتة محادثات العملاء
- المواقع الإلكترونية مع واجهات محادثة حديثة
- فيسبوك ماسنجر وقنوات أخرى
- التكامل مع n8n لأتمتة العمليات الخلفية
- تتبع الجلسات والسياق المحادثة لتجربة مخصصة
- تحسين التحويل مع التتبع والمتابعات التلقائية`,
    category: "Services",
    subcategory: "Chatbots",
    language: "ar-SA",
    keywords: ["روبوت دردشة", "واتساب", "أتمتة", "محادثة", "متعدد القنوات", "n8n"],
    priority: 9,
    tags: ["أتمتة", "محادثة", "ذكاء اصطناعي", "عميل", "مبيعات"]
  }
];

async function populateKnowledgeBase() {
  try {
    // Insert knowledge base entries
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert(knowledgeBaseEntries);

    if (error) {
      console.error('Error inserting knowledge base entries:', error);
      return;
    }

    console.log('Knowledge base populated successfully!');
    console.log(`Inserted ${knowledgeBaseEntries.length} entries`);
    
    // Verify insertion by counting entries
    const { count, error: countError } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact' });

    if (countError) {
      console.error('Error counting entries:', countError);
      return;
    }

    console.log(`Total knowledge base entries: ${count}`);
  } catch (error) {
    console.error('Error populating knowledge base:', error);
  }
}

// Run the script
populateKnowledgeBase();