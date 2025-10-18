-- ============================================
-- BASE DE CONNAISSANCES OMA DIGITAL - VERSION FINALE
-- Informations exactes et vérifiées
-- Date: 2025-01-17
-- ============================================

-- Vider la base existante
DELETE FROM knowledge_base;

-- ============================================
-- FRANÇAIS - CONTACT ET ADRESSES
-- ============================================

INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES

-- Chunk 0: Présence géographique
('Présence géographique OMA DIGITAL',
'OMA DIGITAL est basé entre le Sénégal et le Maroc. L''agence opère depuis deux bureaux principaux : un à Thiès (Sénégal) et un à Casablanca (Maroc). Des services à distance sont disponibles partout ailleurs sur demande.',
'contact', 'fr',
ARRAY['présence', 'géographique', 'sénégal', 'maroc', 'thiès', 'casablanca', 'bureaux', 'localisation', 'où', 'pays']),

-- Chunk 1: Adresse Sénégal
('Adresse OMA DIGITAL au Sénégal',
'📍 Adresse OMA DIGITAL au Sénégal : Hersent Rue 15, Thiès. Ce bureau est dédié aux opérations techniques, aux projets locaux et aux rendez-vous professionnels dans la région.',
'contact', 'fr',
ARRAY['adresse', 'sénégal', 'thiès', 'hersent', 'bureau', 'localisation', 'où', 'technique', 'rendez-vous']),

-- Chunk 2: Adresse Maroc
('Adresse OMA DIGITAL au Maroc',
'📍 Adresse OMA DIGITAL au Maroc : Moustakbal / Sidimaarouf, Casablanca, imm167 Lot GH20 apt 15. Ce bureau est dédié aux opérations commerciales, aux projets cloud et aux services digitaux pour les clients marocains.',
'contact', 'fr',
ARRAY['adresse', 'maroc', 'casablanca', 'moustakbal', 'sidimaarouf', 'bureau', 'localisation', 'où', 'commercial', 'cloud']),

-- Chunk 3: Numéro de téléphone
('Numéro de téléphone OMA DIGITAL',
'📞 Numéro principal OMA DIGITAL : +212 701 193 811. Ce numéro est joignable par appel ou via WhatsApp pour les demandes commerciales, techniques ou partenariats.',
'contact', 'fr',
ARRAY['téléphone', 'numéro', 'phone', 'whatsapp', 'appel', 'contact', 'joindre', '+212', 'appeler']),

-- Chunk 4: Emails
('Emails de contact OMA DIGITAL',
'✉️ Emails de contact OMA DIGITAL : omadigital23@gmail.com et amadou@omadigital.net. Ces adresses sont utilisées pour les devis, les suivis de projet, le support client et les échanges professionnels.',
'contact', 'fr',
ARRAY['email', 'mail', 'contact', 'devis', 'support', 'projet', 'écrire', 'contacter']),

-- Chunk 5: Site web
('Site web officiel OMA DIGITAL',
'🌐 Site web officiel : https://omadigital.net. Le site présente les offres, services, coordonnées, réalisations et formulaires de contact de l''agence.',
'contact', 'fr',
ARRAY['site', 'web', 'internet', 'omadigital.net', 'en ligne', 'portfolio', 'réalisations']);

-- ============================================
-- ANGLAIS - CONTACT AND ADDRESSES
-- ============================================

INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES

-- Chunk 0: Geographic presence
('OMA DIGITAL Geographic Presence',
'OMA DIGITAL is based between Senegal and Morocco. The agency operates from two main offices: one in Thiès (Senegal) and one in Casablanca (Morocco). Remote services are available worldwide on request.',
'contact', 'en',
ARRAY['presence', 'geographic', 'senegal', 'morocco', 'thiès', 'casablanca', 'offices', 'location', 'where', 'countries']),

-- Chunk 1: Senegal office
('OMA DIGITAL Office in Senegal',
'📍 OMA DIGITAL office in Senegal: Hersent Rue 15, Thiès. This location handles technical operations, local projects and professional meetings in the region.',
'contact', 'en',
ARRAY['address', 'senegal', 'thiès', 'hersent', 'office', 'location', 'where', 'technical', 'meeting']),

-- Chunk 2: Morocco office
('OMA DIGITAL Office in Morocco',
'📍 OMA DIGITAL office in Morocco: Moustakbal / Sidimaarouf, Casablanca, imm167 Lot GH20 apt 15. This location handles commercial operations, cloud projects and digital services for Moroccan clients.',
'contact', 'en',
ARRAY['address', 'morocco', 'casablanca', 'moustakbal', 'sidimaarouf', 'office', 'location', 'where', 'commercial', 'cloud']),

