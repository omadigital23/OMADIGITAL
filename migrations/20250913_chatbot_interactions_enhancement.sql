-- Migration to enhance chatbot_interactions table with missing columns
-- This migration adds columns for better analytics and tracking

-- Add language column for language detection tracking
ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS language VARCHAR(2) CHECK (language IN ('fr', 'en'));

-- Add source column for tracking response source
ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS source VARCHAR(100);

-- Add confidence column for tracking AI confidence scores
ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1);

-- Add suggestions column for tracking number of suggestions
ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS suggestions INTEGER;

-- Add cta_type column for tracking call-to-action types
ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS cta_type VARCHAR(20) CHECK (cta_type IN ('contact', 'demo', 'appointment', 'quote'));

-- Add response_length column for tracking response size
ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS response_length INTEGER;

-- Add suggestion_count column for tracking suggestion counts
ALTER TABLE chatbot_interactions ADD COLUMN IF NOT EXISTS suggestion_count INTEGER;

-- Add comments for documentation
COMMENT ON COLUMN chatbot_interactions.language IS 'Detected language of the conversation';
COMMENT ON COLUMN chatbot_interactions.source IS 'Source of the chatbot response (e.g., ultra_intelligent_rag)';
COMMENT ON COLUMN chatbot_interactions.confidence IS 'Confidence score of the response (0.0 to 1.0)';
COMMENT ON COLUMN chatbot_interactions.suggestions IS 'Number of suggestions provided (deprecated, use suggestion_count)';
COMMENT ON COLUMN chatbot_interactions.cta_type IS 'Type of call-to-action suggested';
COMMENT ON COLUMN chatbot_interactions.response_length IS 'Length of the response text in characters';
COMMENT ON COLUMN chatbot_interactions.suggestion_count IS 'Number of suggestions provided with the response';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_language ON chatbot_interactions(language);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_source ON chatbot_interactions(source);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_confidence ON chatbot_interactions(confidence);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_cta_type ON chatbot_interactions(cta_type);