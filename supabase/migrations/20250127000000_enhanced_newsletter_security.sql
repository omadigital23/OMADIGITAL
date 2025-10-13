-- Enhanced Newsletter Security & Data Quality Migration
-- Date: 2025-01-27
-- Description: Add security fields, data normalization triggers, and enhanced RLS policies

-- Add new security and normalization columns to blog_subscribers
ALTER TABLE public.blog_subscribers 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS email_hash VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(32),
ADD COLUMN IF NOT EXISTS email_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS bot_confidence INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_flags JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS engagement_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email_hash ON public.blog_subscribers(email_hash);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_first_name ON public.blog_subscribers(first_name);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_last_name ON public.blog_subscribers(last_name);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email_score ON public.blog_subscribers(email_score);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_last_activity ON public.blog_subscribers(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_engagement ON public.blog_subscribers(engagement_score);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_tags ON public.blog_subscribers USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_security_flags ON public.blog_subscribers USING GIN(security_flags);

-- Function to generate email hash
CREATE OR REPLACE FUNCTION generate_email_hash(email_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(lower(trim(email_text)), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to normalize and parse full name
CREATE OR REPLACE FUNCTION parse_full_name(full_name TEXT)
RETURNS JSONB AS $$
DECLARE
    clean_name TEXT;
    name_parts TEXT[];
    result JSONB;
BEGIN
    -- Return empty if no name provided
    IF full_name IS NULL OR trim(full_name) = '' THEN
        RETURN '{"first_name": "", "last_name": "", "full_name": ""}'::jsonb;
    END IF;
    
    -- Clean and normalize the name
    clean_name := trim(regexp_replace(full_name, '[^a-zA-ZÀ-ÿ\s\-''.]', '', 'g'));
    clean_name := regexp_replace(clean_name, '\s+', ' ', 'g');
    
    -- Split into parts
    name_parts := string_to_array(clean_name, ' ');
    
    -- Handle different cases
    IF array_length(name_parts, 1) = 1 THEN
        result := jsonb_build_object(
            'first_name', initcap(name_parts[1]),
            'last_name', '',
            'full_name', initcap(name_parts[1])
        );
    ELSIF array_length(name_parts, 1) = 2 THEN
        result := jsonb_build_object(
            'first_name', initcap(name_parts[1]),
            'last_name', initcap(name_parts[2]),
            'full_name', initcap(name_parts[1]) || ' ' || initcap(name_parts[2])
        );
    ELSE
        -- More than 2 parts: first name + rest as last name
        result := jsonb_build_object(
            'first_name', initcap(name_parts[1]),
            'last_name', initcap(array_to_string(name_parts[2:], ' ')),
            'full_name', initcap(array_to_string(name_parts, ' '))
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger function for automatic data normalization
CREATE OR REPLACE FUNCTION normalize_subscriber_data()
RETURNS TRIGGER AS $$
DECLARE
    name_data JSONB;
BEGIN
    -- Normalize email
    NEW.email := lower(trim(NEW.email));
    
    -- Generate email hash
    NEW.email_hash := generate_email_hash(NEW.email);
    
    -- Parse and normalize name if provided
    IF NEW.name IS NOT NULL AND NEW.name != '' THEN
        name_data := parse_full_name(NEW.name);
        NEW.first_name := name_data->>'first_name';
        NEW.last_name := name_data->>'last_name';
        NEW.name := name_data->>'full_name';
    END IF;
    
    -- Set last activity timestamp
    NEW.last_activity_at := NOW();
    
    -- Initialize security flags if not set
    IF NEW.security_flags IS NULL THEN
        NEW.security_flags := '{}'::jsonb;
    END IF;
    
    -- Auto-assign tags based on source and data
    IF NEW.tags IS NULL OR array_length(NEW.tags, 1) IS NULL THEN
        NEW.tags := ARRAY[]::TEXT[];
        
        -- Add source tag
        IF NEW.source IS NOT NULL THEN
            NEW.tags := array_append(NEW.tags, 'source:' || NEW.source);
        END IF;
        
        -- Add email domain tag
        IF NEW.email IS NOT NULL THEN
            NEW.tags := array_append(NEW.tags, 'domain:' || split_part(NEW.email, '@', 2));
        END IF;
        
        -- Add quality tags based on email score
        IF NEW.email_score >= 80 THEN
            NEW.tags := array_append(NEW.tags, 'quality:high');
        ELSIF NEW.email_score >= 50 THEN
            NEW.tags := array_append(NEW.tags, 'quality:medium');
        ELSE
            NEW.tags := array_append(NEW.tags, 'quality:low');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data normalization
DROP TRIGGER IF EXISTS normalize_subscriber_data_trigger ON public.blog_subscribers;
CREATE TRIGGER normalize_subscriber_data_trigger
    BEFORE INSERT OR UPDATE ON public.blog_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION normalize_subscriber_data();

-- Enhanced RLS policies
DROP POLICY IF EXISTS "Enhanced public insert" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Enhanced public update for confirmation" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Enhanced authenticated read" ON public.blog_subscribers;

-- Allow public insert with security checks
CREATE POLICY "Enhanced public insert" ON public.blog_subscribers
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        email IS NOT NULL 
        AND email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
        AND length(email) <= 255
        AND (email_score IS NULL OR email_score >= 30)
        AND (bot_confidence IS NULL OR bot_confidence <= 80)
    );

-- Allow public update for confirmation and unsubscription
CREATE POLICY "Enhanced public update for confirmation" ON public.blog_subscribers
    FOR UPDATE
    TO anon, authenticated
    USING (
        (confirmation_token IS NOT NULL AND confirmation_token != '')
        OR (unsubscribe_token IS NOT NULL AND unsubscribe_token != '')
    )
    WITH CHECK (
        status IN ('active', 'unsubscribed', 'pending')
    );

-- Enhanced read policy for authenticated users
CREATE POLICY "Enhanced authenticated read" ON public.blog_subscribers
    FOR SELECT
    TO authenticated
    USING (true);

-- Admin-only access to sensitive fields
CREATE POLICY "Admin only sensitive data" ON public.blog_subscribers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'admin@oma-digital.com',
                'contact@oma-digital.com'
            )
        )
    );

