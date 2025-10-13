-- OMA Digital Database Migration Script (Clean Version Without Blog Tables)
-- This script should be run in order to set up the database properly

-- First, drop existing objects to avoid conflicts
-- Drop triggers
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON knowledge_base;
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
DROP TRIGGER IF EXISTS update_cta_actions_updated_at ON cta_actions;
DROP TRIGGER IF EXISTS update_visitor_sessions_updated_at ON visitor_sessions;
DROP TRIGGER IF EXISTS update_performance_config_updated_at ON performance_config;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS aggregate_performance_trends() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_performance_data() CASCADE;

-- Drop views
DROP VIEW IF EXISTS performance_dashboard;

-- Drop tables (in reverse order of creation to handle dependencies)
DROP TABLE IF EXISTS cta_conversions;
DROP TABLE IF EXISTS cta_tracking;
DROP TABLE IF EXISTS cta_actions;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS chatbot_interactions;
DROP TABLE IF EXISTS bot_responses;
DROP TABLE IF EXISTS user_intents;
DROP TABLE IF EXISTS knowledge_base;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS user_behavior_events;
DROP TABLE IF EXISTS page_views;
DROP TABLE IF EXISTS visitor_sessions;
DROP TABLE IF EXISTS performance_config;
DROP TABLE IF EXISTS performance_trends;
DROP TABLE IF EXISTS performance_budget_checks;
DROP TABLE IF EXISTS pagespeed_results;
DROP TABLE IF EXISTS performance_alerts;

-- Drop extensions
DROP EXTENSION IF EXISTS vector;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'viewer')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chatbot Tables
-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    language VARCHAR(2) DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sender VARCHAR(10) NOT NULL CHECK (sender IN ('user', 'bot')),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image')),
    language VARCHAR(2) DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    confidence FLOAT DEFAULT 1.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de la base de connaissances OMA Digital
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    language VARCHAR(2) NOT NULL CHECK (language IN ('fr', 'en')),
    keywords TEXT[],
    embedding vector(1536), -- Pour les embeddings OpenAI/Google
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des intentions détectées
CREATE TABLE IF NOT EXISTS user_intents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    intent VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    entities JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réponses du chatbot avec feedback
CREATE TABLE IF NOT EXISTS bot_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    response_type VARCHAR(50) DEFAULT 'generated',
    source VARCHAR(100), -- 'knowledge_base', 'ai_generated', 'fallback'
    confidence FLOAT DEFAULT 1.0,
    user_feedback INTEGER CHECK (user_feedback IN (-1, 0, 1)), -- -1: negative, 0: neutral, 1: positive
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot Interactions Table
CREATE TABLE IF NOT EXISTS chatbot_interactions (
  message_id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  input_method TEXT CHECK (input_method IN ('text', 'voice')),
  response_time INTEGER NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  conversation_length INTEGER,
  user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5)
);

-- Quotes Table (Contact Form)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  budget TEXT,
  status TEXT NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CTA System Tables
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

-- Analytics Tables
-- Table for visitor sessions
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  visitor_id UUID REFERENCES auth.users(id), -- For identified visitors
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  landing_page TEXT NOT NULL,
  exit_page TEXT,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration INTERVAL GENERATED ALWAYS AS (end_time - start_time) STORED,
  page_views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  scrolls INTEGER DEFAULT 0,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser TEXT,
  operating_system TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  is_bounce BOOLEAN DEFAULT TRUE,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for page views with time spent tracking
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  entry_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exit_time TIMESTAMPTZ,
  time_on_page INTERVAL GENERATED ALWAYS AS (exit_time - entry_time) STORED,
  scroll_depth INTEGER, -- Percentage of page scrolled
  engagement_score NUMERIC(3,2) CHECK (engagement_score >= 0 AND engagement_score <= 1),
  is_exit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for user behavior events
