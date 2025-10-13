-- 🎯 SQL À EXÉCUTER DANS SUPABASE DASHBOARD
-- Copiez TOUT ce contenu et exécutez-le dans SQL Editor

-- Créer la table blog_subscribers
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

-- Ajouter les index pour les performances
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON public.blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON public.blog_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_confirmation_token ON public.blog_subscribers(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_created_at ON public.blog_subscribers(created_at);

-- Activer la sécurité RLS
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies de sécurité pour permettre les inscriptions publiques
CREATE POLICY "Allow public insert" ON public.blog_subscribers
    FOR INSERT 
    TO anon, authenticated 
    WITH CHECK (true);

-- Policy pour permettre les confirmations publiques
CREATE POLICY "Allow public update for confirmation" ON public.blog_subscribers
    FOR UPDATE 
    TO anon, authenticated 
    USING (true) 
    WITH CHECK (true);

-- Policy pour permettre la lecture aux admins authentifiés
CREATE POLICY "Allow authenticated read" ON public.blog_subscribers
    FOR SELECT 
    TO authenticated 
    USING (true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS update_blog_subscribers_updated_at ON public.blog_subscribers;
CREATE TRIGGER update_blog_subscribers_updated_at
    BEFORE UPDATE ON public.blog_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Commentaires pour la documentation
COMMENT ON TABLE public.blog_subscribers IS 'Table pour gérer les abonnés à la newsletter';
COMMENT ON COLUMN public.blog_subscribers.email IS 'Adresse email de l''abonné';
COMMENT ON COLUMN public.blog_subscribers.status IS 'Statut: pending, active, unsubscribed';
COMMENT ON COLUMN public.blog_subscribers.confirmation_token IS 'Token pour confirmer l''inscription';
COMMENT ON COLUMN public.blog_subscribers.confirmed_at IS 'Date de confirmation';
COMMENT ON COLUMN public.blog_subscribers.source IS 'Source d''inscription';
COMMENT ON COLUMN public.blog_subscribers.metadata IS 'Métadonnées en JSON';