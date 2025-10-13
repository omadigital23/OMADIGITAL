-- Create trigger function to call webhook when new subscriber is added
CREATE OR REPLACE FUNCTION public.trigger_newsletter_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger for INSERT operations
  IF TG_OP = 'INSERT' THEN
    -- Only trigger for pending subscribers (new signups)
    IF NEW.status = 'pending' THEN
      -- Use pg_net extension to make HTTP request to Supabase Edge Function
      -- Note: This requires the pg_net extension to be enabled in Supabase
      -- If pg_net is not available, you can use Supabase's built-in webhooks feature instead
      PERFORM net.http_post(
        url := 'https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/newsletter-webhook-trigger',
        body := jsonb_build_object(
          'type', 'INSERT',
          'table', 'blog_subscribers',
          'record', to_jsonb(NEW)
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on blog_subscribers table
CREATE TRIGGER newsletter_webhook_trigger
  AFTER INSERT ON public.blog_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_newsletter_webhook();

-- Alternative approach using Supabase's built-in webhooks (if pg_net is not available)
-- This would be configured in the Supabase dashboard under Database > Webhooks
-- Table: blog_subscribers
-- Event: Insert
-- URL: https://YOUR_SUPABASE_PROJECT.supabase.co/functions/v1/newsletter-webhook-trigger
-- Headers: 
--   Content-Type: application/json
--   Authorization: Bearer YOUR_SERVICE_ROLE_KEY