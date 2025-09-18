-- SQL script to manually populate the knowledge base with enhanced OMA Digital services information
-- Run this script directly in the Supabase SQL Editor

-- First, check if the table exists and has the correct structure
-- If there are any issues with the table structure, you may need to recreate it

-- Clear any existing data (optional - uncomment if needed)
-- DELETE FROM knowledge_base;

-- Insert enhanced OMA Digital services information in French
INSERT INTO knowledge_base (title, content, category, language, keywords, is_active) VALUES
('Résumé des offres OMA Digital', 
'OMA est votre partenaire de croissance digitale, spécialisé dans les solutions technologiques conçues sur mesure pour les petites et moyennes entreprises (PME) au Sénégal. Nous traduisons vos besoins en outils digitaux puissants qui vous font gagner du temps et de l''argent.',
'company_overview', 'fr', 
ARRAY['oma', 'partenaire', 'croissance', 'digitale', 'pme', 'senegal', 'outils', 'temps', 'argent'], 
true),

('Création de sites web - OMA Digital',
'Nous créons : Des sites web professionnels qui capturent l''essence de votre marque. Votre gain : Une présence en ligne percutante, optimisée pour le référencement local, qui attire et convertit vos visiteurs en clients.',
'services', 'fr',
ARRAY['site web', 'professionnel', 'marque', 'présence en ligne', 'référencement', 'visiteurs', 'clients'],
true),

('Création d''applications mobiles - OMA Digital',
'Nous créons : Des applications mobiles intuitives pour engager vos clients directement sur leurs smartphones. Votre gain : Une fidélisation accrue, un canal de vente direct et une expérience utilisateur unique qui vous démarque.',
'services', 'fr',
ARRAY['application mobile', 'smartphones', 'fidélisation', 'vente', 'expérience utilisateur'],
true),

('Chatbots & Automatisation - OMA Digital',
'Nous créons : Des chatbots simples et multimodaux qui interagissent par texte et par la voix. Votre gain : Un support client instantané 24/7, une qualification automatique des prospects et une automatisation de WhatsApp et des autres réseaux sociaux pour ne plus perdre une seule demande.',
'services', 'fr',
ARRAY['chatbot', 'automatisation', 'texte', 'voix', 'support client', 'prospects', 'whatsapp', 'réseaux sociaux'],
true),

('Marketing digital - OMA Digital',
'Nous créons : Des stratégies de marketing sur mesure, axées sur la performance. Votre gain : Une visibilité accrue sur les réseaux sociaux, l''acquisition de nouveaux clients et la mise en place de campagnes publicitaires qui génèrent des résultats concrets.',
'services', 'fr',
ARRAY['marketing digital', 'stratégie', 'performance', 'réseaux sociaux', 'clients', 'campagnes', 'résultats'],
true);

-- Insert enhanced OMA Digital services information in English
INSERT INTO knowledge_base (title, content, category, language, keywords, is_active) VALUES
('OMA Digital Services Overview',
'OMA is your digital growth partner, specialized in technological solutions designed specifically for small and medium enterprises (SMEs) in Senegal. We translate your needs into powerful digital tools that save you time and money.',
'company_overview', 'en',
ARRAY['oma', 'growth partner', 'digital', 'sme', 'senegal', 'tools', 'time', 'money'],
true),

('Website Creation - OMA Digital',
'We create: Professional websites that capture your brand''s essence. Your benefit: A powerful online presence, optimized for local SEO, that attracts and converts your visitors into customers.',
'services', 'en',
ARRAY['website', 'professional', 'brand', 'online presence', 'seo', 'visitors', 'customers'],
true),

('Mobile App Development - OMA Digital',
'We create: Intuitive mobile apps to engage your customers directly on their smartphones. Your benefit: Increased customer loyalty, a direct sales channel and a unique user experience that sets you apart.',
'services', 'en',
ARRAY['mobile app', 'smartphones', 'loyalty', 'sales', 'user experience'],
true),

('Chatbots & Automation - OMA Digital',
'We create: Simple and multimodal chatbots that interact through text and voice. Your benefit: Instant 24/7 customer support, automatic prospect qualification and automation of WhatsApp and other social networks so you never lose a single request.',
'services', 'en',
ARRAY['chatbot', 'automation', 'text', 'voice', 'customer support', 'prospects', 'whatsapp', 'social networks'],
true),

('Digital Marketing - OMA Digital',
'We create: Custom marketing strategies focused on performance. Your benefit: Increased visibility on social networks, acquisition of new customers and implementation of advertising campaigns that generate concrete results.',
'services', 'en',
ARRAY['digital marketing', 'strategy', 'performance', 'social networks', 'customers', 'campaigns', 'results'],
true);

-- Verify the insertion by counting the entries
SELECT COUNT(*) as total_entries FROM knowledge_base;
SELECT category, language, COUNT(*) as count FROM knowledge_base GROUP BY category, language ORDER BY category, language;