CREATE TABLE IF NOT EXISTS user_behavior_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'click', 'scroll', 'form_submit', 'download', 'video_play', 'video_complete',
    'social_share', 'search', 'filter', 'sort', 'pagination'
  )),
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  page_url TEXT NOT NULL,
  x_position INTEGER,
  y_position INTEGER,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Performance Monitoring Tables
-- Performance alerts table
CREATE TABLE IF NOT EXISTS performance_alerts (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('warning', 'critical', 'info')),
    metric VARCHAR(100) NOT NULL,
    value DECIMAL(10,3) NOT NULL,
    threshold DECIMAL(10,3) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    url VARCHAR(500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PageSpeed Insights results table
CREATE TABLE IF NOT EXISTS pagespeed_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(500) NOT NULL,
    strategy VARCHAR(20) NOT NULL CHECK (strategy IN ('mobile', 'desktop')),
    performance_score INTEGER NOT NULL CHECK (performance_score >= 0 AND performance_score <= 100),
    accessibility_score INTEGER NOT NULL CHECK (accessibility_score >= 0 AND accessibility_score <= 100),
    best_practices_score INTEGER NOT NULL CHECK (best_practices_score >= 0 AND best_practices_score <= 100),
    seo_score INTEGER NOT NULL CHECK (seo_score >= 0 AND seo_score <= 100),
    
    -- Core Web Vitals
    lcp DECIMAL(10,3), -- Largest Contentful Paint (ms)
    fid DECIMAL(10,3), -- First Input Delay (ms)
    cls DECIMAL(10,4), -- Cumulative Layout Shift (score)
    fcp DECIMAL(10,3), -- First Contentful Paint (ms)
    ttfb DECIMAL(10,3), -- Time to First Byte (ms)
    
    -- Additional metrics
    speed_index DECIMAL(10,3),
    interactive DECIMAL(10,3),
    total_blocking_time DECIMAL(10,3),
    
    -- Opportunities and diagnostics
    opportunities JSONB,
    diagnostics JSONB,
    
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance budget checks table
CREATE TABLE IF NOT EXISTS performance_budget_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    overall_status VARCHAR(20) NOT NULL CHECK (overall_status IN ('passing', 'warning', 'failing')),
    violation_count INTEGER NOT NULL DEFAULT 0,
    violations JSONB NOT NULL DEFAULT '[]',
    metrics JSONB, -- Store the metrics that were checked
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance trends table for historical analysis
CREATE TABLE IF NOT EXISTS performance_trends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(500) NOT NULL,
    date DATE NOT NULL,
    hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
    
    -- Aggregated metrics for the hour
    avg_lcp DECIMAL(10,3),
    avg_fid DECIMAL(10,3),
    avg_cls DECIMAL(10,4),
    avg_fcp DECIMAL(10,3),
    avg_ttfb DECIMAL(10,3),
    
    avg_mobile_score DECIMAL(5,2),
    avg_desktop_score DECIMAL(5,2),
    
    sample_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(url, date, hour)
);

-- Real User Metrics (RUM) table
CREATE TABLE IF NOT EXISTS real_user_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    user_agent TEXT,
    connection_type VARCHAR(50),
    device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
    
    -- Page load metrics
    page_url VARCHAR(500) NOT NULL,
    load_time INTEGER, -- Total page load time (ms)
    dom_ready_time INTEGER, -- DOM ready time (ms)
    first_paint INTEGER, -- First paint time (ms)
    
    -- Web Vitals from real users
    lcp INTEGER,
    fid INTEGER,
    cls DECIMAL(10,4),
    fcp INTEGER,
    ttfb INTEGER,
    
    -- User interaction metrics
    bounce BOOLEAN DEFAULT FALSE,
    session_duration INTEGER, -- in seconds
    page_views INTEGER DEFAULT 1,
    
    -- Geographic and technical info
    country VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance monitoring configuration table
CREATE TABLE IF NOT EXISTS performance_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for all tables
-- Admin users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Chatbot indexes
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_language ON conversations(language);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language ON knowledge_base(language);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_user_intents_intent ON user_intents(intent);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);

