-- ============================================================
-- CORRECTION: Ajouter mots-clés sans accents pour la recherche
-- Permet de trouver "telephone" même si cherché sans accent
-- ============================================================

-- 🇫🇷 FRANÇAIS - Téléphone (ajouter versions sans accents)
UPDATE knowledge_base SET keywords = ARRAY[
  'téléphone', 'telephone', 'phone', 'numéro', 'numero', 'appel', 'appeler', 
  'whatsapp', 'wa', 'contact', 'joindre', 'contacter', '+221', '701', '193', '811',
  'principal', 'mobile', 'call', 'quel', 'cest', 'quoi', 'votre'
]
WHERE title ILIKE '%téléphone%' AND language = 'fr';

-- 🇫🇷 FRANÇAIS - Email (ajouter versions sans accents)
UPDATE knowledge_base SET keywords = ARRAY[
  'email', 'mail', 'e-mail', 'courriel', 'contact', 'écrire', 'ecrire',
  'omadigital23', 'gmail', 'amadou', 'omadigital.net',
  'devis', 'support', 'projet', 'communication', 'message', 'adresse'
]
WHERE title ILIKE '%Email%' AND language = 'fr';

-- 🇫🇷 FRANÇAIS - Adresse Sénégal (ajouter versions sans accents)
UPDATE knowledge_base SET keywords = ARRAY[
  'adresse', 'sénégal', 'senegal', 'thiès', 'thies', 'hersent', 'rue', 'bureau',
  'localisation', 'où', 'ou', 'situé', 'situe', 'emplacement', 'technique', 'local',
  'rendez-vous', 'visite', 'office', 'location'
]
WHERE title ILIKE '%Sénégal%' AND language = 'fr';

-- 🇫🇷 FRANÇAIS - Adresse Maroc (ajouter versions sans accents)
UPDATE knowledge_base SET keywords = ARRAY[
  'adresse', 'maroc', 'casablanca', 'casa', 'moustakbal', 'sidimaarouf',
  'bureau', 'localisation', 'où', 'ou', 'situé', 'situe', 'emplacement', 'commercial',
  'cloud', 'imm167', 'lot', 'apt', 'office', 'location'
]
WHERE title ILIKE '%Maroc%' AND language = 'fr';

-- 🇫🇷 FRANÇAIS - Présence géographique (ajouter versions sans accents)
UPDATE knowledge_base SET keywords = ARRAY[
  'présence', 'presence', 'géographique', 'geographique', 'sénégal', 'senegal', 
  'maroc', 'thiès', 'thies', 'casablanca', 'bureaux', 'localisation', 'où', 'ou', 'pays'
]
WHERE title ILIKE '%géographique%' AND language = 'fr';

-- Vérification
SELECT title, language, keywords
FROM knowledge_base
WHERE category = 'contact' AND language = 'fr'
ORDER BY title;