-- Chunk 3: Phone number
('OMA DIGITAL Phone Number',
'📞 Main phone number for OMA DIGITAL: +212 701 193 811. Reachable via call or WhatsApp for business inquiries, technical support or partnerships.',
'contact', 'en',
ARRAY['phone', 'number', 'telephone', 'whatsapp', 'call', 'contact', 'reach', '+212', 'calling']),

-- Chunk 4: Contact emails
('OMA DIGITAL Contact Emails',
'✉️ OMA DIGITAL contact emails: omadigital23@gmail.com and amadou@omadigital.net. Used for quotes, project follow-ups, customer support and professional communication.',
'contact', 'en',
ARRAY['email', 'mail', 'contact', 'quote', 'support', 'project', 'write', 'reach']),

-- Chunk 5: Official website
('OMA DIGITAL Official Website',
'🌐 Official website: https://omadigital.net. Showcases OMA DIGITAL''s services, offers, contact details, portfolio and contact forms.',
'contact', 'en',
ARRAY['website', 'site', 'internet', 'omadigital.net', 'online', 'portfolio', 'work']);

-- ============================================
-- FRANÇAIS - SERVICES ET OFFRES
-- ============================================

INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES

-- Chunk 0: Présentation générale
('Présentation générale OMA DIGITAL',
'OMA DIGITAL propose des services digitaux sur mesure pour les PME, startups et institutions. Basée entre le Sénégal et le Maroc, l''agence accompagne ses clients dans leur transformation numérique à travers des solutions concrètes et automatisées.',
'services', 'fr',
ARRAY['services', 'digital', 'pme', 'startup', 'transformation', 'numérique', 'automatisation', 'offres']),

-- Chunk 1: Création de sites web
('Création de sites web professionnels',
'Service : Création de sites web professionnels (vitrine, e-commerce, institutionnel). Fonctionnalités : design responsive, SEO, multilingue, hébergement sécurisé, maintenance. 💡 Un site web bien conçu renforce la crédibilité, permet d''être trouvé sur Google, facilite la prise de contact et les ventes en ligne.',
'services', 'fr',
ARRAY['site', 'web', 'website', 'e-commerce', 'vitrine', 'seo', 'responsive', 'hébergement', 'création']),

-- Chunk 2: Développement d'applications mobiles
('Développement d''applications mobiles',
'Service : Développement d''applications Android/iOS en React Native. Fonctionnalités : notifications push, paiements intégrés, tableaux de bord personnalisés. 💡 Une app mobile permet aux clients d''interagir en mobilité, de commander, réserver ou consulter des services à tout moment.',
'services', 'fr',
ARRAY['application', 'mobile', 'app', 'android', 'ios', 'react native', 'développement', 'smartphone']),

-- Chunk 3: Chatbots simples
('Chatbots simples',
'Service : Chatbots avec réponses automatiques aux FAQ et scripts conversationnels basiques. Canaux : site web, page Facebook, interface directe. 💡 Ces bots réduisent la charge du support, améliorent la réactivité et rassurent les visiteurs en répondant instantanément.',
'services', 'fr',
ARRAY['chatbot', 'bot', 'faq', 'automatique', 'support', 'facebook', 'conversation']),

-- Chunk 4: Chatbots multicanaux
('Chatbots multicanaux',
'Service : Chatbots déployés sur plusieurs canaux (WhatsApp, Telegram, Web, réseaux sociaux). Fonctionnalités : gestion centralisée des conversations, synchronisation des réponses. 💡 Permet aux clients de contacter l''entreprise via leur canal préféré, augmentant l''accessibilité et la satisfaction.',
'services', 'fr',
ARRAY['chatbot', 'multicanal', 'whatsapp', 'telegram', 'web', 'réseaux sociaux', 'omnicanal']),

-- Chunk 5: Chatbots multimodaux
('Chatbots multimodaux',
'Service : Chatbots capables de gérer texte, voix et images. Fonctionnalités : reconnaissance vocale, synthèse vocale, interactions enrichies. 💡 Améliore l''expérience utilisateur, rend le service plus naturel et accessible à tous types de publics.',
'services', 'fr',
ARRAY['chatbot', 'multimodal', 'voix', 'vocal', 'image', 'reconnaissance', 'synthèse']),

-- Chunk 6: Automatisation WhatsApp Business
('Automatisation WhatsApp Business',
'Service : Automatisation sur WhatsApp Business. Fonctionnalités : menus interactifs, réponses automatiques, campagnes programmées, intégration CRM. 💡 WhatsApp est un canal privilégié en Afrique. L''automatisation permet de gérer les commandes, relancer les clients et offrir un support rapide.',
'services', 'fr',
ARRAY['whatsapp', 'automatisation', 'business', 'crm', 'campagne', 'commande', 'support']),