-- Chatbot interactions indexes
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_session_id ON chatbot_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_timestamp ON chatbot_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_chatbot_interactions_user_id ON chatbot_interactions(user_id);

-- Quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_service ON quotes(service);

-- CTA indexes
CREATE INDEX IF NOT EXISTS idx_cta_actions_type ON cta_actions(type);
CREATE INDEX IF NOT EXISTS idx_cta_actions_active ON cta_actions(is_active);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_cta_id ON cta_tracking(cta_id);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_session ON cta_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_cta_tracking_created_at ON cta_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_cta_conversions_cta_id ON cta_conversions(cta_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id ON visitor_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_start_time ON visitor_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_device_type ON visitor_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country ON visitor_sessions(country);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_landing_page ON visitor_sessions(landing_page);

CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_page_views_entry_time ON page_views(entry_time);
CREATE INDEX IF NOT EXISTS idx_page_views_time_on_page ON page_views(time_on_page);

CREATE INDEX IF NOT EXISTS idx_user_behavior_events_session_id ON user_behavior_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_event_type ON user_behavior_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_page_url ON user_behavior_events(page_url);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_timestamp ON user_behavior_events(timestamp);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_time_device ON visitor_sessions(start_time, device_type);
CREATE INDEX IF NOT EXISTS idx_page_views_session_page ON page_views(session_id, page_url);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_session_event ON user_behavior_events(session_id, event_type);

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_performance_alerts_timestamp ON performance_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_resolved ON performance_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_performance_alerts_type ON performance_alerts(type);

CREATE INDEX IF NOT EXISTS idx_pagespeed_results_timestamp ON pagespeed_results(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pagespeed_results_url ON pagespeed_results(url);
CREATE INDEX IF NOT EXISTS idx_pagespeed_results_strategy ON pagespeed_results(strategy);

CREATE INDEX IF NOT EXISTS idx_performance_budget_timestamp ON performance_budget_checks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_budget_status ON performance_budget_checks(overall_status);

CREATE INDEX IF NOT EXISTS idx_performance_trends_date ON performance_trends(date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_trends_url ON performance_trends(url);

CREATE INDEX IF NOT EXISTS idx_real_user_metrics_timestamp ON real_user_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_real_user_metrics_session ON real_user_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_real_user_metrics_url ON real_user_metrics(page_url);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cta_actions_updated_at BEFORE UPDATE ON cta_actions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visitor_sessions_updated_at BEFORE UPDATE ON visitor_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_config_updated_at BEFORE UPDATE ON performance_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Performance monitoring functions
CREATE OR REPLACE FUNCTION aggregate_performance_trends()
RETURNS VOID AS $$
BEGIN
    -- Aggregate hourly performance data
    INSERT INTO performance_trends (
        url, date, hour, 
        avg_lcp, avg_fid, avg_cls, avg_fcp, avg_ttfb,
        avg_mobile_score, avg_desktop_score,
        sample_count
    )
    SELECT 
        url,
        DATE(timestamp) as date,
        EXTRACT(hour FROM timestamp) as hour,
        AVG(lcp) as avg_lcp,
        AVG(fid) as avg_fid,
        AVG(cls) as avg_cls,
        AVG(fcp) as avg_fcp,
        AVG(ttfb) as avg_ttfb,
        AVG(CASE WHEN strategy = 'mobile' THEN performance_score END) as avg_mobile_score,
        AVG(CASE WHEN strategy = 'desktop' THEN performance_score END) as avg_desktop_score,
        COUNT(*) as sample_count
    FROM pagespeed_results
    WHERE timestamp >= NOW() - INTERVAL '2 hours'
    AND NOT EXISTS (
        SELECT 1 FROM performance_trends pt 
        WHERE pt.url = pagespeed_results.url 
        AND pt.date = DATE(pagespeed_results.timestamp)
        AND pt.hour = EXTRACT(hour FROM pagespeed_results.timestamp)
    )
    GROUP BY url, DATE(timestamp), EXTRACT(hour FROM timestamp)
    ON CONFLICT (url, date, hour) DO UPDATE SET
        avg_lcp = EXCLUDED.avg_lcp,
        avg_fid = EXCLUDED.avg_fid,
        avg_cls = EXCLUDED.avg_cls,
        avg_fcp = EXCLUDED.avg_fcp,
        avg_ttfb = EXCLUDED.avg_ttfb,
        avg_mobile_score = EXCLUDED.avg_mobile_score,
        avg_desktop_score = EXCLUDED.avg_desktop_score,
        sample_count = EXCLUDED.sample_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_performance_data()
RETURNS VOID AS $$
BEGIN
    -- Delete alerts older than 90 days
    DELETE FROM performance_alerts 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    
    -- Delete resolved alerts older than 30 days
    DELETE FROM performance_alerts 
    WHERE resolved = TRUE AND timestamp < NOW() - INTERVAL '30 days';
    
    -- Delete raw PageSpeed results older than 7 days (keep trends)
    DELETE FROM pagespeed_results 
    WHERE timestamp < NOW() - INTERVAL '7 days';
    
    -- Delete budget checks older than 30 days
    DELETE FROM performance_budget_checks 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Delete real user metrics older than 30 days
    DELETE FROM real_user_metrics 
    WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Keep performance trends for 1 year
    DELETE FROM performance_trends 
    WHERE date < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Insert default performance configuration
INSERT INTO performance_config (key, value, description) VALUES
(
    'thresholds',
    '{
        "coreWebVitals": {
            "lcp": {"good": 2500, "needsImprovement": 4000},
            "fid": {"good": 100, "needsImprovement": 300},
            "cls": {"good": 0.1, "needsImprovement": 0.25},
            "fcp": {"good": 1800, "needsImprovement": 3000},
            "ttfb": {"good": 600, "needsImprovement": 1500}
        },
        "performance": {
            "mobileScore": {"good": 90, "needsImprovement": 50},
            "desktopScore": {"good": 90, "needsImprovement": 50}
        }
    }',
    'Performance thresholds for alerting'
),
(
    'budgets',
    '{
        "maxBundleSize": 300000,
        "maxImageSize": 500000,
        "maxLoadTime": 1500,
        "minCacheHitRate": 85,
        "maxLCP": 2000,
        "maxFID": 100,
        "maxCLS": 0.1,
        "minMobileScore": 85,
        "minDesktopScore": 90
    }',
    'Performance budgets for monitoring'
),
(
    'monitoring_urls',
    '[
        "https://oma-digital.sn",
        "https://oma-digital.sn/admin"
    ]',
    'URLs to monitor regularly'
),
(
    'alert_settings',
    '{
        "email_notifications": true,
        "slack_webhook": "",
        "check_interval_minutes": 15,
        "email_recipients": ["admin@oma-digital.sn"],
        "alert_cooldown_minutes": 60
    }',
    'Alert notification settings'
)
ON CONFLICT (key) DO NOTHING;

