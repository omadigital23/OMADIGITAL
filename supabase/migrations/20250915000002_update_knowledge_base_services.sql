-- Mise à jour de la base de connaissances avec les vrais services OMA Digital
-- Incluant développement applications mobiles

-- Nettoyer les anciennes données
DELETE FROM knowledge_base WHERE category = 'services';

-- Insérer les nouveaux services détaillés
INSERT INTO knowledge_base (title, content, category, language, keywords, is_active) VALUES

-- Services principaux en français
('Développement Applications Mobiles OMA',
'Nous créons des applications mobiles sur mesure, parfaitement adaptées à vos besoins. De la conception d''une app e-commerce élégante à la création d''un outil de gestion interne complexe, nous développons des plateformes robustes, sécurisées et intuitives qui évoluent avec votre entreprise. Technologies : React Native, Flutter, iOS, Android.',
'services', 'fr',
ARRAY['application mobile', 'app', 'développement mobile', 'ios', 'android', 'react native', 'flutter', 'mobile']),

('Automatisation Intelligente IA et Chatbots',
'Libérez-vous des tâches répétitives avec nos solutions d''automatisation par intelligence artificielle. Nos chatbots intelligents gèrent des conversations complexes sur WhatsApp Business, site web, Facebook, Instagram. Ils interagissent naturellement avec vos clients, répondent 24/7 et qualifient des leads pour votre équipe.',
'services', 'fr',
ARRAY['automatisation', 'ia', 'chatbot', 'whatsapp', 'intelligence artificielle', 'automation', 'bot']),

('Développement Web sur Mesure',
'Votre présence en ligne est votre vitrine. Nous créons des sites web sur mesure adaptés à vos besoins. Boutiques en ligne élégantes, outils de gestion internes, plateformes robustes et sécurisées qui évoluent avec votre entreprise. Technologies modernes, chargement ultra-rapide.',
'services', 'fr',
ARRAY['site web', 'développement web', 'boutique en ligne', 'e-commerce', 'website', 'web']),

('Gestion Avancée Réseaux Sociaux',
'Transformez vos réseaux sociaux en moteur de croissance. Stratégies d''automatisation pour gérer interactions, programmer publications, analyser performance. Intégration directe Facebook, Instagram pour rester connecté avec votre audience sans effort.',
'services', 'fr',
ARRAY['réseaux sociaux', 'facebook', 'instagram', 'social media', 'automatisation', 'marketing']),

-- Services en anglais
('Mobile App Development OMA',
'We create custom mobile applications perfectly adapted to your needs. From designing elegant e-commerce apps to creating complex internal management tools, we develop robust, secure and intuitive platforms that evolve with your business. Technologies: React Native, Flutter, iOS, Android.',
'services', 'en',
ARRAY['mobile app', 'application', 'mobile development', 'ios', 'android', 'react native', 'flutter', 'app']),

('AI Automation and Intelligent Chatbots',
'Free yourself from repetitive tasks with our AI automation solutions. Our intelligent chatbots handle complex conversations on WhatsApp Business, websites, Facebook, Instagram. They interact naturally with customers, respond 24/7 and qualify leads for your sales team.',
'services', 'en',
ARRAY['automation', 'ai', 'chatbot', 'whatsapp', 'artificial intelligence', 'bot', 'intelligent']),

('Custom Web Development',
'Your online presence is your showcase. We create custom websites adapted to your needs. Elegant online stores, internal management tools, robust and secure platforms that evolve with your business. Modern technologies, ultra-fast loading.',
'services', 'en',
ARRAY['website', 'web development', 'online store', 'e-commerce', 'web', 'development']),

-- Technologies spécifiques
('Technologies Mobiles Supportées',
'Nous maîtrisons les technologies mobiles les plus avancées : React Native pour le développement cross-platform, Flutter pour des performances natives, développement natif iOS (Swift) et Android (Kotlin). Applications hybrides ou natives selon vos besoins et budget.',
'technical', 'fr',
ARRAY['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'cross-platform', 'natif']),

('Mobile Technologies Supported',
'We master the most advanced mobile technologies: React Native for cross-platform development, Flutter for native performance, native iOS (Swift) and Android (Kotlin) development. Hybrid or native applications according to your needs and budget.',
'technical', 'en',
ARRAY['react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'cross-platform', 'native']);

-- Mettre à jour les statistiques de la table
ANALYZE knowledge_base;