-- Chunk 7: Automatisation Telegram
('Automatisation Telegram',
'Service : Automatisation sur Telegram. Fonctionnalités : bots puissants, gestion de groupes, diffusion d''informations, intégrations API. 💡 Idéal pour les communautés, les services internes, les annonces ciblées et les automatisations complexes.',
'services', 'fr',
ARRAY['telegram', 'automatisation', 'bot', 'groupe', 'communauté', 'api', 'diffusion']),

-- Chunk 8: Automatisation avec intelligence artificielle
('Automatisation avec intelligence artificielle',
'Service : Scripts intelligents basés sur NLP et RAG. Fonctionnalités : classification des demandes, réponses précises, déclenchement d''actions. 💡 L''IA permet de traiter les flux entrants plus rapidement, avec des réponses contextualisées et sourcées.',
'services', 'fr',
ARRAY['ia', 'intelligence artificielle', 'nlp', 'rag', 'automatisation', 'smart', 'intelligent']),

-- Chunk 9: Automatisation sectorielle avec IA
('Automatisation sectorielle avec IA',
'Service : Solutions dédiées pour écoles, hôtels et restaurants. • Écoles : inscriptions, FAQ parents, notifications. • Hôtels : réservations, upsell, check-in digital. • Restaurants : commandes, menus dynamiques. 💡 Ces automatisations fluidifient l''accueil, réduisent les appels et augmentent les ventes ou réservations.',
'services', 'fr',
ARRAY['école', 'hôtel', 'restaurant', 'réservation', 'commande', 'sectoriel', 'automatisation', 'ia']),

-- Chunk 10: Création de VPS sur demande
('Création de VPS sur demande',
'Service : Déploiement de serveurs cloud managés et sécurisés. Fonctionnalités : Nginx, Docker, certificats TLS, monitoring, sauvegardes, accès SSH restreint. 💡 Fournit une infrastructure fiable pour héberger vos sites, apps, chatbots ou services internes, avec sécurité et performance.',
'services', 'fr',
ARRAY['vps', 'serveur', 'cloud', 'hébergement', 'docker', 'nginx', 'infrastructure', 'sécurité']);

-- ============================================
-- ANGLAIS - SERVICES AND OFFERS
-- ============================================

INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES

-- Chunk 0: Overview
('OMA DIGITAL Overview',
'OMA DIGITAL provides tailored digital services for SMEs, startups and institutions. Based between Senegal and Morocco, the agency supports clients in their digital transformation through practical and automated solutions.',
'services', 'en',
ARRAY['services', 'digital', 'sme', 'startup', 'transformation', 'automation', 'offers']),

-- Chunk 1: Website creation
('Professional Website Creation',
'Service: Professional websites (showcase, e-commerce, institutional). Features: responsive design, SEO, multilingual, secure hosting, maintenance. 💡 A well-designed website builds credibility, improves Google visibility, facilitates contact and drives online sales.',
'services', 'en',
ARRAY['website', 'web', 'site', 'e-commerce', 'showcase', 'seo', 'responsive', 'hosting', 'creation']),

-- Chunk 2: Mobile app development
('Mobile App Development',
'Service: Android/iOS apps built with React Native. Features: push notifications, integrated payments, custom dashboards. 💡 A mobile app allows clients to interact on the go, place orders, book services or access content anytime.',
'services', 'en',
ARRAY['application', 'mobile', 'app', 'android', 'ios', 'react native', 'development', 'smartphone']),

-- Chunk 3: Simple chatbots
('Simple Chatbots',
'Service: Chatbots with automated FAQ responses and basic conversational scripts. Channels: website, Facebook page, direct interface. 💡 These bots reduce support workload, improve responsiveness and reassure visitors with instant answers.',
'services', 'en',
ARRAY['chatbot', 'bot', 'faq', 'automated', 'support', 'facebook', 'conversation']),

-- Chunk 4: Multichannel chatbots
('Multichannel Chatbots',
'Service: Chatbots deployed across multiple channels (WhatsApp, Telegram, Web, social media). Features: centralized conversation management, synchronized responses. 💡 Clients can reach the business through their preferred channel, increasing accessibility and satisfaction.',
'services', 'en',
ARRAY['chatbot', 'multichannel', 'whatsapp', 'telegram', 'web', 'social media', 'omnichannel']),

