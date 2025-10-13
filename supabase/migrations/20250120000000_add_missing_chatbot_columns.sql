-- Add missing columns to chatbot_interactions table
-- This migration fixes the schema mismatch causing the 'confidence' column error

-- Add the missing columns
ALTER TABLE chatbot_interactions 
ADD COLUMN IF NOT EXISTS language text,
ADD COLUMN IF NOT EXISTS source text,
ADD COLUMN IF NOT EXISTS confidence decimal(3,2),
ADD COLUMN IF NOT EXISTS suggestions integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS cta_type text,
ADD COLUMN IF NOT EXISTS response_length integer,
ADD COLUMN IF NOT EXISTS suggestion_count integer;

-- Add appropriate constraints
ALTER TABLE chatbot_interactions 
ADD CONSTRAINT IF NOT EXISTS check_language CHECK (language IN ('fr', 'en') OR language IS NULL),
ADD CONSTRAINT IF NOT EXISTS check_confidence CHECK (confidence >= 0 AND confidence <= 1 OR confidence IS NULL),
ADD CONSTRAINT IF NOT EXISTS check_suggestions CHECK (suggestions >= 0 OR suggestions IS NULL),
ADD CONSTRAINT IF NOT EXISTS check_response_length CHECK (response_length >= 0 OR response_length IS NULL),
ADD CONSTRAINT IF NOT EXISTS check_suggestion_count CHECK (suggestion_count >= 0 OR suggestion_count IS NULL),
ADD CONSTRAINT IF NOT EXISTS check_cta_type CHECK (cta_type IN ('contact', 'demo', 'appointment', 'quote') OR cta_type IS NULL);

-- Add indexes for better query performance on new columns
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_language ON chatbot_interactions(language);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_source ON chatbot_interactions(source);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_confidence ON chatbot_interactions(confidence);

-- Add comments for documentation
COMMENT ON COLUMN chatbot_interactions.language IS 'Detected language of the conversation (fr/en)';
COMMENT ON COLUMN chatbot_interactions.source IS 'Source of the chatbot response (e.g., ultra_intelligent_rag)';
COMMENT ON COLUMN chatbot_interactions.confidence IS 'Confidence score of the response (0.0 to 1.0)';
COMMENT ON COLUMN chatbot_interactions.suggestions IS 'Number of suggestions provided (deprecated, use suggestion_count)';
COMMENT ON COLUMN chatbot_interactions.cta_type IS 'Type of call-to-action suggested';
COMMENT ON COLUMN chatbot_interactions.response_length IS 'Length of the response text in characters';
COMMENT ON COLUMN chatbot_interactions.suggestion_count IS 'Number of suggestions provided with the response';