-- ============================================================
-- MISE À JOUR COMPLÈTE DES MOTS-CLÉS RAG
-- Basé sur les chunks fournis pour améliorer la recherche
-- ============================================================

-- 🇫🇷 FRANÇAIS

-- Présentation générale
UPDATE knowledge_base SET keywords = ARRAY[
  'oma digital', 'agence', 'digitale', 'digital', 'sénégal', 'maroc', 
  'pme', 'startup', 'institution', 'transformation', 'numérique', 
  'automatisation', 'automatisé', 'accessible', 'évolutif', 'solution',
  'accompagnement', 'services', 'offres', 'présentation', 'qui sommes nous'
]
WHERE title ILIKE '%Présentation générale%' AND language = 'fr';

-- Sites web
UPDATE knowledge_base SET keywords = ARRAY[
  'site', 'web', 'website', 'vitrine', 'e-commerce', 'boutique', 'institutionnel',
  'responsive', 'seo', 'référencement', 'multilingue', 'hébergement', 'maintenance',
  'crédibilité', 'google', 'visibilité', 'contact', 'vente', 'en ligne',
  'création', 'développement', 'design', 'professionnel'
]
WHERE title ILIKE '%sites web%' AND language = 'fr';

-- Applications mobiles
UPDATE knowledge_base SET keywords = ARRAY[
  'application', 'app', 'mobile', 'android', 'ios', 'smartphone',
  'react native', 'notification', 'push', 'paiement', 'tableau de bord',
  'mobilité', 'commander', 'réserver', 'interaction', 'développement'
]
WHERE title ILIKE '%applications mobiles%' AND language = 'fr';

-- Chatbots simples
UPDATE knowledge_base SET keywords = ARRAY[
  'chatbot', 'bot', 'simple', 'faq', 'automatique', 'réponse',
  'conversationnel', 'script', 'support', 'réactivité', 'visiteur',
  'assistance', 'aide', 'question', 'réponse automatique'
]
WHERE title ILIKE '%Chatbots simples%' AND language = 'fr';

-- Chatbots multicanaux
UPDATE knowledge_base SET keywords = ARRAY[
  'chatbot', 'multicanal', 'omnicanal', 'whatsapp', 'telegram', 'web',
  'réseaux sociaux', 'facebook', 'instagram', 'canal', 'accessibilité',
  'client', 'contact', 'déploiement', 'synchronisation'
]
WHERE title ILIKE '%multicanaux%' AND language = 'fr';

-- Chatbots multimodaux
UPDATE knowledge_base SET keywords = ARRAY[
  'chatbot', 'multimodal', 'texte', 'voix', 'vocal', 'image', 'photo',
  'reconnaissance', 'synthèse', 'expérience', 'naturel', 'inclusif',
  'accessibilité', 'audio', 'visuel'
]
WHERE title ILIKE '%multimodaux%' AND language = 'fr';

-- WhatsApp Business
UPDATE knowledge_base SET keywords = ARRAY[
  'whatsapp', 'business', 'wa', 'menu', 'interactif', 'automatique',
  'campagne', 'programmé', 'crm', 'afrique', 'relance', 'commande',
  'suivi', 'support', 'rapide', 'client', 'message'
]
WHERE title ILIKE '%WhatsApp%' AND language = 'fr';

-- Telegram
UPDATE knowledge_base SET keywords = ARRAY[
  'telegram', 'bot', 'puissant', 'groupe', 'diffusion', 'information',
  'api', 'intégration', 'communauté', 'service', 'interne', 'automatisation',
  'complexe', 'annonce', 'notification'
]
WHERE title ILIKE '%Telegram%' AND language = 'fr';

-- IA
UPDATE knowledge_base SET keywords = ARRAY[
  'ia', 'intelligence artificielle', 'ai', 'nlp', 'rag', 'smart',
  'intelligent', 'script', 'précis', 'rapide', 'contexte', 'traitement',
  'flux', 'classification', 'réponse', 'automatisation'
]
WHERE title ILIKE '%intelligence%' AND language = 'fr';

-- Sectoriel
UPDATE knowledge_base SET keywords = ARRAY[
  'école', 'hôtel', 'restaurant', 'secteur', 'sectoriel', 'spécialisé',
  'réservation', 'commande', 'inscription', 'parent', 'check-in',
  'menu', 'upsell', 'vente', 'accueil', 'appel', 'notification'
]
WHERE title ILIKE '%sectoriel%' AND language = 'fr';

