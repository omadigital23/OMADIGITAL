-- Fix the log_newsletter_event function to resolve subscriber_id ambiguity

-- Drop the existing function
DROP FUNCTION IF EXISTS log_newsletter_event(TEXT, TEXT, JSONB, INET, TEXT);

-- Recreate the function with explicit table references
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

-- Test the fixed function
SELECT log_newsletter_event('test@example.com', 'test_event');