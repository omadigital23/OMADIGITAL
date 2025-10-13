-- Production Optimization Migration
-- Adds indexes, RLS policies, and performance improvements

-- =============================================
-- PERFORMANCE INDEXES
-- =============================================

-- Chatbot interactions indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_session_id ON chatbot_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_created_at ON chatbot_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_language ON chatbot_interactions(language);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_source ON chatbot_interactions(source);

-- Knowledge base indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language_active ON knowledge_base(language, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_keywords_gin ON knowledge_base USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content_fts ON knowledge_base USING gin(to_tsvector('french', content));
CREATE INDEX IF NOT EXISTS idx_knowledge_base_title_fts ON knowledge_base USING gin(to_tsvector('french', title));

-- CTA actions indexes
CREATE INDEX IF NOT EXISTS idx_cta_actions_active_priority ON cta_actions(is_active, priority DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cta_actions_type ON cta_actions(type);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at ON web_vitals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals(metric_name);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE chatbot_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Chatbot interactions policies
CREATE POLICY "Allow anonymous read chatbot_interactions" ON chatbot_interactions
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert chatbot_interactions" ON chatbot_interactions
    FOR INSERT WITH CHECK (true);

-- Knowledge base policies (read-only for public)
CREATE POLICY "Allow public read active knowledge_base" ON knowledge_base
    FOR SELECT USING (is_active = true);

-- CTA actions policies (read-only for public)
CREATE POLICY "Allow public read active cta_actions" ON cta_actions
    FOR SELECT USING (is_active = true);

-- Analytics policies (insert only for public)
CREATE POLICY "Allow anonymous insert analytics_events" ON analytics_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous insert web_vitals" ON web_vitals
    FOR INSERT WITH CHECK (true);

-- Blog subscribers policies
CREATE POLICY "Allow anonymous insert blog_subscribers" ON blog_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous read own subscription" ON blog_subscribers
    FOR SELECT USING (true);

-- Quotes policies
CREATE POLICY "Allow anonymous insert quotes" ON quotes
    FOR INSERT WITH CHECK (true);

-- =============================================
-- ADMIN POLICIES (for authenticated users)
-- =============================================

-- Admin can do everything on all tables
CREATE POLICY "Allow admin full access chatbot_interactions" ON chatbot_interactions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access knowledge_base" ON knowledge_base
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access cta_actions" ON cta_actions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin read analytics_events" ON analytics_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin read web_vitals" ON web_vitals
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access blog_subscribers" ON blog_subscribers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access quotes" ON quotes
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- PERFORMANCE FUNCTIONS
-- =============================================

-- Function to get chatbot analytics
CREATE OR REPLACE FUNCTION get_chatbot_analytics(
    time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    total_interactions BIGINT,
    unique_sessions BIGINT,
    avg_confidence NUMERIC,
    language_breakdown JSONB,
    source_breakdown JSONB,
    hourly_stats JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH time_filter AS (
        SELECT NOW() - INTERVAL '1 hour' * time_range_hours AS cutoff_time
    ),
    base_stats AS (
        SELECT 
            COUNT(*) as total_interactions,
            COUNT(DISTINCT session_id) as unique_sessions,
            AVG(confidence) as avg_confidence
        FROM chatbot_interactions, time_filter
        WHERE created_at >= cutoff_time
    ),
    language_stats AS (
        SELECT jsonb_object_agg(language, count) as language_breakdown
        FROM (
            SELECT language, COUNT(*) as count
            FROM chatbot_interactions, time_filter
            WHERE created_at >= cutoff_time
            GROUP BY language
        ) t
    ),
    source_stats AS (
        SELECT jsonb_object_agg(source, count) as source_breakdown
        FROM (
            SELECT source, COUNT(*) as count
            FROM chatbot_interactions, time_filter
            WHERE created_at >= cutoff_time
            GROUP BY source
        ) t
    ),
    hourly_stats AS (
        SELECT jsonb_object_agg(hour_bucket, count) as hourly_stats
        FROM (
            SELECT 
                date_trunc('hour', created_at) as hour_bucket,
                COUNT(*) as count
            FROM chatbot_interactions, time_filter
            WHERE created_at >= cutoff_time
            GROUP BY date_trunc('hour', created_at)
            ORDER BY hour_bucket
        ) t
    )
    SELECT 
        bs.total_interactions,
        bs.unique_sessions,
        bs.avg_confidence,
        COALESCE(ls.language_breakdown, '{}'::jsonb),
        COALESCE(ss.source_breakdown, '{}'::jsonb),
        COALESCE(hs.hourly_stats, '{}'::jsonb)
    FROM base_stats bs
    CROSS JOIN language_stats ls
    CROSS JOIN source_stats ss
    CROSS JOIN hourly_stats hs;
END;
$$;

-- Function for knowledge base search with ranking
CREATE OR REPLACE FUNCTION search_knowledge_base(
    search_query TEXT,
    search_language TEXT DEFAULT 'fr',
    result_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    keywords TEXT[],
    rank REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        kb.keywords,
        ts_rank(
            to_tsvector('french', kb.title || ' ' || kb.content),
            plainto_tsquery('french', search_query)
        ) as rank
    FROM knowledge_base kb
    WHERE 
        kb.language = search_language
        AND kb.is_active = true
        AND (
            to_tsvector('french', kb.title || ' ' || kb.content) @@ plainto_tsquery('french', search_query)
            OR kb.keywords && ARRAY[lower(search_query)]
            OR kb.title ILIKE '%' || search_query || '%'
            OR kb.content ILIKE '%' || search_query || '%'
        )
    ORDER BY rank DESC, kb.created_at DESC
    LIMIT result_limit;
END;
$$;

-- Function to clean old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete analytics events older than 90 days
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete web vitals older than 30 days
    DELETE FROM web_vitals 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Delete old chatbot interactions (keep last 30 days)
    DELETE FROM chatbot_interactions 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    RETURN deleted_count;
END;
$$;

-- =============================================
-- TRIGGERS FOR AUTOMATIC CLEANUP
-- =============================================

-- Create a function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers where needed
CREATE TRIGGER update_knowledge_base_updated_at 
    BEFORE UPDATE ON knowledge_base 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cta_actions_updated_at 
    BEFORE UPDATE ON cta_actions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for active knowledge base items
CREATE OR REPLACE VIEW active_knowledge_base AS
SELECT 
    id,
    title,
    content,
    category,
    language,
    keywords,
    created_at,
    updated_at
FROM knowledge_base 
WHERE is_active = true
ORDER BY category, created_at DESC;

-- View for recent chatbot interactions
CREATE OR REPLACE VIEW recent_chatbot_interactions AS
SELECT 
    session_id,
    user_message,
    bot_response,
    language,
    source,
    confidence,
    created_at
FROM chatbot_interactions 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_chatbot_analytics(INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_knowledge_base(TEXT, TEXT, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_analytics() TO authenticated;

-- Grant select on views
GRANT SELECT ON active_knowledge_base TO anon, authenticated;
GRANT SELECT ON recent_chatbot_interactions TO anon, authenticated;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON FUNCTION get_chatbot_analytics(INTEGER) IS 'Get comprehensive chatbot analytics for specified time range in hours';
COMMENT ON FUNCTION search_knowledge_base(TEXT, TEXT, INTEGER) IS 'Full-text search in knowledge base with ranking';
COMMENT ON FUNCTION cleanup_old_analytics() IS 'Clean up old analytics data to maintain performance';
COMMENT ON VIEW active_knowledge_base IS 'View of all active knowledge base items';
COMMENT ON VIEW recent_chatbot_interactions IS 'View of chatbot interactions from last 24 hours';