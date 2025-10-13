-- Migration pour corriger l'email dans la base de connaissances
-- Date: 12 janvier 2025
-- Objectif: Remplacer omasenegal25@gmail.com par omadigital23@gmail.com

-- Mise à jour des entrées de contact en français
UPDATE knowledge_base
SET content = REPLACE(content, 'omasenegal25@gmail.com', 'omadigital23@gmail.com')
WHERE category = 'contact' 
  AND language = 'fr'
  AND content LIKE '%omasenegal25@gmail.com%';

-- Mise à jour des entrées de contact en anglais
UPDATE knowledge_base
SET content = REPLACE(content, 'omasenegal25@gmail.com', 'omadigital23@gmail.com')
WHERE category = 'contact' 
  AND language = 'en'
  AND content LIKE '%omasenegal25@gmail.com%';

-- Mise à jour de toutes les autres entrées qui pourraient contenir l'ancien email
UPDATE knowledge_base
SET content = REPLACE(content, 'omasenegal25@gmail.com', 'omadigital23@gmail.com')
WHERE content LIKE '%omasenegal25@gmail.com%';

-- Vérification: Afficher les entrées modifiées
SELECT id, title, category, language, 
       SUBSTRING(content, 1, 100) as content_preview
FROM knowledge_base
WHERE content LIKE '%omadigital23@gmail.com%'
ORDER BY category, language;