-- Insert default admin user
INSERT INTO admin_users (username, email, password_hash, salt, role, first_name, last_name, is_active)
VALUES (
  'admin_dca740c1',
  'admin@omadigital.com',
  'd90485b33a0a7c8b63714e4a7d8341514e3b653813142d0a1943215873210987210485b33a0a7c8b63714e4a7d8341514e3b653813142d0a1943215873210987',
  '7a1b8e3f4c2a9d5e1f0a6b4c8d3e7f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e',
  'admin',
  'Administrateur',
  'Principal',
  true
)
ON CONFLICT (username) DO NOTHING;

-- Insert default CTAs
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
 '{"email": "omasenegal25@gmail.com", "subject": "Demande d''information OMA Digital"}',
 '{"keywords": ["email", "mail", "courrier"], "language": "both"}');

-- Enable Row Level Security for all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagespeed_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_budget_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_config ENABLE ROW LEVEL SECURITY;

-- Create a view for performance dashboard
CREATE OR REPLACE VIEW performance_dashboard AS
SELECT 
    'current' as period,
    
    -- Latest PageSpeed scores
    (SELECT performance_score FROM pagespeed_results 
     WHERE strategy = 'mobile' AND url = 'https://oma-digital.sn' 
     ORDER BY timestamp DESC LIMIT 1) as mobile_score,
     
    (SELECT performance_score FROM pagespeed_results 
     WHERE strategy = 'desktop' AND url = 'https://oma-digital.sn' 
     ORDER BY timestamp DESC LIMIT 1) as desktop_score,
    
    -- Latest Core Web Vitals
    (SELECT lcp FROM pagespeed_results 
     WHERE url = 'https://oma-digital.sn' 
     ORDER BY timestamp DESC LIMIT 1) as current_lcp,
     
    (SELECT fid FROM pagespeed_results 
     WHERE url = 'https://oma-digital.sn' 
     ORDER BY timestamp DESC LIMIT 1) as current_fid,
     
    (SELECT cls FROM pagespeed_results 
     WHERE url = 'https://oma-digital.sn' 
     ORDER BY timestamp DESC LIMIT 1) as current_cls,
    
    -- Active alerts count
    (SELECT COUNT(*) FROM performance_alerts WHERE resolved = FALSE) as active_alerts,
    
    -- Budget status
    (SELECT overall_status FROM performance_budget_checks 
     ORDER BY timestamp DESC LIMIT 1) as budget_status,
     
    -- Real user metrics averages (last 24h)
    (SELECT AVG(load_time) FROM real_user_metrics 
     WHERE timestamp > NOW() - INTERVAL '24 hours') as avg_load_time_24h,
     
    (SELECT AVG(lcp) FROM real_user_metrics 
     WHERE timestamp > NOW() - INTERVAL '24 hours') as avg_lcp_24h,
     
    (SELECT COUNT(*) FROM real_user_metrics 
     WHERE timestamp > NOW() - INTERVAL '24 hours') as total_sessions_24h;

