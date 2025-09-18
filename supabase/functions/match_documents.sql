-- AMÉLIORATION RAG : Fonction PostgreSQL pour recherche vectorielle optimisée
-- À exécuter dans Supabase SQL Editor

CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(384),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 5,
  filter_language text DEFAULT 'fr'
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  keywords text[],
  language text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base.id,
    knowledge_base.title,
    knowledge_base.content,
    knowledge_base.category,
    knowledge_base.keywords,
    knowledge_base.language,
    knowledge_base.metadata,
    1 - (knowledge_base.embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE 
    knowledge_base.is_active = true
    AND knowledge_base.language = filter_language
    AND knowledge_base.embedding IS NOT NULL
    AND 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;