-- Chunk 5: Multimodal chatbots
('Multimodal Chatbots',
'Service: Chatbots that handle text, voice and images. Features: voice recognition, speech synthesis, enriched interactions. 💡 Enhances user experience, makes the service more natural and accessible to diverse audiences.',
'services', 'en',
ARRAY['chatbot', 'multimodal', 'voice', 'vocal', 'image', 'recognition', 'synthesis']),

-- Chunk 6: WhatsApp Business automation
('WhatsApp Business Automation',
'Service: Automation on WhatsApp Business. Features: interactive menus, auto replies, scheduled campaigns, CRM integration. 💡 WhatsApp is a key channel in Africa. Automation helps manage orders, follow up with clients and provide fast support.',
'services', 'en',
ARRAY['whatsapp', 'automation', 'business', 'crm', 'campaign', 'order', 'support']),

-- Chunk 7: Telegram automation
('Telegram Automation',
'Service: Automation on Telegram. Features: powerful bots, group management, information broadcasting, API integrations. 💡 Ideal for communities, internal services, targeted announcements and complex automation.',
'services', 'en',
ARRAY['telegram', 'automation', 'bot', 'group', 'community', 'api', 'broadcast']),

-- Chunk 8: AI-powered automation
('AI-Powered Automation',
'Service: Smart scripts using NLP and RAG. Features: request classification, precise answers, action triggers. 💡 AI enables faster processing of inbound flows with contextual and sourced responses.',
'services', 'en',
ARRAY['ai', 'artificial intelligence', 'nlp', 'rag', 'automation', 'smart', 'intelligent']),

-- Chunk 9: Sector-specific AI automation
('Sector-Specific AI Automation',
'Service: Dedicated solutions for schools, hotels and restaurants. • Schools: enrollment, parent FAQs, notifications. • Hotels: booking, upsells, digital check-in. • Restaurants: orders, dynamic menus. 💡 These automations streamline onboarding, reduce calls and increase bookings or sales.',
'services', 'en',
ARRAY['school', 'hotel', 'restaurant', 'booking', 'order', 'sector', 'automation', 'ai']),

-- Chunk 10: On-demand VPS creation
('On-Demand VPS Creation',
'Service: Deployment of secure, managed cloud servers. Features: Nginx, Docker, TLS certificates, monitoring, backups, restricted SSH access. 💡 Provides reliable infrastructure to host websites, apps, chatbots or internal services with security and performance.',
'services', 'en',
ARRAY['vps', 'server', 'cloud', 'hosting', 'docker', 'nginx', 'infrastructure', 'security']);

-- ============================================
-- FRANÇAIS - PROFIL DU FONDATEUR
-- ============================================

INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES

-- Chunk 0: Identité
('Identité du fondateur OMA DIGITAL',
'Le fondateur et CEO d''OMA DIGITAL est Papa Amadou FALL. Il est créateur, architecte digital et dirigeant de l''agence. Il est basé entre le Sénégal et le Maroc, avec une présence opérationnelle dans les deux pays.',
'about', 'fr',
ARRAY['fondateur', 'ceo', 'papa amadou fall', 'dirigeant', 'créateur', 'qui', 'propriétaire', 'directeur']),

-- Chunk 1: Spécialisation
('Spécialisation du fondateur',
'Papa Amadou FALL est spécialisé dans : l''automatisation sécurisée, la création de chatbots simples, multicanaux et multimodaux, le développement d''applications web et mobiles, l''intégration multicanale et la gestion d''infrastructure cloud. Il maîtrise Nginx, Docker, OAuth, Linux et les environnements serveurs.',
'about', 'fr',
ARRAY['spécialisation', 'compétence', 'expertise', 'automatisation', 'chatbot', 'cloud', 'docker', 'nginx']),

-- Chunk 2: Formation
('Formation du fondateur',
'Formation académique : Master 1 en Management Informatique – ENSUP Afrique (2014), Licence en Gestion Informatisée des Organisations – Université de Thiès (2011–2014).',
'about', 'fr',
ARRAY['formation', 'diplôme', 'master', 'licence', 'université', 'thiès', 'ensup', 'académique']),

-- Chunk 3: Expérience professionnelle
('Expérience professionnelle du fondateur',
'Parcours professionnel : CEO d''OMA DIGITAL (depuis 2023), Support technique bilingue chez Vidéotron (depuis 2020), Développeur Full Stack et ingénieur projet (2014–2016). Expériences en gestion, support client et développement logiciel.',
'about', 'fr',
ARRAY['expérience', 'parcours', 'carrière', 'vidéotron', 'développeur', 'full stack', 'ingénieur']),

