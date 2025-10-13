-- Comprehensive fix for blog_subscribers table triggers and functions

-- First, let's drop all existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS auto_enroll_new_subscriber_trigger ON public.blog_subscribers;
DROP TRIGGER IF EXISTS normalize_subscriber_data_trigger ON public.blog_subscribers;
DROP TRIGGER IF EXISTS update_blog_subscribers_updated_at ON public.blog_subscribers;
DROP TRIGGER IF EXISTS newsletter_webhook_trigger ON public.blog_subscribers;

-- Drop existing functions
DROP FUNCTION IF EXISTS normalize_subscriber_data();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS trigger_newsletter_webhook();
DROP FUNCTION IF EXISTS log_newsletter_event(TEXT, TEXT, JSONB, INET, TEXT);

-- Recreate the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the normalize_subscriber_data function with explicit table references
CREATE OR REPLACE FUNCTION normalize_subscriber_data()
RETURNS TRIGGER AS $$
DECLARE
    name_data JSONB;
BEGIN
    -- Normalize email
    NEW.email := lower(trim(NEW.email));
    
    -- Generate email hash if not already set
    IF NEW.email_hash IS NULL OR NEW.email_hash = '' THEN
        NEW.email_hash := encode(digest(lower(trim(NEW.email)), 'sha256'), 'hex');
    END IF;
    
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

-- Recreate the log_newsletter_event function with explicit variable names
CREATE OR REPLACE FUNCTION log_newsletter_event(
    p_subscriber_email TEXT,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_subscriber_id UUID;  -- Use v_ prefix to avoid ambiguity
    v_analytics_id UUID;
BEGIN
    -- Find the subscriber by email
    SELECT id INTO v_subscriber_id 
    FROM public.blog_subscribers 
    WHERE email = p_subscriber_email;
    
    IF v_subscriber_id IS NOT NULL THEN
        -- Insert the analytics event
        INSERT INTO public.newsletter_analytics (
            subscriber_id, 
            event_type, 
            event_data, 
            ip_address, 
            user_agent
        )
        VALUES (
            v_subscriber_id, 
            p_event_type, 
            p_event_data, 
            p_ip_address, 
            p_user_agent
        )
        RETURNING id INTO v_analytics_id;
    END IF;
    
    RETURN v_analytics_id;
END;
$$ LANGUAGE plpgsql;

-- Recreate the triggers
CREATE TRIGGER normalize_subscriber_data_trigger 
    BEFORE INSERT OR UPDATE ON public.blog_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION normalize_subscriber_data();

CREATE TRIGGER update_blog_subscribers_updated_at 
    BEFORE UPDATE ON public.blog_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Test the fix with a simple insert
INSERT INTO public.blog_subscribers (email, status, source)
VALUES ('comprehensive-fix-test@example.com', 'pending', 'comprehensive_fix_test')
ON CONFLICT (email) DO UPDATE SET updated_at = NOW();

-- Check if the insert worked
SELECT id, email, status, created_at FROM public.blog_subscribers 
WHERE email = 'comprehensive-fix-test@example.com';