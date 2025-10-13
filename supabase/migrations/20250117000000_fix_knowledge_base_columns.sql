-- Fix knowledge_base table structure
-- Add missing columns that are required for the enhanced chatbot

-- Add missing columns to knowledge_base table
ALTER TABLE knowledge_base 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing records to have default values
UPDATE knowledge_base 
SET 
  title = COALESCE(title, 'Untitled'),
  category = COALESCE(category, 'general'),
  keywords = COALESCE(keywords, ARRAY[]::TEXT[]),
  is_active = COALESCE(is_active, true)
WHERE title IS NULL OR category IS NULL OR keywords IS NULL OR is_active IS NULL;

-- Make title and category NOT NULL after setting defaults
ALTER TABLE knowledge_base 
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN category SET NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language_active ON knowledge_base(language, is_active);

-- Enable text search on content and title
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_search ON knowledge_base USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_knowledge_base_title_search ON knowledge_base USING gin(to_tsvector('english', title));