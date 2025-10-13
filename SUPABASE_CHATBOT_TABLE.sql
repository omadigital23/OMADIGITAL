-- ============================================
-- CHATBOT CONVERSATIONS TABLE SETUP
-- ============================================
-- This script creates and configures the chatbot_conversations table
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. CREATE CHATBOT_CONVERSATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  language TEXT NULL DEFAULT 'fr-FR',
  input_type TEXT NULL DEFAULT 'text',
  confidence NUMERIC(3, 2) NULL,
  has_audio BOOLEAN NULL DEFAULT false,
  voice_model TEXT NULL,
  response_quality TEXT NULL,
  user_agent TEXT NULL,
  ip_address TEXT NULL,
  referrer TEXT NULL,
  sentiment TEXT NULL,
  lead_score INTEGER NULL,
  created_at TIMESTAMPTZ NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chatbot_conversations_input_type_check CHECK (input_type IN ('text', 'voice')),
  CONSTRAINT chatbot_conversations_language_check CHECK (language IN ('fr-FR', 'en-US', 'fr', 'en')),
  CONSTRAINT chatbot_conversations_confidence_check CHECK (confidence >= 0 AND confidence <= 1),
  CONSTRAINT chatbot_conversations_lead_score_check CHECK (lead_score >= 0 AND lead_score <= 100)
);

-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_conv_session ON public.chatbot_conversations USING btree (session_id);
CREATE INDEX IF NOT EXISTS idx_conv_language ON public.chatbot_conversations USING btree (language);
CREATE INDEX IF NOT EXISTS idx_conv_created ON public.chatbot_conversations USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_lead_score ON public.chatbot_conversations USING btree (lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_conv_input_type ON public.chatbot_conversations USING btree (input_type);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- 4. DROP EXISTING POLICIES (to avoid conflicts)
-- ============================================

DROP POLICY IF EXISTS "Allow anonymous chatbot interactions" ON public.chatbot_conversations;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.chatbot_conversations;
DROP POLICY IF EXISTS "Allow service role full access" ON public.chatbot_conversations;

-- 5. CREATE RLS POLICIES
-- ============================================

-- Policy: Allow anonymous inserts (for chatbot interactions)
CREATE POLICY "Allow anonymous chatbot interactions" ON public.chatbot_conversations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all conversations
CREATE POLICY "Allow authenticated read access" ON public.chatbot_conversations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow service role full access
CREATE POLICY "Allow service role full access" ON public.chatbot_conversations
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. FIX EXISTING DATA (if table already exists)
-- ============================================

-- Ensure id column has UUID default (if it doesn't)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'chatbot_conversations' AND column_name = 'id' AND column_default IS NULL) THEN
    ALTER TABLE public.chatbot_conversations ALTER COLUMN id SET DEFAULT gen_random_uuid();
    RAISE NOTICE 'Set default UUID generation for id column in chatbot_conversations';
  END IF;
END $$;

-- 7. CREATE VIEW FOR ANALYTICS
-- ============================================

CREATE OR REPLACE VIEW public.chatbot_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total_conversations,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(confidence) as avg_confidence,
  AVG(lead_score) as avg_lead_score,
  COUNT(CASE WHEN input_type = 'voice' THEN 1 END) as voice_interactions,
  COUNT(CASE WHEN input_type = 'text' THEN 1 END) as text_interactions,
  COUNT(CASE WHEN language IN ('fr', 'fr-FR') THEN 1 END) as french_conversations,
  COUNT(CASE WHEN language IN ('en', 'en-US') THEN 1 END) as english_conversations
FROM public.chatbot_conversations
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- 8. VERIFICATION QUERIES
-- ============================================

-- Show table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'chatbot_conversations'
ORDER BY ordinal_position;

-- Show all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'chatbot_conversations'
ORDER BY policyname;

-- Count existing conversations
SELECT 
  COUNT(*) as total_conversations,
  COUNT(DISTINCT session_id) as unique_sessions,
  input_type,
  language
FROM public.chatbot_conversations
GROUP BY input_type, language;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Chatbot conversations table configured successfully!';
  RAISE NOTICE '✅ RLS policies configured correctly!';
  RAISE NOTICE '✅ Indexes created for performance!';
  RAISE NOTICE '✅ Analytics view created!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Next steps:';
  RAISE NOTICE '1. Test the chatbot and send a message';
  RAISE NOTICE '2. Check data in Table Editor';
  RAISE NOTICE '3. View analytics in chatbot_analytics view';
END $$;
