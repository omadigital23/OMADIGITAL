-- ⚠️ ATTENTION: Ce script VIDE COMPLÈTEMENT la base de connaissances
-- À utiliser uniquement pour réinitialiser avec de nouvelles données

-- Supprimer toutes les données existantes
DELETE FROM knowledge_base;

-- Réinitialiser la séquence d'ID (si applicable)
-- ALTER SEQUENCE knowledge_base_id_seq RESTART WITH 1;

-- Vérification: la table doit être vide
SELECT COUNT(*) as total_documents FROM knowledge_base;

-- Si le résultat est 0, la base est vide et prête pour de nouvelles données
