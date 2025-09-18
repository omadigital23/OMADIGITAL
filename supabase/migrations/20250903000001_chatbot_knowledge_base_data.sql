-- Données initiales pour la base de connaissances OMA Digital
-- Contenu bilingue français/anglais

-- Services OMA Digital en français
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('Services d''automatisation WhatsApp', 
'OMA Digital propose des solutions d''automatisation WhatsApp pour PME sénégalaises. Nos services incluent : chatbots intelligents, réponses automatiques, gestion des commandes, suivi client, intégration CRM. Prix : 50 000 CFA/mois avec ROI garanti de 200% en 6 mois. Parfait pour restaurants, boutiques, services, e-commerce.',
'services', 'fr', 
ARRAY['whatsapp', 'automatisation', 'chatbot', 'pme', 'senegal', 'roi', 'prix', 'tarif']),

('Développement web et mobile',
'OMA Digital développe des sites web modernes et applications mobiles pour entreprises sénégalaises. Technologies : React, Next.js, React Native, Node.js. Services : sites vitrine, e-commerce, applications métier, maintenance. Responsive design, SEO optimisé, hébergement inclus.',
'services', 'fr',
ARRAY['site web', 'application mobile', 'développement', 'react', 'nextjs', 'ecommerce']),

('Transformation digitale PME',
'Accompagnement complet des PME dans leur transformation digitale. Audit digital, stratégie, formation équipes, mise en place outils, suivi performance. Spécialisé secteur sénégalais : commerce, restauration, services, artisanat.',
'services', 'fr',
ARRAY['transformation digitale', 'pme', 'audit', 'formation', 'stratégie']),

('Contact et support',
'Contactez OMA Digital : Téléphone/WhatsApp +212 701 193 811, Email omasenegal25@gmail.com. Horaires : Lundi-Vendredi 9h-18h. Support technique 24/7. Devis gratuit sous 24h. Siège social Dakar, interventions tout Sénégal.',
'contact', 'fr',
ARRAY['contact', 'téléphone', 'email', 'support', 'devis', 'dakar']),

('Tarification et ROI',
'Nos solutions se remboursent en 3 mois grâce aux ventes qu''elles génèrent ! ROI garanti +200% en 6 mois. Investissement accessible aux PME. Chaque projet est unique selon vos besoins. Devis personnalisé gratuit en 24h.',
'pricing', 'fr',
ARRAY['prix', 'tarif', 'roi', 'devis', 'investissement', 'rentable']);

-- Services OMA Digital en anglais
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('WhatsApp Automation Services',
'OMA Digital provides WhatsApp automation solutions for Senegalese SMEs. Our services include: intelligent chatbots, automatic responses, order management, customer tracking, CRM integration. Price: 50,000 CFA/month with guaranteed 200% ROI in 6 months. Perfect for restaurants, shops, services, e-commerce.',
'services', 'en',
ARRAY['whatsapp', 'automation', 'chatbot', 'sme', 'senegal', 'roi', 'price', 'cost']),

('Web and Mobile Development',
'OMA Digital develops modern websites and mobile applications for Senegalese businesses. Technologies: React, Next.js, React Native, Node.js. Services: showcase sites, e-commerce, business applications, maintenance. Responsive design, SEO optimized, hosting included.',
'services', 'en',
ARRAY['website', 'mobile app', 'development', 'react', 'nextjs', 'ecommerce']),

('Digital Transformation for SMEs',
'Complete support for SMEs in their digital transformation. Digital audit, strategy, team training, tool implementation, performance monitoring. Specialized in Senegalese sector: commerce, restaurants, services, crafts.',
'services', 'en',
ARRAY['digital transformation', 'sme', 'audit', 'training', 'strategy']),

('Contact and Support',
'Contact OMA Digital: Phone/WhatsApp +212 701 193 811, Email omasenegal25@gmail.com. Hours: Monday-Friday 9am-6pm. 24/7 technical support. Free quote within 24h. Head office Dakar, interventions throughout Senegal.',
'contact', 'en',
ARRAY['contact', 'phone', 'email', 'support', 'quote', 'dakar']),

('Pricing and ROI',
'Our solutions pay for themselves within 3 months through the sales they generate! Guaranteed ROI +200% in 6 months. Accessible investment for SMEs. Each project is unique according to your needs. Free personalized quote in 24h.',
'pricing', 'en',
ARRAY['price', 'cost', 'roi', 'quote', 'investment', 'profitable']);

-- FAQ bilingue
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('Questions fréquentes - Automatisation',
'Q: Comment fonctionne l''automatisation WhatsApp ? R: Notre système utilise l''IA pour répondre automatiquement aux clients, traiter les commandes, programmer des rappels. Q: Combien de temps pour la mise en place ? R: 48h maximum. Q: Formation incluse ? R: Oui, formation complète de votre équipe.',
'faq', 'fr',
ARRAY['faq', 'questions', 'automatisation', 'formation', 'délai']),

('Frequently Asked Questions - Automation',
'Q: How does WhatsApp automation work? A: Our system uses AI to automatically respond to customers, process orders, schedule reminders. Q: How long for setup? A: Maximum 48h. Q: Training included? A: Yes, complete training for your team.',
'faq', 'en',
ARRAY['faq', 'questions', 'automation', 'training', 'setup']);

-- Cas d'usage spécifiques
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('Restaurants et livraison',
'Automatisation parfaite pour restaurants : prise de commandes automatique, menu digital, confirmation livraison, avis clients, promotions. Intégration possible avec systèmes de caisse existants. Augmentation moyenne des ventes de 40%.',
'use_cases', 'fr',
ARRAY['restaurant', 'livraison', 'commandes', 'menu', 'caisse']),

('E-commerce et boutiques',
'Solution idéale pour boutiques en ligne : catalogue produits, gestion stock, paiement mobile money, suivi commandes, service client automatisé. Compatible Orange Money, Wave, Free Money.',
'use_cases', 'fr',
ARRAY['ecommerce', 'boutique', 'catalogue', 'stock', 'mobile money']),

('Restaurants and Delivery',
'Perfect automation for restaurants: automatic order taking, digital menu, delivery confirmation, customer reviews, promotions. Possible integration with existing POS systems. Average sales increase of 40%.',
'use_cases', 'en',
ARRAY['restaurant', 'delivery', 'orders', 'menu', 'pos']),

('E-commerce and Shops',
'Ideal solution for online shops: product catalog, inventory management, mobile money payment, order tracking, automated customer service. Compatible with Orange Money, Wave, Free Money.',
'use_cases', 'en',
ARRAY['ecommerce', 'shop', 'catalog', 'inventory', 'mobile money']);

-- Informations techniques
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('Sécurité et conformité',
'OMA Digital respecte les standards de sécurité : chiffrement end-to-end, conformité RGPD, sauvegarde automatique, accès sécurisé. Données hébergées au Sénégal. Certification ISO 27001 en cours.',
'technical', 'fr',
ARRAY['sécurité', 'rgpd', 'chiffrement', 'sauvegarde', 'iso']),

('Security and Compliance',
'OMA Digital meets security standards: end-to-end encryption, GDPR compliance, automatic backup, secure access. Data hosted in Senegal. ISO 27001 certification in progress.',
'technical', 'en',
ARRAY['security', 'gdpr', 'encryption', 'backup', 'iso']);