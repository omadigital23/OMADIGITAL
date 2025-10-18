-- Mise à jour des informations de contact OMA Digital
-- Correction des adresses et numéro de téléphone

-- Mise à jour version française
UPDATE knowledge_base
SET 
  content = 'Contactez OMA Digital : Téléphone/WhatsApp +212 701 193 811, Emails omadigital23@gmail.com / amadou@omadigital.net, Site web https://omadigital.net. Horaires : Lundi-Vendredi 9h-18h. Support technique 24/7. Devis gratuit sous 24h. Adresses : Hersent Rue 15, Thiès, Sénégal | Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt 15, Maroc.',
  keywords = ARRAY['contact', 'téléphone', 'email', 'support', 'devis', 'thiès', 'casablanca', 'maroc', 'sénégal'],
  updated_at = NOW()
WHERE 
  category = 'contact' 
  AND language = 'fr'
  AND title = 'Contact et support';

-- Mise à jour version anglaise
UPDATE knowledge_base
SET 
  content = 'Contact OMA Digital: Phone/WhatsApp +212 701 193 811, Emails omadigital23@gmail.com / amadou@omadigital.net, Website https://omadigital.net. Hours: Monday-Friday 9am-6pm. 24/7 technical support. Free quote within 24h. Addresses: Hersent Rue 15, Thiès, Senegal | Moustakbal/Sidimaarouf Casablanca imm167 Lot GH20 apt 15, Morocco.',
  keywords = ARRAY['contact', 'phone', 'email', 'support', 'quote', 'thiès', 'casablanca', 'morocco', 'senegal'],
  updated_at = NOW()
WHERE 
  category = 'contact' 
  AND language = 'en'
  AND title = 'Contact and Support';

-- Vérification
SELECT 
  language,
  title,
  CASE 
    WHEN content LIKE '%+212 701 193 811%' THEN '✅ Téléphone OK'
    ELSE '❌ Téléphone incorrect'
  END as phone_check,
  CASE 
    WHEN content LIKE '%Thiès%' THEN '✅ Adresse Thiès OK'
    ELSE '❌ Adresse Thiès manquante'
  END as address_thies_check,
  CASE 
    WHEN content LIKE '%Casablanca%' THEN '✅ Adresse Casablanca OK'
    ELSE '❌ Adresse Casablanca manquante'
  END as address_casa_check,
  CASE 
    WHEN content LIKE '%amadou@omadigital.net%' THEN '✅ Email amadou OK'
    ELSE '❌ Email amadou manquant'
  END as email_check
FROM knowledge_base
WHERE category = 'contact'
ORDER BY language;