-- Function to safely get subscriber stats (without exposing emails)
CREATE OR REPLACE FUNCTION get_newsletter_stats()
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_subscribers', COUNT(*),
        'active_subscribers', COUNT(*) FILTER (WHERE status = 'active'),
        'pending_subscribers', COUNT(*) FILTER (WHERE status = 'pending'),
        'unsubscribed', COUNT(*) FILTER (WHERE status = 'unsubscribed'),
        'confirmed_today', COUNT(*) FILTER (WHERE confirmed_at >= CURRENT_DATE),
        'signed_up_today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE),
        'average_email_score', ROUND(AVG(email_score)),
        'high_quality_emails', COUNT(*) FILTER (WHERE email_score >= 80),
        'suspicious_signups', COUNT(*) FILTER (WHERE bot_confidence > 60),
        'top_sources', (
            SELECT jsonb_agg(jsonb_build_object('source', source, 'count', cnt))
            FROM (
                SELECT source, COUNT(*) as cnt
                FROM blog_subscribers
                WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
                GROUP BY source
                ORDER BY cnt DESC
                LIMIT 5
            ) top_sources_data
        ),
        'engagement_distribution', (
            SELECT jsonb_build_object(
                'high', COUNT(*) FILTER (WHERE engagement_score >= 70),
                'medium', COUNT(*) FILTER (WHERE engagement_score >= 40 AND engagement_score < 70),
                'low', COUNT(*) FILTER (WHERE engagement_score < 40)
            )
            FROM blog_subscribers
            WHERE status = 'active'
        )
    ) INTO stats
    FROM blog_subscribers;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update engagement score
CREATE OR REPLACE FUNCTION update_engagement_score(subscriber_email TEXT, action_type TEXT)
RETURNS VOID AS $$
DECLARE
    score_change INTEGER := 0;
BEGIN
    -- Calculate score change based on action
    CASE action_type
        WHEN 'email_open' THEN score_change := 5;
        WHEN 'email_click' THEN score_change := 10;
        WHEN 'website_visit' THEN score_change := 15;
        WHEN 'form_submission' THEN score_change := 20;
        WHEN 'conversion' THEN score_change := 50;
        WHEN 'unsubscribe' THEN score_change := -100;
        WHEN 'bounce' THEN score_change := -20;
        WHEN 'spam_complaint' THEN score_change := -50;
        ELSE score_change := 1;
    END CASE;
    
    -- Update engagement score (max 100, min 0)
    UPDATE blog_subscribers
    SET 
        engagement_score = GREATEST(0, LEAST(100, engagement_score + score_change)),
        last_activity_at = NOW(),
        updated_at = NOW()
    WHERE email = lower(trim(subscriber_email));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced webhook logging table
CREATE TABLE IF NOT EXISTS public.newsletter_webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscriber_email TEXT NOT NULL,
    event_type TEXT NOT NULL,
    webhook_url TEXT,
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Indexes for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_email ON public.newsletter_webhook_logs(subscriber_email);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON public.newsletter_webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.newsletter_webhook_logs(response_status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.newsletter_webhook_logs(created_at);

-- RLS for webhook logs
ALTER TABLE public.newsletter_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only webhook logs" ON public.newsletter_webhook_logs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email IN (
                'admin@oma-digital.com',
                'contact@oma-digital.com'
            )
        )
    );

-- Function to clean old data (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_newsletter_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Clean old unconfirmed subscribers (>30 days)
    DELETE FROM blog_subscribers
    WHERE status = 'pending'
    AND created_at < NOW() - INTERVAL '30 days'
    AND confirmed_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean old webhook logs (>90 days)
    DELETE FROM newsletter_webhook_logs
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Clean old analytics events (>1 year)
    DELETE FROM newsletter_analytics
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing data with new normalized fields
UPDATE blog_subscribers 
SET updated_at = NOW()
WHERE email_hash IS NULL OR first_name IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN blog_subscribers.email_hash IS 'SHA256 hash of email for privacy and deduplication';
COMMENT ON COLUMN blog_subscribers.first_name IS 'Extracted and normalized first name';
COMMENT ON COLUMN blog_subscribers.last_name IS 'Extracted and normalized last name';
COMMENT ON COLUMN blog_subscribers.email_score IS 'Email quality score (0-100, higher is better)';
COMMENT ON COLUMN blog_subscribers.bot_confidence IS 'Bot detection confidence (0-100, higher means more likely bot)';
COMMENT ON COLUMN blog_subscribers.security_flags IS 'Security-related flags and metadata';
COMMENT ON COLUMN blog_subscribers.engagement_score IS 'User engagement score based on actions';
COMMENT ON COLUMN blog_subscribers.tags IS 'Array of tags for segmentation and filtering';

COMMENT ON FUNCTION get_newsletter_stats() IS 'Get aggregated newsletter statistics without exposing personal data';
COMMENT ON FUNCTION update_engagement_score(TEXT, TEXT) IS 'Update subscriber engagement score based on actions';
COMMENT ON FUNCTION cleanup_old_newsletter_data() IS 'Clean up old newsletter data for maintenance';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_newsletter_stats() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_engagement_score(TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION cleanup_old_newsletter_data() TO service_role;