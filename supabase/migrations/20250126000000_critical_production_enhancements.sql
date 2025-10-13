-- Critical Production Enhancements Migration
-- Additional optimizations for production readiness

-- =============================================
-- MISSING CRITICAL INDEXES
-- =============================================

-- Quotes table indexes (high priority for CTA form)
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_email ON quotes(email);
CREATE INDEX IF NOT EXISTS idx_quotes_service ON quotes(service);
CREATE INDEX IF NOT EXISTS idx_quotes_location ON quotes(location);

-- Blog subscribers indexes
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_created_at ON blog_subscribers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON blog_subscribers(status);

-- Error logs table (for monitoring)
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    user_message TEXT,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);

-- =============================================
-- ENHANCED RLS POLICIES
-- =============================================

-- Enable RLS on error_logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Error logs policies (admin read only)
CREATE POLICY "Allow admin read error_logs" ON error_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow anonymous insert error_logs" ON error_logs
    FOR INSERT WITH CHECK (true);

-- =============================================
-- PERFORMANCE MONITORING FUNCTIONS
-- =============================================

-- Function to get system health metrics
CREATE OR REPLACE FUNCTION get_system_health()
RETURNS TABLE (
    total_quotes BIGINT,
    total_subscribers BIGINT,
    total_interactions BIGINT,
    error_rate NUMERIC,
    avg_response_time NUMERIC,
    last_24h_activity JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cutoff_time TIMESTAMPTZ := NOW() - INTERVAL '24 hours';
BEGIN
    RETURN QUERY
    WITH metrics AS (
        SELECT 
            (SELECT COUNT(*) FROM quotes) as total_quotes,
            (SELECT COUNT(*) FROM blog_subscribers) as total_subscribers,
            (SELECT COUNT(*) FROM chatbot_interactions) as total_interactions,
            (SELECT COUNT(*) FROM error_logs WHERE timestamp >= cutoff_time) as recent_errors,
            (SELECT COUNT(*) FROM chatbot_interactions WHERE created_at >= cutoff_time) as recent_interactions
    ),
    activity AS (
        SELECT jsonb_build_object(
            'quotes', (SELECT COUNT(*) FROM quotes WHERE created_at >= cutoff_time),
            'subscribers', (SELECT COUNT(*) FROM blog_subscribers WHERE created_at >= cutoff_time),
            'interactions', (SELECT COUNT(*) FROM chatbot_interactions WHERE created_at >= cutoff_time),
            'errors', (SELECT COUNT(*) FROM error_logs WHERE timestamp >= cutoff_time)
        ) as last_24h_activity
    )
    SELECT 
        m.total_quotes,
        m.total_subscribers,
        m.total_interactions,
        CASE 
            WHEN m.recent_interactions > 0 
            THEN ROUND((m.recent_errors::NUMERIC / m.recent_interactions::NUMERIC) * 100, 2)
            ELSE 0
        END as error_rate,
        0::NUMERIC as avg_response_time, -- Placeholder for future implementation
        a.last_24h_activity
    FROM metrics m
    CROSS JOIN activity a;
END;
$$;

-- Function to get conversion funnel metrics
CREATE OR REPLACE FUNCTION get_conversion_metrics(
    time_range_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    page_views BIGINT,
    chatbot_interactions BIGINT,
    newsletter_signups BIGINT,
    quote_requests BIGINT,
    conversion_rate NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    cutoff_time TIMESTAMPTZ := NOW() - INTERVAL '1 hour' * time_range_hours;
BEGIN
    RETURN QUERY
    WITH funnel_data AS (
        SELECT 
            (SELECT COUNT(*) FROM analytics_events 
             WHERE event_name = 'page_view' AND created_at >= cutoff_time) as page_views,
            (SELECT COUNT(*) FROM chatbot_interactions 
             WHERE created_at >= cutoff_time) as chatbot_interactions,
            (SELECT COUNT(*) FROM blog_subscribers 
             WHERE created_at >= cutoff_time) as newsletter_signups,
            (SELECT COUNT(*) FROM quotes 
             WHERE created_at >= cutoff_time) as quote_requests
    )
    SELECT 
        f.page_views,
        f.chatbot_interactions,
        f.newsletter_signups,
        f.quote_requests,
        CASE 
            WHEN f.page_views > 0 
            THEN ROUND((f.quote_requests::NUMERIC / f.page_views::NUMERIC) * 100, 2)
            ELSE 0
        END as conversion_rate
    FROM funnel_data f;
END;
$$;

-- =============================================
-- DATA VALIDATION CONSTRAINTS
-- =============================================

-- Add constraints for data integrity
ALTER TABLE quotes 
ADD CONSTRAINT quotes_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE quotes 
ADD CONSTRAINT quotes_phone_format 
CHECK (phone ~* '^(\+221|\+212|00221|00212)?[0-9]{9,12}$');

ALTER TABLE quotes 
ADD CONSTRAINT quotes_status_valid 
CHECK (status IN ('nouveau', 'en_cours', 'traite', 'ferme'));

ALTER TABLE blog_subscribers 
ADD CONSTRAINT blog_subscribers_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE blog_subscribers 
ADD CONSTRAINT blog_subscribers_status_valid 
CHECK (status IN ('active', 'unsubscribed', 'bounced'));

-- =============================================
-- AUTOMATIC DATA CLEANUP
-- =============================================

-- Enhanced cleanup function with better performance
CREATE OR REPLACE FUNCTION enhanced_cleanup_old_data()
RETURNS TABLE (
    analytics_deleted INTEGER,
    web_vitals_deleted INTEGER,
    interactions_deleted INTEGER,
    errors_deleted INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    analytics_count INTEGER := 0;
    vitals_count INTEGER := 0;
    interactions_count INTEGER := 0;
    errors_count INTEGER := 0;
BEGIN
    -- Delete analytics events older than 90 days (in batches)
    LOOP
        DELETE FROM analytics_events 
        WHERE id IN (
            SELECT id FROM analytics_events 
            WHERE created_at < NOW() - INTERVAL '90 days'
            LIMIT 1000
        );
        
        GET DIAGNOSTICS analytics_count = ROW_COUNT;
        EXIT WHEN analytics_count = 0;
    END LOOP;
    
    -- Delete web vitals older than 30 days
    DELETE FROM web_vitals 
    WHERE created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS vitals_count = ROW_COUNT;
    
    -- Delete old chatbot interactions (keep last 60 days for better analytics)
    DELETE FROM chatbot_interactions 
    WHERE created_at < NOW() - INTERVAL '60 days';
    GET DIAGNOSTICS interactions_count = ROW_COUNT;
    
    -- Delete old error logs (keep last 30 days)
    DELETE FROM error_logs 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS errors_count = ROW_COUNT;
    
    RETURN QUERY SELECT analytics_count, vitals_count, interactions_count, errors_count;
END;
$$;

-- =============================================
-- PERFORMANCE MONITORING VIEWS
-- =============================================

-- View for admin dashboard metrics
CREATE OR REPLACE VIEW admin_dashboard_metrics AS
SELECT 
    (SELECT COUNT(*) FROM quotes WHERE created_at >= CURRENT_DATE) as today_quotes,
    (SELECT COUNT(*) FROM blog_subscribers WHERE created_at >= CURRENT_DATE) as today_subscribers,
    (SELECT COUNT(*) FROM chatbot_interactions WHERE created_at >= CURRENT_DATE) as today_interactions,
    (SELECT COUNT(*) FROM error_logs WHERE timestamp >= CURRENT_DATE) as today_errors,
    (SELECT COUNT(*) FROM quotes WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_quotes,
    (SELECT COUNT(*) FROM blog_subscribers WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_subscribers,
    (SELECT COUNT(*) FROM chatbot_interactions WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_interactions,
    (SELECT AVG(confidence) FROM chatbot_interactions WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as avg_confidence;

-- View for real-time activity
CREATE OR REPLACE VIEW realtime_activity AS
SELECT 
    'quote' as activity_type,
    name as user_identifier,
    service as details,
    created_at
FROM quotes 
WHERE created_at >= NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
    'subscriber' as activity_type,
    email as user_identifier,
    source as details,
    created_at
FROM blog_subscribers 
WHERE created_at >= NOW() - INTERVAL '1 hour'
UNION ALL
SELECT 
    'interaction' as activity_type,
    session_id as user_identifier,
    LEFT(user_message, 50) as details,
    created_at
FROM chatbot_interactions 
WHERE created_at >= NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 50;

-- =============================================
-- GRANT PERMISSIONS FOR NEW OBJECTS
-- =============================================

-- Grant permissions on new functions
GRANT EXECUTE ON FUNCTION get_system_health() TO authenticated;
GRANT EXECUTE ON FUNCTION get_conversion_metrics(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION enhanced_cleanup_old_data() TO authenticated;

-- Grant permissions on new views
GRANT SELECT ON admin_dashboard_metrics TO authenticated;
GRANT SELECT ON realtime_activity TO authenticated;

-- Grant permissions on error_logs table
GRANT SELECT ON error_logs TO authenticated;
GRANT INSERT ON error_logs TO anon, authenticated;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE error_logs IS 'System error logging for monitoring and debugging';
COMMENT ON FUNCTION get_system_health() IS 'Get overall system health metrics for monitoring dashboard';
COMMENT ON FUNCTION get_conversion_metrics(INTEGER) IS 'Get conversion funnel metrics for specified time range';
COMMENT ON FUNCTION enhanced_cleanup_old_data() IS 'Enhanced cleanup function with batch processing and detailed reporting';
COMMENT ON VIEW admin_dashboard_metrics IS 'Pre-calculated metrics for admin dashboard performance';
COMMENT ON VIEW realtime_activity IS 'Real-time activity feed for admin monitoring';

-- =============================================
-- PERFORMANCE OPTIMIZATION SETTINGS
-- =============================================

-- Update table statistics for better query planning
ANALYZE quotes;
ANALYZE blog_subscribers;
ANALYZE chatbot_interactions;
ANALYZE knowledge_base;
ANALYZE analytics_events;
ANALYZE web_vitals;