-- VPS
UPDATE knowledge_base SET keywords = ARRAY[
  'vps', 'serveur', 'cloud', 'hébergement', 'hosting', 'nginx', 'docker',
  'tls', 'ssl', 'certificat', 'monitoring', 'sauvegarde', 'backup',
  'ssh', 'sécurité', 'performance', 'infrastructure', 'managé'
]
WHERE title ILIKE '%VPS%' AND language = 'fr';

-- Fondateur - Identité
UPDATE knowledge_base SET keywords = ARRAY[
  'fondateur', 'ceo', 'papa amadou fall', 'amadou fall', 'dirigeant',
  'créateur', 'propriétaire', 'directeur', 'qui', 'identité', 'chef',
  'patron', 'gérant', 'responsable'
]
WHERE title ILIKE '%Identité du fondateur%' AND language = 'fr';

-- Fondateur - Spécialisation
UPDATE knowledge_base SET keywords = ARRAY[
  'spécialisation', 'compétence', 'expertise', 'automatisation', 'sécurisé',
  'chatbot', 'web', 'mobile', 'multicanal', 'intégration', 'cloud',
  'nginx', 'docker', 'oauth', 'linux', 'serveur', 'technique'
]
WHERE title ILIKE '%Spécialisation%' AND language = 'fr';

-- Fondateur - Formation
UPDATE knowledge_base SET keywords = ARRAY[
  'formation', 'diplôme', 'master', 'licence', 'université', 'thiès',
  'ensup', 'afrique', 'académique', 'études', 'éducation', 'management',
  'informatique', 'gestion', 'cursus'
]
WHERE title ILIKE '%Formation%' AND language = 'fr';

-- Fondateur - Expérience
UPDATE knowledge_base SET keywords = ARRAY[
  'expérience', 'parcours', 'carrière', 'vidéotron', 'développeur',
  'full stack', 'ingénieur', 'support', 'technique', 'bilingue',
  'projet', 'professionnel', 'travail', 'emploi'
]
WHERE title ILIKE '%Expérience%' AND language = 'fr';

-- Fondateur - Approche
UPDATE knowledge_base SET keywords = ARRAY[
  'approche', 'valeur', 'professionnalisme', 'transparence', 'fiabilité',
  'mission', 'objectif', 'vision', 'stratégie', 'clarté', 'documentation',
  'impact', 'business', 'confiance', 'marque', 'africain'
]
WHERE title ILIKE '%Approche%' AND language = 'fr';

-- Adresse Sénégal
UPDATE knowledge_base SET keywords = ARRAY[
  'adresse', 'sénégal', 'thiès', 'thies', 'hersent', 'rue', 'bureau',
  'localisation', 'où', 'situé', 'emplacement', 'technique', 'local',
  'rendez-vous', 'visite', 'office', 'location'
]
WHERE title ILIKE '%Sénégal%' AND language = 'fr';

-- Adresse Maroc
UPDATE knowledge_base SET keywords = ARRAY[
  'adresse', 'maroc', 'casablanca', 'casa', 'moustakbal', 'sidimaarouf',
  'bureau', 'localisation', 'où', 'situé', 'emplacement', 'commercial',
  'cloud', 'imm167', 'lot', 'apt', 'office', 'location'
]
WHERE title ILIKE '%Maroc%' AND language = 'fr';

-- Téléphone
UPDATE knowledge_base SET keywords = ARRAY[
  'téléphone', 'phone', 'numéro', 'appel', 'appeler', 'whatsapp', 'wa',
  'contact', 'joindre', 'contacter', '+212', '701', '193', '811',
  'principal', 'mobile', 'call'
]
WHERE title ILIKE '%téléphone%' AND language = 'fr';

-- Email
UPDATE knowledge_base SET keywords = ARRAY[
  'email', 'mail', 'e-mail', 'courriel', 'contact', 'écrire',
  'omadigital23', 'gmail', 'amadou', 'omadigital.net',
  'devis', 'support', 'projet', 'communication', 'message'
]
WHERE title ILIKE '%Email%' AND language = 'fr';

