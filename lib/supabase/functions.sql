-- Function to match knowledge base entries using vector similarity
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 3
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  category text,
  subcategory text,
  language text,
  keywords text[],
  priority integer,
  tags text[],
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb.id,
    kb.title,
    kb.content,
    kb.category,
    kb.subcategory,
    kb.language,
    kb.keywords,
    kb.priority,
    kb.tags,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE 
    kb.is_active = true
    AND 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY 
    kb.priority DESC,
    similarity DESC
  LIMIT match_count;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';