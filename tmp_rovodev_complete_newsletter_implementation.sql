-- 🎯 IMPLÉMENTATION COMPLÈTE NEWSLETTER + MAKE.COM
-- À exécuter dans Supabase Dashboard > SQL Editor

-- 1. Créer la table blog_subscribers (si pas encore fait)
CREATE TABLE IF NOT EXISTS public.blog_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed')),
    confirmation_token VARCHAR(255) UNIQUE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50) DEFAULT 'website',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table analytics newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscriber_id UUID REFERENCES blog_subscribers(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('subscribe', 'confirm', 'open', 'click', 'unsubscribe')),
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table pour tracking des webhooks Make
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Index pour performances
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON public.blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON public.blog_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_confirmation_token ON public.blog_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_created_at ON public.blog_subscribers(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_subscriber ON public.newsletter_analytics(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_analytics_event ON public.newsletter_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON public.webhook_logs(webhook_type);

-- 5. RLS Policies
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour blog_subscribers
CREATE POLICY "Allow public insert" ON public.blog_subscribers
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update for confirmation" ON public.blog_subscribers
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON public.blog_subscribers
    FOR SELECT TO authenticated USING (true);

-- Policies pour newsletter_analytics
CREATE POLICY "Allow public insert analytics" ON public.newsletter_analytics
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read analytics" ON public.newsletter_analytics
    FOR SELECT TO authenticated USING (true);

-- Policies pour webhook_logs
CREATE POLICY "Allow service role all" ON public.webhook_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Trigger pour updated_at
DROP TRIGGER IF EXISTS update_blog_subscribers_updated_at ON public.blog_subscribers;
CREATE TRIGGER update_blog_subscribers_updated_at
    BEFORE UPDATE ON public.blog_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Fonction webhook Make.com
CREATE OR REPLACE FUNCTION notify_make_webhook()
RETURNS TRIGGER AS $$
DECLARE
    webhook_url TEXT := COALESCE(current_setting('app.settings.make_webhook_url', true), 'https://hook.us2.make.com/upafrqdjez0uoj8w8y5iloeqqkhd0xrf');
    payload JSONB;
    response TEXT;
BEGIN
    -- Construire le payload pour Make.com
    payload := json_build_object(
        'event', TG_OP,
        'table', 'blog_subscribers',
        'data', row_to_json(NEW),
        'old_data', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        'timestamp', NOW()
    );
    
    -- Envoyer vers Make.com (nécessite l'extension http)
    -- Note: Cette fonction nécessite l'activation de l'extension http dans Supabase
    BEGIN
        SELECT content INTO response
        FROM http((
            'POST',
            webhook_url,
            ARRAY[http_header('Content-Type', 'application/json')],
            payload::TEXT,
            NULL
        )::http_request);
        
        -- Logger le succès
        INSERT INTO webhook_logs (webhook_type, payload, response_status, response_body)
        VALUES ('make_newsletter', payload, 200, response);
        
    EXCEPTION WHEN OTHERS THEN
        -- Logger l'erreur
        INSERT INTO webhook_logs (webhook_type, payload, response_status, error_message)
        VALUES ('make_newsletter', payload, 500, SQLERRM);
    END;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- 9. Trigger pour webhook Make.com
DROP TRIGGER IF EXISTS trigger_make_webhook ON public.blog_subscribers;
CREATE TRIGGER trigger_make_webhook
    AFTER INSERT OR UPDATE ON public.blog_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION notify_make_webhook();

-- 10. Fonction pour analytics
CREATE OR REPLACE FUNCTION log_newsletter_event(
    p_subscriber_email TEXT,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    subscriber_id UUID;
    analytics_id UUID;
BEGIN
    -- Trouver l'abonné
    SELECT id INTO subscriber_id 
    FROM blog_subscribers 
    WHERE email = p_subscriber_email;
    
    IF subscriber_id IS NOT NULL THEN
        -- Insérer l'événement analytics
        INSERT INTO newsletter_analytics (
            subscriber_id, 
            event_type, 
            event_data, 
            ip_address, 
            user_agent
        )
        VALUES (
            subscriber_id, 
            p_event_type, 
            p_event_data, 
            p_ip_address, 
            p_user_agent
        )
        RETURNING id INTO analytics_id;
    END IF;
    
    RETURN analytics_id;
END;
$$ language 'plpgsql';

-- 11. Vue pour dashboard analytics
CREATE OR REPLACE VIEW newsletter_dashboard AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'pending') as pending_subscribers,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
    COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_subscribers,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month,
    COUNT(*) as total_subscribers
FROM blog_subscribers;

-- 12. Commentaires
COMMENT ON TABLE public.blog_subscribers IS 'Table principale des abonnés newsletter';
COMMENT ON TABLE public.newsletter_analytics IS 'Analytics et événements newsletter';
COMMENT ON TABLE public.webhook_logs IS 'Logs des webhooks Make.com';
COMMENT ON FUNCTION notify_make_webhook() IS 'Envoie automatiquement vers Make.com';
COMMENT ON FUNCTION log_newsletter_event(TEXT, TEXT, JSONB, INET, TEXT) IS 'Log les événements analytics';

-- 13. Activer l'extension http (si pas encore fait)
-- Cette commande peut échouer si l'extension n'est pas disponible, c'est normal
CREATE EXTENSION IF NOT EXISTS http;