-- Site web
UPDATE knowledge_base SET keywords = ARRAY[
  'site', 'web', 'website', 'internet', 'en ligne', 'online',
  'omadigital.net', 'www', 'portfolio', 'réalisation', 'service',
  'formulaire', 'présentation', 'officiel', 'url'
]
WHERE title ILIKE '%Site web officiel%' AND language = 'fr';

-- 🇬🇧 ENGLISH

-- Overview
UPDATE knowledge_base SET keywords = ARRAY[
  'oma digital', 'agency', 'digital', 'senegal', 'morocco',
  'sme', 'startup', 'institution', 'transformation', 'automated',
  'accessible', 'scalable', 'solution', 'support', 'services',
  'overview', 'about', 'who we are', 'presentation'
]
WHERE title ILIKE '%Overview%' OR (title ILIKE '%OMA DIGITAL%' AND content ILIKE '%SMEs%') AND language = 'en';

-- Website creation
UPDATE knowledge_base SET keywords = ARRAY[
  'website', 'web', 'site', 'showcase', 'e-commerce', 'shop', 'institutional',
  'responsive', 'seo', 'multilingual', 'hosting', 'maintenance',
  'credibility', 'google', 'visibility', 'contact', 'sales', 'online',
  'creation', 'development', 'design', 'professional'
]
WHERE title ILIKE '%Website%' AND language = 'en';

-- Mobile apps
UPDATE knowledge_base SET keywords = ARRAY[
  'application', 'app', 'mobile', 'android', 'ios', 'smartphone',
  'react native', 'notification', 'push', 'payment', 'dashboard',
  'mobility', 'order', 'booking', 'interaction', 'development'
]
WHERE title ILIKE '%Mobile%' AND language = 'en';

-- Simple chatbots
UPDATE knowledge_base SET keywords = ARRAY[
  'chatbot', 'bot', 'simple', 'faq', 'automated', 'response',
  'conversational', 'script', 'support', 'responsiveness', 'visitor',
  'assistance', 'help', 'question', 'answer', 'automatic'
]
WHERE title ILIKE '%Simple%' AND content ILIKE '%chatbot%' AND language = 'en';

-- Multichannel chatbots
UPDATE knowledge_base SET keywords = ARRAY[
  'chatbot', 'multichannel', 'omnichannel', 'whatsapp', 'telegram', 'web',
  'social media', 'facebook', 'instagram', 'channel', 'accessibility',
  'client', 'contact', 'deployment', 'synchronization'
]
WHERE title ILIKE '%Multichannel%' AND language = 'en';

-- Multimodal chatbots
UPDATE knowledge_base SET keywords = ARRAY[
  'chatbot', 'multimodal', 'text', 'voice', 'vocal', 'image', 'photo',
  'recognition', 'synthesis', 'experience', 'natural', 'inclusive',
  'accessibility', 'audio', 'visual'
]
WHERE title ILIKE '%Multimodal%' AND language = 'en';

-- WhatsApp Business
UPDATE knowledge_base SET keywords = ARRAY[
  'whatsapp', 'business', 'wa', 'menu', 'interactive', 'automatic',
  'campaign', 'scheduled', 'crm', 'africa', 'follow-up', 'order',
  'tracking', 'support', 'fast', 'client', 'message'
]
WHERE title ILIKE '%WhatsApp%' AND language = 'en';

-- Telegram
UPDATE knowledge_base SET keywords = ARRAY[
  'telegram', 'bot', 'powerful', 'group', 'broadcast', 'information',
  'api', 'integration', 'community', 'service', 'internal', 'automation',
  'complex', 'announcement', 'notification'
]
WHERE title ILIKE '%Telegram%' AND language = 'en';

-- AI
UPDATE knowledge_base SET keywords = ARRAY[
  'ai', 'artificial intelligence', 'ia', 'nlp', 'rag', 'smart',
  'intelligent', 'script', 'precise', 'fast', 'context', 'processing',
  'flow', 'classification', 'response', 'automation'
]
WHERE title ILIKE '%AI%' OR title ILIKE '%intelligence%' AND language = 'en';

-- Sector-specific
UPDATE knowledge_base SET keywords = ARRAY[
  'school', 'hotel', 'restaurant', 'sector', 'sectoral', 'specialized',
  'booking', 'reservation', 'order', 'enrollment', 'parent', 'check-in',
  'menu', 'upsell', 'sales', 'onboarding', 'call', 'notification'
]
WHERE title ILIKE '%Sector%' AND language = 'en';

