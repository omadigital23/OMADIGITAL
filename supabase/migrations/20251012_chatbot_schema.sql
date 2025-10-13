-- Migration: Chatbot and CTA tracking schema
-- Description: Creates tables for chatbot interactions, conversations, CTAs and analytics
-- Author: OMA Digital
-- Date: 2025-10-12

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: chatbot_interactions
-- Purpose: Track all chatbot message exchanges for analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.chatbot_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    response TEXT NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('fr', 'en')),
    source TEXT NOT NULL,
    confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    response_time_ms INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    security_validated BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_session_id ON public.chatbot_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_created_at ON public.chatbot_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_language ON public.chatbot_interactions(language);

-- ============================================================================
-- TABLE: conversations
-- Purpose: Track conversation sessions for admin dashboard
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT UNIQUE NOT NULL,
    language TEXT NOT NULL CHECK (language IN ('fr', 'en')),
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON public.conversations(created_at DESC);

-- ============================================================================
-- TABLE: messages
-- Purpose: Store individual messages within conversations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
    language TEXT NOT NULL CHECK (language IN ('fr', 'en')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- ============================================================================
-- TABLE: cta_actions
-- Purpose: Store dynamic Call-To-Action configurations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cta_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('contact', 'quote', 'demo', 'download', 'subscribe', 'custom')),
    action TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    conditions JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cta_actions_is_active ON public.cta_actions(is_active);
CREATE INDEX IF NOT EXISTS idx_cta_actions_priority ON public.cta_actions(priority);
CREATE INDEX IF NOT EXISTS idx_cta_actions_type ON public.cta_actions(type);

-- ============================================================================
-- TABLE: cta_tracking
-- Purpose: Track CTA views, clicks and conversions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cta_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cta_id UUID NOT NULL REFERENCES public.cta_actions(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('view', 'click', 'conversion')),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cta_tracking_cta_id ON public.cta_tracking(cta_id);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_session_id ON public.cta_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_action_type ON public.cta_tracking(action_type);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_created_at ON public.cta_tracking(created_at DESC);