-- Chunk 4: Rôle en tant que fondateur
('Rôle du fondateur',
'En tant que fondateur, il définit la vision stratégique de l''agence, supervise les projets techniques et créatifs, garantit la conformité (sécurité, OAuth, accessibilité) et accompagne les entreprises dans leur transformation digitale.',
'about', 'fr',
ARRAY['rôle', 'vision', 'stratégie', 'supervision', 'conformité', 'sécurité', 'transformation']),

-- Chunk 5: Approche et valeurs
('Approche et valeurs du fondateur',
'Son approche est centrée sur : la clarté des processus, la documentation reproductible, l''impact business concret. Ses valeurs : professionnalisme, transparence, fiabilité. Objectif : renforcer la présence digitale des marques africaines et bâtir la confiance client.',
'about', 'fr',
ARRAY['approche', 'valeurs', 'professionnalisme', 'transparence', 'fiabilité', 'mission', 'objectif']);

-- ============================================
-- ANGLAIS - FOUNDER PROFILE
-- ============================================

INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES

-- Chunk 0: Identity
('OMA DIGITAL Founder Identity',
'The founder and CEO of OMA DIGITAL is Papa Amadou FALL. He is the creator, digital architect and leader of the agency. He is based between Senegal and Morocco, with operational presence in both countries.',
'about', 'en',
ARRAY['founder', 'ceo', 'papa amadou fall', 'leader', 'creator', 'who', 'owner', 'director']),

-- Chunk 1: Specialization
('Founder Specialization',
'Papa Amadou FALL specializes in: secure automation, chatbot creation (simple, multichannel, multimodal), web and mobile app development, multi-channel integration and cloud infrastructure management. He is skilled in Nginx, Docker, OAuth, Linux and server environments.',
'about', 'en',
ARRAY['specialization', 'skills', 'expertise', 'automation', 'chatbot', 'cloud', 'docker', 'nginx']),

-- Chunk 2: Education
('Founder Education',
'Academic background: Master''s degree in IT Management – ENSUP Afrique (2014), Bachelor''s degree in Computerized Management of Organizations – Université de Thiès (2011–2014).',
'about', 'en',
ARRAY['education', 'degree', 'master', 'bachelor', 'university', 'thiès', 'ensup', 'academic']),

-- Chunk 3: Professional experience
('Founder Professional Experience',
'Career path: CEO of OMA DIGITAL (since 2023), Bilingual Technical Support at Vidéotron (since 2020), Full Stack Developer and Project Engineer (2014–2016). Experience in management, client support and software development.',
'about', 'en',
ARRAY['experience', 'career', 'path', 'vidéotron', 'developer', 'full stack', 'engineer']),

-- Chunk 4: Role as founder
('Founder Role',
'As founder, he defines the strategic vision of the agency, oversees technical and creative projects, ensures compliance (security, OAuth, accessibility) and supports businesses in their digital transformation.',
'about', 'en',
ARRAY['role', 'vision', 'strategy', 'oversight', 'compliance', 'security', 'transformation']),

-- Chunk 5: Approach and values
('Founder Approach and Values',
'His approach focuses on: process clarity, reproducible documentation, measurable business impact. Core values: professionalism, transparency, reliability. Goal: strengthen the digital presence of African brands and build client trust.',
'about', 'en',
ARRAY['approach', 'values', 'professionalism', 'transparency', 'reliability', 'mission', 'goal']);

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  language,
  category,
  COUNT(*) as total_chunks,
  STRING_AGG(title, ' | ') as titles
FROM knowledge_base
GROUP BY language, category
ORDER BY language, category;

-- Vérification des informations critiques
SELECT 
  language,
  title,
  CASE 
    WHEN content LIKE '%+212 701 193 811%' THEN '✅ Téléphone OK'
    ELSE '❌ Téléphone manquant'
  END as phone_check,
  CASE 
    WHEN content LIKE '%Thiès%' THEN '✅ Thiès OK'
    ELSE '❌ Thiès manquant'
  END as thies_check,
  CASE 
    WHEN content LIKE '%Casablanca%' THEN '✅ Casablanca OK'
    ELSE '❌ Casablanca manquant'
  END as casa_check,
  CASE 
    WHEN content LIKE '%omadigital23@gmail.com%' THEN '✅ Email 1 OK'
    ELSE '❌ Email 1 manquant'
  END as email1_check,
  CASE 
    WHEN content LIKE '%amadou@omadigital.net%' THEN '✅ Email 2 OK'
    ELSE '❌ Email 2 manquant'
  END as email2_check
FROM knowledge_base
WHERE category = 'contact'
ORDER BY language, title;
