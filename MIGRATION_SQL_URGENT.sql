-- 🚨 MIGRATION SQL URGENTE À EXÉCUTER DANS SUPABASE
-- Copiez TOUT ce contenu dans Supabase Dashboard > SQL Editor

-- 1. Créer la table blog_subscribers
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

-- 2. Créer la table newsletter_analytics
CREATE TABLE IF NOT EXISTS public.newsletter_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscriber_id UUID REFERENCES blog_subscribers(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table webhook_logs
CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    webhook_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Index pour performances
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON public.blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON public.blog_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_confirmation_token ON public.blog_subscribers(confirmation_token);

-- 5. Activer RLS
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- 6. Policies de sécurité
CREATE POLICY "Allow public insert" ON public.blog_subscribers
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update for confirmation" ON public.blog_subscribers
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read" ON public.blog_subscribers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow public insert analytics" ON public.newsletter_analytics
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read analytics" ON public.newsletter_analytics
    FOR SELECT TO authenticated USING (true);

-- 7. Fonction analytics
CREATE OR REPLACE FUNCTION log_newsletter_event(
    p_subscriber_email TEXT,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}'::jsonb,
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

-- 8. Test d'insertion pour vérifier
INSERT INTO public.blog_subscribers (email, status, source, confirmation_token)
VALUES ('test.migration@example.com', 'pending', 'migration_test', 'test-token-123')
ON CONFLICT (email) DO NOTHING;

-- 9. Commentaires
COMMENT ON TABLE public.blog_subscribers IS 'Table principale des abonnés newsletter';
COMMENT ON TABLE public.newsletter_analytics IS 'Analytics et événements newsletter';
COMMENT ON FUNCTION log_newsletter_event(TEXT, TEXT, JSONB, INET, TEXT) IS 'Log les événements analytics';