-- ============================================================================
-- TABLE: cta_conversions
-- Purpose: Track successful CTA conversions with value
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.cta_conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cta_id UUID NOT NULL REFERENCES public.cta_actions(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    conversion_type TEXT NOT NULL,
    conversion_value NUMERIC(10,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cta_conversions_cta_id ON public.cta_conversions(cta_id);
CREATE INDEX IF NOT EXISTS idx_cta_conversions_session_id ON public.cta_conversions(session_id);
CREATE INDEX IF NOT EXISTS idx_cta_conversions_created_at ON public.cta_conversions(created_at DESC);

-- ============================================================================
-- TABLE: error_logs
-- Purpose: Track API and system errors for debugging
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    user_message TEXT,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    security_context JSONB DEFAULT '{}',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON public.error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON public.error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON public.error_logs(session_id);

-- ============================================================================
-- FUNCTION: get_cta_metrics
-- Purpose: Calculate CTA performance metrics
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_cta_metrics(cta_uuid UUID)
RETURNS TABLE (
    total_views BIGINT,
    total_clicks BIGINT,
    total_conversions BIGINT,
    click_rate NUMERIC,
    conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) FILTER (WHERE action_type = 'view') AS total_views,
        COUNT(*) FILTER (WHERE action_type = 'click') AS total_clicks,
        COUNT(*) FILTER (WHERE action_type = 'conversion') AS total_conversions,
        CASE 
            WHEN COUNT(*) FILTER (WHERE action_type = 'view') > 0 
            THEN ROUND((COUNT(*) FILTER (WHERE action_type = 'click')::NUMERIC / COUNT(*) FILTER (WHERE action_type = 'view')::NUMERIC) * 100, 2)
            ELSE 0
        END AS click_rate,
        CASE 
            WHEN COUNT(*) FILTER (WHERE action_type = 'click') > 0 
            THEN ROUND((COUNT(*) FILTER (WHERE action_type = 'conversion')::NUMERIC / COUNT(*) FILTER (WHERE action_type = 'click')::NUMERIC) * 100, 2)
            ELSE 0
        END AS conversion_rate
    FROM public.cta_tracking
    WHERE cta_id = cta_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Update conversations.updated_at on message insert
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_timestamp();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Purpose: Secure tables with appropriate access policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.chatbot_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access to all tables
CREATE POLICY "Service role has full access to chatbot_interactions"
ON public.chatbot_interactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to conversations"
ON public.conversations FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to messages"
ON public.messages FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to cta_actions"
ON public.cta_actions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to cta_tracking"
ON public.cta_tracking FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to cta_conversions"
ON public.cta_conversions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role has full access to error_logs"
ON public.error_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow anon users to read active CTAs only
CREATE POLICY "Anon users can read active CTAs"
ON public.cta_actions FOR SELECT
TO anon
USING (is_active = true);

-- Policy: Allow anon users to insert tracking (for analytics)
CREATE POLICY "Anon users can insert CTA tracking"
ON public.cta_tracking FOR INSERT
TO anon
WITH CHECK (true);

-- ============================================================================
-- SEED DATA: Default CTAs
-- ============================================================================
INSERT INTO public.cta_actions (type, action, priority, conditions, data, is_active)
VALUES
    (
        'contact',
        'Contactez-nous maintenant',
        'high',
        '{"language": "fr", "keywords": ["contact", "aide", "support", "question"]}'::jsonb,
        '{"phone": "+212701193811", "email": "omasenegal25@gmail.com"}'::jsonb,
        true
    ),
    (
        'contact',
        'Contact us now',
        'high',
        '{"language": "en", "keywords": ["contact", "help", "support", "question"]}'::jsonb,
        '{"phone": "+212701193811", "email": "omasenegal25@gmail.com"}'::jsonb,
        true
    ),
    (
        'quote',
        'Obtenir un devis gratuit',
        'urgent',
        '{"language": "fr", "keywords": ["prix", "tarif", "coût", "devis", "budget"]}'::jsonb,
        '{"url": "/#contact", "form_type": "quote"}'::jsonb,
        true
    ),
    (
        'quote',
        'Get a free quote',
        'urgent',
        '{"language": "en", "keywords": ["price", "cost", "quote", "budget"]}'::jsonb,
        '{"url": "/#contact", "form_type": "quote"}'::jsonb,
        true
    ),
    (
        'demo',
        'Demander une démo WhatsApp',
        'high',
        '{"language": "fr", "keywords": ["whatsapp", "automatisation", "démo", "essai"]}'::jsonb,
        '{"url": "/#contact", "service": "whatsapp"}'::jsonb,
        true
    ),
    (
        'demo',
        'Request WhatsApp demo',
        'high',
        '{"language": "en", "keywords": ["whatsapp", "automation", "demo", "trial"]}'::jsonb,
        '{"url": "/#contact", "service": "whatsapp"}'::jsonb,
        true
    )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- GRANTS: Ensure proper permissions
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON public.cta_actions TO anon, authenticated;
GRANT INSERT ON public.cta_tracking TO anon, authenticated;

-- ============================================================================
-- COMMENTS: Document schema for maintainability
-- ============================================================================
COMMENT ON TABLE public.chatbot_interactions IS 'Stores all chatbot message exchanges for analytics and debugging';
COMMENT ON TABLE public.conversations IS 'Tracks conversation sessions for admin dashboard';
COMMENT ON TABLE public.messages IS 'Individual messages within conversations';
COMMENT ON TABLE public.cta_actions IS 'Dynamic Call-To-Action configurations';
COMMENT ON TABLE public.cta_tracking IS 'Tracks CTA views, clicks and conversions';
COMMENT ON TABLE public.cta_conversions IS 'Successful CTA conversions with value';
COMMENT ON TABLE public.error_logs IS 'API and system errors for debugging';
COMMENT ON FUNCTION public.get_cta_metrics IS 'Calculates CTA performance metrics (views, clicks, conversions, rates)';
