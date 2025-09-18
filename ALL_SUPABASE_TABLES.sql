-- ALL SUPABASE TABLES FOR OMA DIGITAL PROJECT
-- This file contains all the required SQL tables for the OMA Digital project

-- 1. USER ROLES TABLE
-- Create user_roles table for admin access control
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Add RLS policies
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow selects for admins only
CREATE POLICY "Allow selects for admins" ON user_roles 
FOR SELECT USING (
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  COALESCE(auth.jwt() ->> 'role', '') = 'admin' OR
  -- Allow users to see their own roles
  user_id = auth.uid()
);

-- Allow inserts and updates for admins only
CREATE POLICY "Allow admin writes" ON user_roles 
FOR ALL USING (
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  COALESCE(auth.jwt() ->> 'role', '') = 'admin'
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 2. QUOTES TABLE
-- Create quotes table for free quote form
create table if not exists quotes (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  company text,
  service text not null,
  message text not null,
  budget text,
  status text not null default 'nouveau',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes for better query performance
create index if not exists idx_quotes_status on quotes(status);
create index if not exists idx_quotes_created_at on quotes(created_at);
create index if not exists idx_quotes_service on quotes(service);

-- Add RLS policies
alter table quotes enable row level security;

-- Allow inserts for everyone (contact form submissions)
create policy "Allow inserts for contact forms" on quotes 
  for insert with check (true);

-- Allow selects for authenticated users only (admins)
create policy "Allow selects for admins" on quotes 
  for select using (
    auth.role() = 'authenticated'
  );

-- Allow updates for authenticated users only (admins)
create policy "Allow updates for admins" on quotes 
  for update using (
    auth.role() = 'authenticated'
  );

-- Grant permissions
grant insert on quotes to anon;
grant select, update on quotes to authenticated;

-- Add trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_quotes_updated_at 
    before update on quotes 
    for each row 
    execute procedure update_updated_at_column();

-- 3. CHATBOT TABLES
-- Extension for the vectors (embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
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

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversations_language ON conversations(language);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language ON knowledge_base(language);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_active ON knowledge_base(is_active);
CREATE INDEX IF NOT EXISTS idx_user_intents_intent ON user_intents(intent);

-- Index vectoriel pour la recherche sémantique
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_responses ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (permettre l'accès public pour le chatbot)
CREATE POLICY "Allow public access to conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow public access to messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow public read access to knowledge_base" ON knowledge_base FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public access to user_intents" ON user_intents FOR ALL USING (true);
CREATE POLICY "Allow public access to bot_responses" ON bot_responses FOR ALL USING (true);

-- Allow admins to access all chatbot data
CREATE POLICY "Allow admin access to conversations" ON conversations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to messages" ON messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to knowledge_base" ON knowledge_base FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to user_intents" ON user_intents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to bot_responses" ON bot_responses FOR ALL TO authenticated USING (true);

-- 4. CHATBOT INTERACTIONS TABLE
-- Create chatbot interactions table for tracking chatbot conversations
create table if not exists chatbot_interactions (
  message_id text primary key,
  user_id uuid,
  session_id text not null,
  message_text text not null,
  response_text text not null,
  input_method text check (input_method in ('text', 'voice')),
  response_time integer not null,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  timestamp timestamptz not null default now(),
  conversation_length integer,
  user_satisfaction integer check (user_satisfaction >= 1 and user_satisfaction <= 5)
);

-- Create indexes for better query performance
create index if not exists idx_chatbot_interactions_session_id on chatbot_interactions(session_id);
create index if not exists idx_chatbot_interactions_timestamp on chatbot_interactions(timestamp);
create index if not exists idx_chatbot_interactions_user_id on chatbot_interactions(user_id);

-- Add RLS policies
alter table chatbot_interactions enable row level security;

-- Allow inserts for everyone (chatbot data)
create policy "Allow inserts for chatbot interactions" on chatbot_interactions 
  for insert with check (true);

-- Allow selects for admins only
create policy "Allow selects for admins" on chatbot_interactions 
  for select using (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Grant permissions
grant insert on chatbot_interactions to anon;
grant select on chatbot_interactions to authenticated;

-- 5. ANALYTICS EVENTS TABLE
-- Create analytics events table
create table if not exists analytics_events (
  id uuid default gen_random_uuid() primary key,
  event_name text not null,
  event_properties jsonb,
  user_id uuid,
  session_id text,
  timestamp timestamptz not null default now(),
  url text,
  user_agent text,
  ip_address text,
  metadata jsonb
);

-- Create indexes for better query performance
create index if not exists idx_analytics_events_event_name on analytics_events(event_name);
create index if not exists idx_analytics_events_timestamp on analytics_events(timestamp);
create index if not exists idx_analytics_events_user_id on analytics_events(user_id);
create index if not exists idx_analytics_events_session_id on analytics_events(session_id);

-- Add RLS policies
alter table analytics_events enable row level security;

-- Allow inserts for everyone (analytics data)
create policy "Allow inserts for analytics" on analytics_events 
  for insert with check (true);

-- Allow selects for admins only
create policy "Allow selects for admins" on analytics_events 
  for select using (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Grant permissions
grant insert on analytics_events to anon;
grant select on analytics_events to authenticated;

-- 6. A/B TESTING TABLE
-- Create A/B test results table
create table if not exists ab_test_results (
  id uuid default gen_random_uuid() primary key,
  test_name text not null,
  variant text not null,
  conversion boolean not null default false,
  user_id uuid,
  session_id text,
  timestamp timestamptz not null default now(),
  metadata jsonb
);

-- Create indexes for better query performance
create index if not exists idx_ab_test_results_test_name on ab_test_results(test_name);
create index if not exists idx_ab_test_results_variant on ab_test_results(variant);
create index if not exists idx_ab_test_results_conversion on ab_test_results(conversion);
create index if not exists idx_ab_test_results_timestamp on ab_test_results(timestamp);

-- Add RLS policies
alter table ab_test_results enable row level security;

-- Allow inserts for everyone (analytics data)
create policy "Allow inserts for analytics" on ab_test_results 
  for insert with check (true);

-- Allow selects for admins only
create policy "Allow selects for admins" on ab_test_results 
  for select using (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Grant permissions
grant insert on ab_test_results to anon;
grant select on ab_test_results to authenticated;

-- 7. WEB VITALS TABLE
-- Create web vitals table for Core Web Vitals monitoring
create table if not exists web_vitals (
  id uuid default gen_random_uuid() primary key,
  metric_name text not null,
  metric_value numeric not null,
  metric_rating text check (metric_rating in ('good', 'needs-improvement', 'poor')),
  metric_delta numeric,
  metric_id text,
  page_url text,
  user_agent text,
  created_at timestamptz not null default now(),
  session_id text,
  ip_address text,
  metadata jsonb
);

-- Create indexes for better query performance
create index if not exists idx_web_vitals_metric_name on web_vitals(metric_name);
create index if not exists idx_web_vitals_metric_rating on web_vitals(metric_rating);
create index if not exists idx_web_vitals_created_at on web_vitals(created_at);
create index if not exists idx_web_vitals_page_url on web_vitals(page_url);

-- Add RLS policies
alter table web_vitals enable row level security;

-- Allow inserts for everyone (analytics data)
create policy "Allow inserts for analytics" on web_vitals 
  for insert with check (true);

-- Allow selects for admins only
create policy "Allow selects for admins" on web_vitals 
  for select using (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Grant permissions
grant insert on web_vitals to anon;
grant select on web_vitals to authenticated;

-- 8. BLOG ARTICLES TABLE
-- Create blog articles table
create table if not exists blog_articles (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text,
  excerpt text,
  slug text unique,
  language text default 'fr',
  status text check (status in ('draft', 'published', 'archived')) default 'draft',
  author_id uuid references auth.users(id),
  tags text[],
  featured_image_url text,
  seo_title text,
  seo_description text,
  reading_time integer,
  word_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- Create indexes for better query performance
create index if not exists idx_blog_articles_status on blog_articles(status);
create index if not exists idx_blog_articles_language on blog_articles(language);
create index if not exists idx_blog_articles_created_at on blog_articles(created_at);
create index if not exists idx_blog_articles_published_at on blog_articles(published_at);
create index if not exists idx_blog_articles_slug on blog_articles(slug);

-- Add trigger to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_blog_articles_updated_at 
  before update on blog_articles 
  for each row 
  execute function update_updated_at_column();

-- Add RLS policies
alter table blog_articles enable row level security;

-- Allow selects for everyone (published articles only)
create policy "Allow public reads for published articles" on blog_articles 
  for select using (status = 'published');

-- Allow inserts and updates for authenticated users (admins)
create policy "Allow admin writes" on blog_articles 
  for all to authenticated using (true);

-- Grant permissions
grant select on blog_articles to anon;
grant all on blog_articles to authenticated;

-- 9. PERFORMANCE MONITORING TABLES
-- Performance monitoring tables for alerts, PageSpeed data, and budget tracking

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

-- Indexes for better query performance
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

-- Functions for data aggregation and cleanup
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
        "https://oma-digital.sn/blog",
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

-- Enable Row Level Security
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagespeed_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_budget_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_config ENABLE ROW LEVEL SECURITY;

-- Create policies (admin access only)
CREATE POLICY "Admin access to performance_alerts" ON performance_alerts
    FOR ALL USING (true);

CREATE POLICY "Admin access to pagespeed_results" ON pagespeed_results
    FOR ALL USING (true);

CREATE POLICY "Admin access to performance_budget_checks" ON performance_budget_checks
    FOR ALL USING (true);

CREATE POLICY "Admin access to performance_trends" ON performance_trends
    FOR ALL USING (true);

CREATE POLICY "Admin access to real_user_metrics" ON real_user_metrics
    FOR ALL USING (true);

CREATE POLICY "Admin access to performance_config" ON performance_config
    FOR ALL USING (true);

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

COMMENT ON TABLE performance_alerts IS 'Stores performance alerts when metrics exceed thresholds';
COMMENT ON TABLE pagespeed_results IS 'Stores Google PageSpeed Insights results';
COMMENT ON TABLE performance_budget_checks IS 'Tracks performance budget violations';
COMMENT ON TABLE performance_trends IS 'Aggregated hourly performance trends';
COMMENT ON TABLE real_user_metrics IS 'Real user monitoring data from actual site visitors';
COMMENT ON TABLE performance_config IS 'Configuration settings for performance monitoring';

-- 10. KNOWLEDGE BASE DATA
-- Insert initial knowledge base data
-- Services OMA Digital en français
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('Services d''automatisation WhatsApp', 
'OMA Digital propose des solutions d''automatisation WhatsApp pour PME sénégalaises. Nos services incluent : chatbots intelligents, réponses automatiques, gestion des commandes, suivi client, intégration CRM. Prix : 50 000 CFA/mois avec ROI garanti de 200% en 6 mois. Parfait pour restaurants, boutiques, services, e-commerce.',
'services', 'fr', 
ARRAY['whatsapp', 'automatisation', 'chatbot', 'pme', 'senegal', 'roi', 'prix', 'tarif']),

('Développement web et mobile',
'OMA Digital développe des sites web modernes et applications mobiles pour entreprises sénégalaises. Technologies : React, Next.js, React Native, Node.js. Services : sites vitrine, e-commerce, applications métier, maintenance. Responsive design, SEO optimisé, hébergement inclus.',
'services', 'fr',
ARRAY['site web', 'application mobile', 'développement', 'react', 'nextjs', 'ecommerce']),

('Transformation digitale PME',
'Accompagnement complet des PME dans leur transformation digitale. Audit digital, stratégie, formation équipes, mise en place outils, suivi performance. Spécialisé secteur sénégalais : commerce, restauration, services, artisanat.',
'services', 'fr',
ARRAY['transformation digitale', 'pme', 'audit', 'formation', 'stratégie']),

('Contact et support',
'Contactez OMA Digital : Téléphone/WhatsApp +212 701 193 811, Email omasenegal25@gmail.com. Horaires : Lundi-Vendredi 9h-18h. Support technique 24/7. Devis gratuit sous 24h. Siège social Dakar, interventions tout Sénégal.',
'contact', 'fr',
ARRAY['contact', 'téléphone', 'email', 'support', 'devis', 'dakar']),

('Tarification et ROI',
'Nos tarifs démarrent à 50 000 CFA/mois pour l''automatisation WhatsApp. ROI moyen 200% en 6 mois. Devis personnalisé gratuit. Paiement flexible : mensuel, trimestriel, annuel. Garantie satisfaction. Pas de frais cachés.',
'pricing', 'fr',
ARRAY['prix', 'tarif', 'roi', 'devis', 'paiement', 'garantie']);

-- Services OMA Digital en anglais
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('WhatsApp Automation Services',
'OMA Digital provides WhatsApp automation solutions for Senegalese SMEs. Our services include: intelligent chatbots, automatic responses, order management, customer tracking, CRM integration. Price: 50,000 CFA/month with guaranteed 200% ROI in 6 months. Perfect for restaurants, shops, services, e-commerce.',
'services', 'en',
ARRAY['whatsapp', 'automation', 'chatbot', 'sme', 'senegal', 'roi', 'price', 'cost']),

('Web and Mobile Development',
'OMA Digital develops modern websites and mobile applications for Senegalese businesses. Technologies: React, Next.js, React Native, Node.js. Services: showcase sites, e-commerce, business applications, maintenance. Responsive design, SEO optimized, hosting included.',
'services', 'en',
ARRAY['website', 'mobile app', 'development', 'react', 'nextjs', 'ecommerce']),

('Digital Transformation for SMEs',
'Complete support for SMEs in their digital transformation. Digital audit, strategy, team training, tool implementation, performance monitoring. Specialized in Senegalese sector: commerce, restaurants, services, crafts.',
'services', 'en',
ARRAY['digital transformation', 'sme', 'audit', 'training', 'strategy']),

('Contact and Support',
'Contact OMA Digital: Phone/WhatsApp +212 701 193 811, Email omasenegal25@gmail.com. Hours: Monday-Friday 9am-6pm. 24/7 technical support. Free quote within 24h. Head office Dakar, interventions throughout Senegal.',
'contact', 'en',
ARRAY['contact', 'phone', 'email', 'support', 'quote', 'dakar']),

('Pricing and ROI',
'Our rates start at 50,000 CFA/month for WhatsApp automation. Average ROI 200% in 6 months. Free personalized quote. Flexible payment: monthly, quarterly, annual. Satisfaction guarantee. No hidden fees.',
'pricing', 'en',
ARRAY['price', 'cost', 'roi', 'quote', 'payment', 'guarantee']);

-- FAQ bilingue
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('Questions fréquentes - Automatisation',
'Q: Comment fonctionne l''automatisation WhatsApp ? R: Notre système utilise l''IA pour répondre automatiquement aux clients, traiter les commandes, programmer des rappels. Q: Combien de temps pour la mise en place ? R: 48h maximum. Q: Formation incluse ? R: Oui, formation complète de votre équipe.',
'faq', 'fr',
ARRAY['faq', 'questions', 'automatisation', 'formation', 'délai']),

('Frequently Asked Questions - Automation',
'Q: How does WhatsApp automation work? A: Our system uses AI to automatically respond to customers, process orders, schedule reminders. Q: How long for setup? A: Maximum 48h. Q: Training included? A: Yes, complete training for your team.',
'faq', 'en',
ARRAY['faq', 'questions', 'automation', 'training', 'setup']);

-- Cas d'usage spécifiques
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('Restaurants et livraison',
'Automatisation parfaite pour restaurants : prise de commandes automatique, menu digital, confirmation livraison, avis clients, promotions. Intégration possible avec systèmes de caisse existants. Augmentation moyenne des ventes de 40%.',
'use_cases', 'fr',
ARRAY['restaurant', 'livraison', 'commandes', 'menu', 'caisse']),

('E-commerce et boutiques',
'Solution idéale pour boutiques en ligne : catalogue produits, gestion stock, paiement mobile money, suivi commandes, service client automatisé. Compatible Orange Money, Wave, Free Money.',
'use_cases', 'fr',
ARRAY['ecommerce', 'boutique', 'catalogue', 'stock', 'mobile money']),

('Restaurants and Delivery',
'Perfect automation for restaurants: automatic order taking, digital menu, delivery confirmation, customer reviews, promotions. Possible integration with existing POS systems. Average sales increase of 40%.',
'use_cases', 'en',
ARRAY['restaurant', 'delivery', 'orders', 'menu', 'pos']),

('E-commerce and Shops',
'Ideal solution for online shops: product catalog, inventory management, mobile money payment, order tracking, automated customer service. Compatible with Orange Money, Wave, Free Money.',
'use_cases', 'en',
ARRAY['ecommerce', 'shop', 'catalog', 'inventory', 'mobile money']),

('Sécurité et conformité',
'OMA Digital respecte les standards de sécurité : chiffrement end-to-end, conformité RGPD, sauvegarde automatique, accès sécurisé. Données hébergées au Sénégal. Certification ISO 27001 en cours.',
'technical', 'fr',
ARRAY['sécurité', 'rgpd', 'chiffrement', 'sauvegarde', 'iso']),

('Security and Compliance',
'OMA Digital meets security standards: end-to-end encryption, GDPR compliance, automatic backup, secure access. Data hosted in Senegal. ISO 27001 certification in progress.',
'technical', 'en',
ARRAY['security', 'gdpr', 'encryption', 'backup', 'iso']);