-- VPS
UPDATE knowledge_base SET keywords = ARRAY[
  'vps', 'server', 'cloud', 'hosting', 'nginx', 'docker',
  'tls', 'ssl', 'certificate', 'monitoring', 'backup',
  'ssh', 'security', 'performance', 'infrastructure', 'managed'
]
WHERE title ILIKE '%VPS%' AND language = 'en';

-- Founder - Identity
UPDATE knowledge_base SET keywords = ARRAY[
  'founder', 'ceo', 'papa amadou fall', 'amadou fall', 'leader',
  'creator', 'owner', 'director', 'who', 'identity', 'chief',
  'boss', 'manager', 'responsible'
]
WHERE title ILIKE '%Founder%' AND content ILIKE '%identity%' AND language = 'en';

-- Founder - Specialization
UPDATE knowledge_base SET keywords = ARRAY[
  'specialization', 'skills', 'expertise', 'automation', 'secure',
  'chatbot', 'web', 'mobile', 'multichannel', 'integration', 'cloud',
  'nginx', 'docker', 'oauth', 'linux', 'server', 'technical'
]
WHERE title ILIKE '%Specialization%' AND language = 'en';

-- Founder - Education
UPDATE knowledge_base SET keywords = ARRAY[
  'education', 'degree', 'master', 'bachelor', 'university', 'thiès',
  'ensup', 'africa', 'academic', 'studies', 'management',
  'it', 'computerized', 'curriculum'
]
WHERE title ILIKE '%Education%' AND language = 'en';

-- Founder - Experience
UPDATE knowledge_base SET keywords = ARRAY[
  'experience', 'career', 'path', 'vidéotron', 'developer',
  'full stack', 'engineer', 'support', 'technical', 'bilingual',
  'project', 'professional', 'work', 'employment'
]
WHERE title ILIKE '%Experience%' AND language = 'en';

-- Founder - Approach
UPDATE knowledge_base SET keywords = ARRAY[
  'approach', 'values', 'professionalism', 'transparency', 'reliability',
  'mission', 'goal', 'vision', 'strategy', 'clarity', 'documentation',
  'impact', 'business', 'trust', 'brand', 'african'
]
WHERE title ILIKE '%Approach%' OR title ILIKE '%values%' AND language = 'en';

-- Address Senegal
UPDATE knowledge_base SET keywords = ARRAY[
  'address', 'senegal', 'thiès', 'thies', 'hersent', 'street', 'office',
  'location', 'where', 'located', 'place', 'technical', 'local',
  'meeting', 'visit', 'headquarters'
]
WHERE title ILIKE '%Senegal%' AND content ILIKE '%office%' AND language = 'en';

-- Address Morocco
UPDATE knowledge_base SET keywords = ARRAY[
  'address', 'morocco', 'casablanca', 'casa', 'moustakbal', 'sidimaarouf',
  'office', 'location', 'where', 'located', 'place', 'commercial',
  'cloud', 'imm167', 'lot', 'apt', 'headquarters'
]
WHERE title ILIKE '%Morocco%' AND content ILIKE '%office%' AND language = 'en';

-- Phone
UPDATE knowledge_base SET keywords = ARRAY[
  'phone', 'telephone', 'number', 'call', 'calling', 'whatsapp', 'wa',
  'contact', 'reach', '+212', '701', '193', '811',
  'main', 'mobile', 'dial'
]
WHERE title ILIKE '%Phone%' AND language = 'en';

-- Email
UPDATE knowledge_base SET keywords = ARRAY[
  'email', 'mail', 'e-mail', 'contact', 'write',
  'omadigital23', 'gmail', 'amadou', 'omadigital.net',
  'quote', 'support', 'project', 'communication', 'message'
]
WHERE title ILIKE '%Email%' AND language = 'en';

-- Website
UPDATE knowledge_base SET keywords = ARRAY[
  'website', 'web', 'site', 'internet', 'online',
  'omadigital.net', 'www', 'portfolio', 'work', 'service',
  'form', 'presentation', 'official', 'url'
]
WHERE title ILIKE '%Official Website%' AND language = 'en';

-- ============================================================
-- FIN DE LA MISE À JOUR
-- ============================================================