-- Add comments for documentation
COMMENT ON TABLE admin_users IS 'Admin user accounts for OMA Digital platform';
COMMENT ON TABLE user_roles IS 'User roles and permissions';
COMMENT ON TABLE conversations IS 'Chatbot conversations';
COMMENT ON TABLE messages IS 'Individual chat messages';
COMMENT ON TABLE knowledge_base IS 'Knowledge base for chatbot RAG system';
COMMENT ON TABLE user_intents IS 'Detected user intents from chat messages';
COMMENT ON TABLE bot_responses IS 'Bot responses with user feedback';
COMMENT ON TABLE chatbot_interactions IS 'Chatbot interaction tracking';
COMMENT ON TABLE quotes IS 'Contact form submissions';
COMMENT ON TABLE cta_actions IS 'Configurable call-to-action buttons';
COMMENT ON TABLE cta_tracking IS 'CTA tracking data';
COMMENT ON TABLE cta_conversions IS 'CTA conversion tracking';
COMMENT ON TABLE visitor_sessions IS 'Website visitor sessions';
COMMENT ON TABLE page_views IS 'Page view tracking';
COMMENT ON TABLE user_behavior_events IS 'User interaction events';
COMMENT ON TABLE performance_alerts IS 'Performance alerts when metrics exceed thresholds';
COMMENT ON TABLE pagespeed_results IS 'Google PageSpeed Insights results';
COMMENT ON TABLE performance_budget_checks IS 'Performance budget violations';
COMMENT ON TABLE performance_trends IS 'Aggregated hourly performance trends';
COMMENT ON TABLE real_user_metrics IS 'Real user monitoring data';
COMMENT ON TABLE performance_config IS 'Performance monitoring configuration';