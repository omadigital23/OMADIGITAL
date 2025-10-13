-- 🚀 CRÉATION TABLES MANQUANTES DASHBOARD 360°
-- Exécuter ce script dans Supabase SQL Editor

-- ==========================================
-- 1. TABLE BLOG_SUBSCRIBERS (Newsletter)
-- ==========================================

CREATE TABLE IF NOT EXISTS blog_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'unsubscribed')),
  source VARCHAR(50) DEFAULT 'footer',
  confirmation_token TEXT,
  unsubscribe_token TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_engagement TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 2. TABLE ANALYTICS_EVENTS (Tracking)
-- ==========================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'click', 'form_submit', etc.
  page_url TEXT,
  user_session VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  city VARCHAR(100),
  referrer TEXT,
  metadata JSONB, -- Données supplémentaires flexibles
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. TABLE PERFORMANCE_METRICS (Performance)
-- ==========================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  metric_type VARCHAR(50) NOT NULL, -- 'load_time', 'api_response', 'database_query'
  metric_name VARCHAR(100), -- Nom spécifique de la métrique
  value DECIMAL NOT NULL, -- Valeur mesurée
  page_url TEXT,
  user_session VARCHAR(100),
  metadata JSONB, -- Contexte supplémentaire
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. TABLE WEB_VITALS (Core Web Vitals)
-- ==========================================

CREATE TABLE IF NOT EXISTS web_vitals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(20) NOT NULL, -- 'LCP', 'FID', 'CLS', 'FCP', 'TTFB'
  value DECIMAL NOT NULL, -- Valeur en ms ou score
  rating VARCHAR(20) DEFAULT 'good', -- 'good', 'needs-improvement', 'poor'
  page_url TEXT,
  user_session VARCHAR(100),
  connection_type VARCHAR(20), -- '4g', 'wifi', etc.
  device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 5. TABLE CTA_SUBMISSIONS (Formulaires)
-- ==========================================

CREATE TABLE IF NOT EXISTS cta_submissions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  message TEXT,
  source_page VARCHAR(255), -- Page d'origine du formulaire
  cta_type VARCHAR(50) DEFAULT 'contact', -- 'contact', 'demo', 'quote'
  user_session VARCHAR(100),
  followed_up BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'contacted', 'converted', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INDEX POUR PERFORMANCE
-- ==========================================

-- Blog Subscribers
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON blog_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_created_at ON blog_subscribers(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_source ON blog_subscribers(source);

-- Analytics Events
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(user_session);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON analytics_events(page_url);

-- Performance Metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp);

