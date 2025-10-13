-- Migration pour les CTAs avec tracking et analytics
-- Date: 2025-01-21

-- Table des CTAs configurables
CREATE TABLE IF NOT EXISTS cta_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('contact', 'demo', 'appointment', 'quote', 'whatsapp', 'email', 'phone')),
    action TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    data JSONB DEFAULT '{}',
    conditions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de tracking des CTAs
CREATE TABLE IF NOT EXISTS cta_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cta_id UUID REFERENCES cta_actions(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    message_id TEXT,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('view', 'click', 'conversion')),
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des conversions CTA
CREATE TABLE IF NOT EXISTS cta_conversions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cta_id UUID REFERENCES cta_actions(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    conversion_type VARCHAR(50) NOT NULL,
    conversion_value DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_cta_actions_type ON cta_actions(type);
CREATE INDEX IF NOT EXISTS idx_cta_actions_active ON cta_actions(is_active);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_cta_id ON cta_tracking(cta_id);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_session ON cta_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_created_at ON cta_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_cta_conversions_cta_id ON cta_conversions(cta_id);

-- Trigger pour updated_at
CREATE TRIGGER update_cta_actions_updated_at 
    BEFORE UPDATE ON cta_actions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE cta_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_conversions ENABLE ROW LEVEL SECURITY;

-- Policies pour les CTAs (lecture publique, écriture admin)
CREATE POLICY "Allow public read access to active CTAs" ON cta_actions 
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access to CTAs" ON cta_actions 
    FOR ALL TO authenticated USING (true);

-- Policies pour le tracking (insertion publique, lecture admin)
CREATE POLICY "Allow public insert to CTA tracking" ON cta_tracking 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read CTA tracking" ON cta_tracking 
    FOR SELECT TO authenticated USING (true);

-- Policies pour les conversions
CREATE POLICY "Allow public insert to CTA conversions" ON cta_conversions 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read CTA conversions" ON cta_conversions 
    FOR SELECT TO authenticated USING (true);

-- Fonction pour calculer les métriques CTA
CREATE OR REPLACE FUNCTION get_cta_metrics(cta_uuid UUID)
RETURNS TABLE (
    total_views BIGINT,
    total_clicks BIGINT,
    total_conversions BIGINT,
    click_rate DECIMAL,
    conversion_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN action_type = 'view' THEN 1 ELSE 0 END), 0) as total_views,
        COALESCE(SUM(CASE WHEN action_type = 'click' THEN 1 ELSE 0 END), 0) as total_clicks,
        COALESCE(SUM(CASE WHEN action_type = 'conversion' THEN 1 ELSE 0 END), 0) as total_conversions,
        CASE 
            WHEN SUM(CASE WHEN action_type = 'view' THEN 1 ELSE 0 END) > 0 
            THEN ROUND((SUM(CASE WHEN action_type = 'click' THEN 1 ELSE 0 END)::DECIMAL / SUM(CASE WHEN action_type = 'view' THEN 1 ELSE 0 END)) * 100, 2)
            ELSE 0 
        END as click_rate,
        CASE 
            WHEN SUM(CASE WHEN action_type = 'click' THEN 1 ELSE 0 END) > 0 
            THEN ROUND((SUM(CASE WHEN action_type = 'conversion' THEN 1 ELSE 0 END)::DECIMAL / SUM(CASE WHEN action_type = 'click' THEN 1 ELSE 0 END)) * 100, 2)
            ELSE 0 
        END as conversion_rate
    FROM cta_tracking 
    WHERE cta_id = cta_uuid;
END;
$$ LANGUAGE plpgsql;

-- Données initiales pour les CTAs OMA Digital
INSERT INTO cta_actions (type, action, priority, data, conditions) VALUES
('whatsapp', 'Contacter sur WhatsApp', 'high', 
 '{"phone": "+212701193811", "message": "Bonjour ! Je souhaite en savoir plus sur vos services OMA Digital."}',
 '{"keywords": ["contact", "whatsapp", "téléphone"], "language": "both"}'),

('demo', 'Demander une démo', 'high',
 '{"service": "Démo automatisation WhatsApp", "url": "#contact"}',
 '{"keywords": ["démo", "demo", "essai", "test"], "language": "both"}'),

('quote', 'Obtenir un devis', 'medium',
 '{"service": "Devis personnalisé", "url": "#contact"}',
 '{"keywords": ["prix", "tarif", "coût", "devis", "quote"], "language": "both"}'),

('appointment', 'Prendre rendez-vous', 'medium',
 '{"service": "Consultation gratuite", "url": "#contact"}',
 '{"keywords": ["rdv", "rendez-vous", "appointment", "consultation"], "language": "both"}'),

('email', 'Envoyer un email', 'low',
 '{"email": "omasenegal25@gmail.com", "subject": "Demande d\'information OMA Digital"}',
 '{"keywords": ["email", "mail", "courrier"], "language": "both"}');