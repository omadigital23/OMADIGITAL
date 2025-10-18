-- Nouvelles données de la base de connaissances OMA Digital
-- À remplir avec les informations correctes fournies par l'utilisateur

-- ============================================
-- SECTION 1: INFORMATIONS DE CONTACT
-- ============================================

INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES

-- FRANÇAIS
('Contact et Support',
'[À REMPLIR: Téléphone, emails, site web, horaires, adresses]',
'contact', 'fr',
ARRAY['contact', 'téléphone', 'email', 'support']),

-- ANGLAIS
('Contact and Support',
'[À REMPLIR: Phone, emails, website, hours, addresses]',
'contact', 'en',
ARRAY['contact', 'phone', 'email', 'support']);

-- ============================================
-- SECTION 2: SERVICES
-- ============================================

-- [À REMPLIR avec les services réels]

-- ============================================
-- SECTION 3: TARIFICATION ET ROI
-- ============================================

-- [À REMPLIR avec les informations de tarification]

-- ============================================
-- SECTION 4: FAQ
-- ============================================

-- [À REMPLIR avec les questions fréquentes]

-- ============================================
-- SECTION 5: CAS D'USAGE
-- ============================================

-- [À REMPLIR avec les cas d'usage]

-- ============================================
-- SECTION 6: INFORMATIONS TECHNIQUES
-- ============================================

-- [À REMPLIR avec les informations techniques]

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 
  category,
  language,
  COUNT(*) as count
FROM knowledge_base
GROUP BY category, language
ORDER BY category, language;