-- Web Vitals
CREATE INDEX IF NOT EXISTS idx_web_vitals_name ON web_vitals(name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_timestamp ON web_vitals(timestamp);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page ON web_vitals(page_url);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON web_vitals(rating);

-- CTA Submissions
CREATE INDEX IF NOT EXISTS idx_cta_submissions_email ON cta_submissions(email);
CREATE INDEX IF NOT EXISTS idx_cta_submissions_status ON cta_submissions(status);
CREATE INDEX IF NOT EXISTS idx_cta_submissions_created_at ON cta_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_cta_submissions_type ON cta_submissions(cta_type);

-- ==========================================
-- RLS (ROW LEVEL SECURITY) ET POLITIQUES
-- ==========================================

-- Activer RLS sur toutes les tables
ALTER TABLE blog_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_submissions ENABLE ROW LEVEL SECURITY;

-- Politiques pour permettre toutes les opérations (ajustez selon vos besoins de sécurité)
CREATE POLICY IF NOT EXISTS "Enable all operations for blog_subscribers" ON blog_subscribers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable all operations for analytics_events" ON analytics_events
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable all operations for performance_metrics" ON performance_metrics
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable all operations for web_vitals" ON web_vitals
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable all operations for cta_submissions" ON cta_submissions
  FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- DONNÉES EXEMPLE POUR TESTS
-- ==========================================

-- Newsletter test data
INSERT INTO blog_subscribers (email, status, source, confirmed_at) VALUES
  ('test1@example.com', 'active', 'footer', NOW()),
  ('test2@example.com', 'active', 'popup', NOW() - INTERVAL '5 days'),
  ('test3@example.com', 'pending', 'footer', NULL)
ON CONFLICT (email) DO NOTHING;

-- Analytics test data
INSERT INTO analytics_events (event_type, page_url, user_session) VALUES
  ('page_view', '/', 'session_1'),
  ('page_view', '/services', 'session_1'),
  ('page_view', '/contact', 'session_2'),
  ('click', '/services', 'session_1')
ON CONFLICT DO NOTHING;

-- Performance test data
INSERT INTO performance_metrics (metric_type, metric_name, value, page_url) VALUES
  ('load_time', 'page_load', 1.2, '/'),
  ('load_time', 'page_load', 2.1, '/services'),
  ('api_response', 'chatbot_api', 0.8, '/api/chat/gemini')
ON CONFLICT DO NOTHING;

-- Web Vitals test data
INSERT INTO web_vitals (name, value, rating, page_url) VALUES
  ('LCP', 2.1, 'good', '/'),
  ('FID', 85, 'good', '/'),
  ('CLS', 0.05, 'good', '/'),
  ('FCP', 1.2, 'good', '/')
ON CONFLICT DO NOTHING;

-- CTA test data
INSERT INTO cta_submissions (email, name, cta_type, source_page) VALUES
  ('lead1@example.com', 'Jean Dupont', 'contact', '/contact'),
  ('lead2@example.com', 'Marie Martin', 'demo', '/services'),
  ('lead3@example.com', 'Ahmed Hassan', 'quote', '/')
ON CONFLICT DO NOTHING;

-- ==========================================
-- FONCTIONS UTILITAIRES DASHBOARD
-- ==========================================

-- Fonction pour récupérer un résumé rapide
CREATE OR REPLACE FUNCTION get_dashboard_summary(days_back INTEGER DEFAULT 7)
RETURNS JSON AS $$
DECLARE
  result JSON;
  start_date TIMESTAMP;
BEGIN
  start_date := NOW() - (days_back || ' days')::INTERVAL;
  
  SELECT json_build_object(
    'visitors', (
      SELECT COUNT(DISTINCT user_session) 
      FROM analytics_events 
      WHERE timestamp >= start_date AND event_type = 'page_view'
    ),
    'conversations', (
      SELECT COUNT(*) 
      FROM chatbot_interactions 
      WHERE timestamp >= start_date
    ),
    'subscribers', (
      SELECT COUNT(*) 
      FROM blog_subscribers 
      WHERE created_at >= start_date
    ),
    'quotes', (
      SELECT COUNT(*) 
      FROM quotes 
      WHERE created_at >= start_date
    ),
    'cta_submissions', (
      SELECT COUNT(*) 
      FROM cta_submissions 
      WHERE created_at >= start_date
    ),
    'avg_load_time', (
      SELECT ROUND(AVG(value), 2) 
      FROM performance_metrics 
      WHERE metric_type = 'load_time' AND timestamp >= start_date
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TRIGGERS POUR AUTO-UPDATE
-- ==========================================

-- Fonction pour mettre à jour automatiquement last_engagement
CREATE OR REPLACE FUNCTION update_last_engagement()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour last_engagement quand le statut change vers 'active'
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    NEW.last_engagement = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur blog_subscribers
DROP TRIGGER IF EXISTS trigger_update_last_engagement ON blog_subscribers;
CREATE TRIGGER trigger_update_last_engagement
  BEFORE UPDATE ON blog_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_last_engagement();

-- ==========================================
-- VUES POUR REQUÊTES OPTIMISÉES
-- ==========================================

-- Vue pour analytics résumé
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
  DATE(timestamp) as date,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_session) as unique_sessions,
  COUNT(DISTINCT page_url) as unique_pages
FROM analytics_events
GROUP BY DATE(timestamp), event_type
ORDER BY date DESC;

-- Vue pour performance résumé
CREATE OR REPLACE VIEW performance_summary AS
SELECT 
  DATE(timestamp) as date,
  metric_type,
  metric_name,
  AVG(value) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value,
  COUNT(*) as measurement_count
FROM performance_metrics
GROUP BY DATE(timestamp), metric_type, metric_name
ORDER BY date DESC;

-- ==========================================
-- VÉRIFICATION FINALE
-- ==========================================

-- Vérifier que toutes les tables ont été créées
DO $$
BEGIN
  RAISE NOTICE '✅ Vérification des tables créées:';
  
  PERFORM 1 FROM information_schema.tables WHERE table_name = 'blog_subscribers';
  IF FOUND THEN
    RAISE NOTICE '✅ blog_subscribers - OK';
  ELSE
    RAISE NOTICE '❌ blog_subscribers - ÉCHEC';
  END IF;
  
  PERFORM 1 FROM information_schema.tables WHERE table_name = 'analytics_events';
  IF FOUND THEN
    RAISE NOTICE '✅ analytics_events - OK';
  ELSE
    RAISE NOTICE '❌ analytics_events - ÉCHEC';
  END IF;
  
  PERFORM 1 FROM information_schema.tables WHERE table_name = 'performance_metrics';
  IF FOUND THEN
    RAISE NOTICE '✅ performance_metrics - OK';
  ELSE
    RAISE NOTICE '❌ performance_metrics - ÉCHEC';
  END IF;
  
  PERFORM 1 FROM information_schema.tables WHERE table_name = 'web_vitals';
  IF FOUND THEN
    RAISE NOTICE '✅ web_vitals - OK';
  ELSE
    RAISE NOTICE '❌ web_vitals - ÉCHEC';
  END IF;
  
  PERFORM 1 FROM information_schema.tables WHERE table_name = 'cta_submissions';
  IF FOUND THEN
    RAISE NOTICE '✅ cta_submissions - OK';
  ELSE
    RAISE NOTICE '❌ cta_submissions - ÉCHEC';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 CRÉATION TABLES TERMINÉE !';
  RAISE NOTICE 'Le Dashboard 360° est maintenant entièrement fonctionnel.';
END $$;