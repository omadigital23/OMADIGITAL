-- Insert sample knowledge base data for OMA Digital
INSERT INTO knowledge_base (title, content, category, subcategory, language, keywords, priority, tags, is_active) VALUES

-- Services
('Services OMA Digital', 'OMA Digital propose 9 services principaux : Site Vitrine (5 000 DH), E-commerce Essentiel (10 000 DH), Application Mobile MVP (à partir de 10 999 DH), Application Mobile Standard (à partir de 20 000 DH), Chatbot IA RAG (10 000 DH + 500 DH/mois), Bot Simple WhatsApp/Telegram (3 000 DH + 500 DH/mois), Automatisation IA (à partir de 5 999 DH), Marketing Digital (3 500 DH/mois), Création Vidéo (à partir de 5 000 DH).', 'services', 'general', 'fr-FR', ARRAY['services', 'tarifs', 'prix'], 10, ARRAY['services', 'pricing'], true),

('Site Vitrine', 'Site vitrine professionnel avec design sur mesure, optimisation SEO, adaptabilité mobile et maintenance facile. Technologies : Next.js, React, TypeScript, Tailwind CSS. Prix : 5 000 DH. Idéal pour petites entreprises, entrepreneurs individuels, artistes.', 'services', 'web', 'fr-FR', ARRAY['site vitrine', 'site web', 'next.js', 'react'], 9, ARRAY['web', 'vitrine'], true),

('E-commerce', 'Boutique en ligne performante et sécurisée avec gestion de stock, suivi des commandes, paiement sécurisé. Technologies : Next.js, React, TypeScript, Tailwind CSS, Stripe, PayPal. Prix : 10 000 DH. Pour commerces de détail et vente en ligne.', 'services', 'ecommerce', 'fr-FR', ARRAY['e-commerce', 'boutique en ligne', 'stripe', 'paypal'], 9, ARRAY['ecommerce', 'online-store'], true),

('Application Mobile MVP', 'Version initiale d''application mobile pour tester votre concept. Développement rapide, interfaces intuitives, compatibilité multiplateforme. Technologies : React Native, Flutter, Firebase, API REST. Prix : à partir de 10 999 DH.', 'services', 'mobile', 'fr-FR', ARRAY['application mobile', 'mvp', 'react native', 'flutter'], 8, ARRAY['mobile', 'mvp'], true),

('Application Mobile Standard', 'Application mobile complète avec fonctionnalités avancées, performance optimisée, sécurisation des données. Technologies : React Native, Flutter, Swift, Kotlin. Prix : à partir de 20 000 DH.', 'services', 'mobile', 'fr-FR', ARRAY['application mobile', 'swift', 'kotlin'], 8, ARRAY['mobile', 'standard'], true),

('Chatbot IA RAG', 'Chatbot intelligent avec IA personnalisée, apprentissage automatique, intégration omnicanal. Technologies : Gemini AI, RAG, Vector DB, Next.js. Prix : 10 000 DH + 500 DH/mois.', 'services', 'ai', 'fr-FR', ARRAY['chatbot', 'ia', 'gemini', 'rag'], 8, ARRAY['ai', 'chatbot'], true),

('Bot Simple', 'Bot simple pour WhatsApp/Telegram avec réponses automatiques et gestion de contacts. Technologies : Dialogflow, Webhook, API. Prix : 3 000 DH + 500 DH/mois.', 'services', 'bot', 'fr-FR', ARRAY['bot', 'whatsapp', 'telegram', 'dialogflow'], 7, ARRAY['bot', 'messaging'], true),

('Marketing Digital', 'Gestion complète de vos campagnes digitales : Google Ads, Facebook Ads, création de contenu, analyse et rapports. Prix : 3 500 DH/mois.', 'services', 'marketing', 'fr-FR', ARRAY['marketing digital', 'google ads', 'facebook ads', 'seo'], 8, ARRAY['marketing', 'digital'], true),

-- Company Info
('À propos OMA Digital', 'OMA Digital est une agence digitale basée à Casablanca (Maroc) dirigée par Amadou Fall. Adresse : Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt 15. Email : omadigital23@gmail.com. Téléphone : +212 701 193 811.', 'company', 'about', 'fr-FR', ARRAY['oma digital', 'amadou fall', 'casablanca', 'maroc'], 10, ARRAY['company', 'contact'], true),

('Contact OMA Digital', 'Pour nous contacter : Email omadigital23@gmail.com, Téléphone +212 701 193 811, Adresse Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt 15, Maroc. Devis gratuit disponible.', 'company', 'contact', 'fr-FR', ARRAY['contact', 'devis', 'email', 'téléphone'], 10, ARRAY['contact', 'quote'], true),

-- Technologies
('Technologies Web', 'OMA Digital utilise les dernières technologies : Next.js, React, TypeScript, Tailwind CSS pour le développement web. Pour mobile : React Native, Flutter, Swift, Kotlin. Pour l''IA : Gemini AI, RAG, Vector DB.', 'technical', 'technologies', 'fr-FR', ARRAY['next.js', 'react', 'typescript', 'tailwind'], 7, ARRAY['tech', 'development'], true),

-- Process
('Processus de Commande', 'Processus simple : 1) Demande de devis gratuit, 2) Analyse des besoins, 3) Signature du contrat avec acompte 50%, 4) Développement, 5) Livraison et solde 50%. Devis valable 30 jours.', 'process', 'order', 'fr-FR', ARRAY['commande', 'devis', 'processus', 'paiement'], 8, ARRAY['process', 'order'], true);

-- Note: You'll need to generate embeddings for these entries using your embedding model
-- This can be done through a separate script or API call