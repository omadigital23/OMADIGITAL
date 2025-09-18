-- ALL REQUIRED TABLES FOR OMA DIGITAL PROJECT
-- This file contains all the SQL statements to create the required tables for your Supabase database

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Performance monitoring tables
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

-- 2. Blog management tables
-- Blog articles table
CREATE TABLE IF NOT EXISTS blog_articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Intelligence Artificielle',
    tags TEXT[] DEFAULT '{}',
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Débutant' CHECK (difficulty IN ('Débutant', 'Intermédiaire', 'Avancé')),
    estimated_roi VARCHAR(20) DEFAULT '100%',
    image_url VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    featured BOOLEAN DEFAULT FALSE,
    trending BOOLEAN DEFAULT FALSE,
    read_time INTEGER DEFAULT 5, -- in minutes
    publish_date TIMESTAMPTZ,
    author_id VARCHAR(255) NOT NULL,
    seo_title VARCHAR(500),
    seo_description TEXT,
    seo_keywords TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog article statistics table
CREATE TABLE IF NOT EXISTS blog_article_stats (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    read_completions INTEGER DEFAULT 0,
    avg_read_time INTEGER DEFAULT 0, -- in seconds
    bounce_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(article_id)
);

-- Blog comments table
CREATE TABLE IF NOT EXISTS blog_comments (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES blog_comments(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_website VARCHAR(500),
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'spam', 'deleted')),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog categories table for better organization
CREATE TABLE IF NOT EXISTS blog_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#F97316', -- Orange color
    icon VARCHAR(50),
    article_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog tags table
CREATE TABLE IF NOT EXISTS blog_tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    article_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog article views tracking for analytics
CREATE TABLE IF NOT EXISTS blog_article_views (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
    visitor_id VARCHAR(255), -- Session or user ID
    ip_address INET,
    user_agent TEXT,
    referer VARCHAR(1000),
    read_time INTEGER DEFAULT 0, -- seconds spent reading
    scroll_depth INTEGER DEFAULT 0, -- percentage
    device_type VARCHAR(20), -- mobile, tablet, desktop
    country VARCHAR(2), -- ISO country code
    city VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Blog newsletters/subscribers table
CREATE TABLE IF NOT EXISTS blog_subscribers (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    source VARCHAR(100), -- newsletter_popup, footer, article_cta
    interests TEXT[], -- categories they're interested in
    confirmed BOOLEAN DEFAULT FALSE,
    confirmation_token VARCHAR(255),
    unsubscribe_token VARCHAR(255) UNIQUE,
    last_email_sent TIMESTAMPTZ,
    subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ
);

-- Blog SEO tracking
CREATE TABLE IF NOT EXISTS blog_seo_data (
    id BIGSERIAL PRIMARY KEY,
    article_id BIGINT NOT NULL REFERENCES blog_articles(id) ON DELETE CASCADE,
    search_impressions INTEGER DEFAULT 0,
    search_clicks INTEGER DEFAULT 0,
    avg_search_position DECIMAL(5,2) DEFAULT 0.0,
    top_keywords TEXT[],
    social_shares JSONB DEFAULT '{}', -- {twitter: 10, facebook: 5, linkedin: 3}
    backlinks_count INTEGER DEFAULT 0,
    domain_authority INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(article_id)
);

-- 3. A/B Testing tables
CREATE TABLE IF NOT EXISTS ab_test_results (
  id uuid default gen_random_uuid() primary key,
  test_name text not null,
  variant text not null,
  conversion boolean not null default false,
  user_id uuid,
  session_id text,
  timestamp timestamptz not null default now(),
  metadata jsonb
);

-- 4. Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
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

-- 5. Web vitals table
CREATE TABLE IF NOT EXISTS web_vitals (
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

-- 6. Chatbot tables
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

-- 7. Quotes table
CREATE TABLE IF NOT EXISTS quotes (
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

-- 8. User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
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

-- Blog management indexes
CREATE INDEX IF NOT EXISTS idx_blog_articles_status ON blog_articles(status);
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON blog_articles(category);
CREATE INDEX IF NOT EXISTS idx_blog_articles_featured ON blog_articles(featured);
CREATE INDEX IF NOT EXISTS idx_blog_articles_trending ON blog_articles(trending);
CREATE INDEX IF NOT EXISTS idx_blog_articles_publish_date ON blog_articles(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_created_at ON blog_articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_tags ON blog_articles USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_blog_comments_article_id ON blog_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON blog_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_blog_article_views_article_id ON blog_article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_blog_article_views_created_at ON blog_article_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_article_views_visitor_id ON blog_article_views(visitor_id);

CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_status ON blog_subscribers(status);

-- Full-text search index for articles
CREATE INDEX IF NOT EXISTS idx_blog_articles_search ON blog_articles USING GIN(
    to_tsvector('french', coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(content, ''))
);

-- Chatbot indexes
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

-- A/B Testing indexes
CREATE INDEX IF NOT EXISTS idx_ab_test_results_test_name ON ab_test_results(test_name);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_variant ON ab_test_results(variant);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_conversion ON ab_test_results(conversion);
CREATE INDEX IF NOT EXISTS idx_ab_test_results_timestamp ON ab_test_results(timestamp);

-- Analytics events indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);

-- Web vitals indexes
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_rating ON web_vitals(metric_rating);
CREATE INDEX IF NOT EXISTS idx_web_vitals_created_at ON web_vitals(created_at);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_url ON web_vitals(page_url);

-- Quotes indexes
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_service ON quotes(service);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Functions for data aggregation and maintenance
-- Function for performance trends aggregation
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

-- Function to clean up old performance data
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

-- Functions for maintaining blog statistics
CREATE OR REPLACE FUNCTION update_blog_article_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update article count in categories
    IF TG_OP = 'INSERT' THEN
        UPDATE blog_categories 
        SET article_count = article_count + 1 
        WHERE name = NEW.category;
        
        -- Update tag counts
        IF NEW.tags IS NOT NULL THEN
            INSERT INTO blog_tags (name, slug, article_count)
            SELECT tag, lower(regexp_replace(tag, '[^a-zA-Z0-9]+', '-', 'g')), 1
            FROM unnest(NEW.tags) AS tag
            ON CONFLICT (name) DO UPDATE SET article_count = blog_tags.article_count + 1;
        END IF;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        -- Update category counts if category changed
        IF OLD.category != NEW.category THEN
            UPDATE blog_categories 
            SET article_count = article_count - 1 
            WHERE name = OLD.category;
            
            UPDATE blog_categories 
            SET article_count = article_count + 1 
            WHERE name = NEW.category;
        END IF;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE blog_categories 
        SET article_count = article_count - 1 
        WHERE name = OLD.category;
        
        -- Update tag counts
        IF OLD.tags IS NOT NULL THEN
            UPDATE blog_tags 
            SET article_count = article_count - 1
            WHERE name = ANY(OLD.tags);
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update article view statistics
CREATE OR REPLACE FUNCTION update_article_view_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the article stats
    INSERT INTO blog_article_stats (article_id, views, avg_read_time)
    VALUES (NEW.article_id, 1, COALESCE(NEW.read_time, 0))
    ON CONFLICT (article_id) 
    DO UPDATE SET 
        views = blog_article_stats.views + 1,
        avg_read_time = (blog_article_stats.avg_read_time * blog_article_stats.views + COALESCE(NEW.read_time, 0)) / (blog_article_stats.views + 1),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function for blog search with relevance scoring
CREATE OR REPLACE FUNCTION search_blog_articles(
    search_query TEXT,
    category_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    title VARCHAR(500),
    excerpt TEXT,
    category VARCHAR(100),
    slug VARCHAR(500),
    image_url VARCHAR(1000),
    publish_date TIMESTAMPTZ,
    read_time INTEGER,
    tags TEXT[],
    featured BOOLEAN,
    trending BOOLEAN,
    views INTEGER,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.category,
        a.slug,
        a.image_url,
        a.publish_date,
        a.read_time,
        a.tags,
        a.featured,
        a.trending,
        COALESCE(s.views, 0) as views,
        ts_rank(
            to_tsvector('french', a.title || ' ' || a.excerpt || ' ' || a.content),
            plainto_tsquery('french', search_query)
        ) as relevance
    FROM blog_articles a
    LEFT JOIN blog_article_stats s ON a.id = s.article_id
    WHERE 
        a.status = 'published'
        AND (category_filter IS NULL OR a.category = category_filter)
        AND to_tsvector('french', a.title || ' ' || a.excerpt || ' ' || a.content) @@ plainto_tsquery('french', search_query)
    ORDER BY relevance DESC, a.publish_date DESC
    LIMIT limit_count OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Triggers
-- Blog article stats trigger
CREATE TRIGGER blog_article_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON blog_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_article_stats();

-- Blog view stats trigger
CREATE TRIGGER blog_view_stats_trigger
    AFTER INSERT ON blog_article_views
    FOR EACH ROW
    EXECUTE FUNCTION update_article_view_stats();

-- Update timestamp triggers
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_articles_updated_at BEFORE UPDATE ON blog_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_alerts_updated_at BEFORE UPDATE ON performance_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_config_updated_at BEFORE UPDATE ON performance_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
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

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, color, icon, sort_order) VALUES
('Intelligence Artificielle', 'intelligence-artificielle', 'Articles sur l''IA, chatbots et automatisation intelligente', '#F97316', '🤖', 1),
('Développement Web', 'developpement-web', 'Sites web, applications et technologies modernes', '#3B82F6', '💻', 2),
('Automatisation', 'automatisation', 'Processus automatisés et optimisation business', '#10B981', '⚡', 3),
('Stratégie Digitale', 'strategie-digitale', 'Transformation numérique et stratégie d''entreprise', '#8B5CF6', '📈', 4),
('Analytics', 'analytics', 'Données, mesures et insights business', '#EF4444', '📊', 5),
('Cybersécurité', 'cybersecurite', 'Sécurité informatique et protection des données', '#6B7280', '🔒', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert default knowledge base data
-- Services OMA Digital en français
INSERT INTO knowledge_base (title, content, category, language, keywords) VALUES
('Services d''automatisation WhatsApp', 
'OMA Digital propose des solutions d''automatisation WhatsApp éprouvées spécialement conçues pour les entreprises sénégalaises. Transformez votre service client et boostez vos ventes avec des réponses automatisées 24/7. Investissement : Seulement 50 000 CFA/mois. ROI Garanti : +200% d''engagement client en 6 mois. Fonctionnalités : Service client automatisé 24/7 qui ne dort jamais, Réponses instantanées aux questions fréquentes, Traitement automatique des commandes et collecte de paiement, Qualification des prospects et séquences de suivi intelligentes, Automatisation complète du tunnel de vente, Tableau de bord analytique en temps réel, Intégration des moyens de paiement locaux (Orange Money, Wave, Free Money). Processus de mise en place : 1. Contactez-nous dès aujourd''hui : 📞 +212 701 193 811, 2. Consultation gratuite & analyse des besoins (30 minutes), 3. Installation personnalisée sous 48 heures, 4. Formation de votre équipe & support continu. Parfait pour : Restaurants prenant les commandes via WhatsApp, Boutiques gérant les demandes clients, Prestataires planifiant les rendez-vous, Entreprises e-commerce traitant les paiements. Offre limitée : Les 10 premiers clients bénéficient d''1 mois gratuit !',
'services', 'fr', 
ARRAY['whatsapp', 'automatisation', 'chatbot', 'pme', 'senegal', 'roi', 'prix', 'tarif', '24/7', 'orange money', 'wave', 'free money']),

('Développement web et mobile',
'Nous créons des sites web et applications mobiles professionnels qui capturent l''essence de votre marque et convertissent les visiteurs en clients. Nos solutions sont optimisées pour le marché sénégalais avec un SEO local, un design mobile-first et des temps de chargement rapides. Technologies : React, Next.js, React Native, Flutter. Fonctionnalités : Design responsive, Optimisation SEO pour Dakar/Sénégal, Intégration des moyens de paiement locaux (Orange Money, Wave, Free Money), Formulaires de contact, Intégration réseaux sociaux, Analytics, Fonctionnalité hors-ligne pour applications mobiles. Tarification : À partir de 200 000 CFA pour les sites web basiques, À partir de 500 000 CFA pour les applications mobiles. Consultation gratuite : +212 701 193 811.',
'services', 'fr',
ARRAY['site web', 'application mobile', 'développement', 'react', 'nextjs', 'react native', 'flutter', 'ecommerce', 'seo', 'mobile']),

('Transformation digitale PME',
'Accompagnement complet des PME dans leur transformation digitale. Notre approche : 1. Audit digital de vos opérations actuelles, 2. Feuille de route de transformation personnalisée, 3. Mise en œuvre des solutions recommandées, 4. Support continu et optimisation. Services inclus : Conseil en stratégie digitale, Optimisation des processus métier, Formation numérique des employés, Mise en œuvre d''outils digitaux, Surveillance et reporting des performances. Spécialisé pour le secteur sénégalais : commerce, restauration, services, artisanat. Contactez : +212 701 193 811 pour une consultation gratuite.',
'services', 'fr',
ARRAY['transformation digitale', 'pme', 'audit', 'formation', 'stratégie', 'consulting']),

('Développement de Chatbots',
'Nous créons des chatbots intelligents capables de gérer les demandes clients 24/7, qualifier les prospects et même traiter les commandes. Nos chatbots sont disponibles en formats texte et vocal. Fonctionnalités : Traitement du langage naturel, Support multilingue (français et anglais), Intégration avec WhatsApp et les sites web, Qualification de leads et suivi, Capacités de traitement des commandes, Tableau de bord analytique. Tarification : À partir de 50 000 CFA/mois. Contactez : +212 701 193 811 pour une solution de chatbot personnalisée.',
'services', 'fr',
ARRAY['chatbot', 'développement de chatbot', 'ia', 'intelligence artificielle', 'service client', 'qualification de leads']),

('Marketing Digital',
'Campagnes de marketing digital performantes adaptées aux entreprises sénégalaises. Nos services : Gestion des réseaux sociaux (Facebook, Instagram, LinkedIn), Création de contenu attractif, Publicité payante (Facebook Ads, Google Ads), SEO local pour Dakar/Sénégal, Email marketing, Analytics et reporting. Objectifs : Augmenter votre visibilité en ligne, Acquérir de nouveaux clients, Améliorer l''engagement de votre audience, Générer des leads qualifiés. Tarification : À partir de 75 000 CFA/mois. Contactez : +212 701 193 811 pour une stratégie gratuite.',
'services', 'fr',
ARRAY['marketing digital', 'réseaux sociaux', 'seo', 'publicité', 'campagnes', 'leads']),

('Contact et support',
'Contactez OMA Digital : Téléphone/WhatsApp +212 701 193 811, Email omasenegal25@gmail.com. Horaires : Lundi-Vendredi 9h-18h. Support technique 24/7. Devis gratuit sous 24h. Siège social Dakar, Liberté 6. Interventions dans toute la région de Dakar. Temps de réponse garanti : Sous 2 heures en semaine. Support disponible en français et anglais.',
'contact', 'fr',
ARRAY['contact', 'téléphone', 'email', 'support', 'devis', 'dakar', 'whatsapp', 'horaires']),

('Tarification et ROI',
'Nos tarifs démarrent à 50 000 CFA/mois pour l''automatisation WhatsApp avec un ROI garanti de 200% en 6 mois. Détail des services : Automatisation WhatsApp : 50 000 CFA/mois, Sites web : À partir de 200 000 CFA, Applications mobiles : À partir de 500 000 CFA, Chatbots : À partir de 50 000 CFA/mois, Marketing Digital : À partir de 75 000 CFA/mois. Tous nos services incluent : Consultation gratuite, Devis personnalisé sous 24h, Formation de votre équipe, Support technique 6 mois, Surveillance des performances. Options de paiement : Mensuel, trimestriel ou annuel. Garantie satisfaction. Pas de frais cachés.',
'pricing', 'fr',
ARRAY['prix', 'tarif', 'roi', 'devis', 'paiement', 'garantie', 'whatsapp', 'site web', 'application']),

('Questions fréquentes - Automatisation',
'Q: Comment fonctionne l''automatisation WhatsApp ? R: Notre système utilise l''IA pour répondre automatiquement aux clients, traiter les commandes, programmer des rappels. Q: Combien de temps pour la mise en place ? R: 48h maximum. Q: Formation incluse ? R: Oui, formation complète de votre équipe. Q: Quels moyens de paiement acceptez-vous ? R: Orange Money, Wave, Free Money, virement bancaire. Q: Puis-je essayer gratuitement ? R: Oui, première semaine gratuite sans engagement.',
'faq', 'fr',
ARRAY['faq', 'questions', 'automatisation', 'formation', 'délai', 'paiement', 'essai']),

('Cas d''utilisation - Restaurants',
'Automatisation parfaite pour restaurants : prise de commandes automatique via WhatsApp, menu digital interactif, confirmation de livraison en temps réel, collecte d''avis clients, promotions ciblées. Intégration possible avec systèmes de caisse existants. Augmentation moyenne des ventes de 40%. Exemple concret : Un restaurant à Dakar a vu ses commandes WhatsApp passer de 10/jour à 40/jour en 2 semaines.',
'use_cases', 'fr',
ARRAY['restaurant', 'livraison', 'commandes', 'menu', 'caisse', 'ventes']),

('Cas d''utilisation - E-commerce',
'Solution idéale pour boutiques en ligne : catalogue produits interactif, gestion de stock en temps réel, paiement mobile money (Orange Money, Wave, Free Money), suivi des commandes, service client automatisé 24/7. Compatible avec tous les systèmes e-commerce. Réduction moyenne des coûts de service client de 60%.',
'use_cases', 'fr',
ARRAY['ecommerce', 'boutique', 'catalogue', 'stock', 'mobile money', 'service client']),

('Sécurité et conformité',
'OMA Digital respecte les standards de sécurité : chiffrement end-to-end, conformité RGPD, sauvegarde automatique quotidienne, accès sécurisé avec authentification à deux facteurs. Données hébergées au Sénégal chez des partenaires locaux. Certification ISO 27001 en cours. Protection contre les pertes de données et les accès non autorisés.',
'technical', 'fr',
ARRAY['sécurité', 'rgpd', 'chiffrement', 'sauvegarde', 'iso', 'hébergement', 'authentification']),

-- Services OMA Digital en anglais
('WhatsApp Automation Services',
'OMA Digital provides proven WhatsApp automation solutions specifically designed for Senegalese businesses. Transform your customer service and boost sales with 24/7 automated responses. Investment: Only 50,000 CFA/month. Guaranteed ROI: +200% increase in customer engagement within 6 months. Features: 24/7 automated customer service that never sleeps, Instant responses to frequently asked questions, Automatic order processing and payment collection, Lead qualification and smart follow-up sequences, Complete sales funnel automation, Real-time performance analytics dashboard, Integration with local payment methods (Orange Money, Wave, Free Money). Setup process: 1. Contact us today: 📞 +212 701 193 811, 2. Free consultation & needs analysis (30 minutes), 3. Custom setup within 48 hours, 4. Team training & ongoing support. Perfect for: Restaurants taking orders via WhatsApp, Retail shops managing customer inquiries, Service providers scheduling appointments, E-commerce businesses processing payments. Limited time offer: First 10 clients get 1 month free!',
'services', 'en',
ARRAY['whatsapp', 'automation', 'chatbot', 'sme', 'senegal', 'roi', 'price', 'cost', '24/7', 'orange money', 'wave', 'free money']),

('Web and Mobile Development',
'We create professional websites and mobile applications that capture your brand''s essence and convert visitors into customers. Our solutions are optimized for the Senegalese market with local SEO, mobile-first design, and fast loading times. Technologies: React, Next.js, React Native, Flutter. Features: Responsive design, SEO optimization for Dakar/Senegal, Integration with local payment methods (Orange Money, Wave, Free Money), Contact forms, Social media integration, Analytics, Offline functionality for mobile apps. Pricing: From 200,000 CFA for basic websites, From 500,000 CFA for mobile applications. Free consultation: +212 701 193 811.',
'services', 'en',
ARRAY['website', 'mobile app', 'development', 'react', 'nextjs', 'react native', 'flutter', 'ecommerce', 'seo', 'mobile']),

('Digital Transformation for SMEs',
'Complete support for SMEs in their digital transformation. Our approach: 1. Digital audit of your current operations, 2. Custom transformation roadmap, 3. Implementation of recommended solutions, 4. Ongoing support and optimization. Services included: Digital strategy consulting, Business process optimization, Employee digital training, Implementation of digital tools, Performance monitoring and reporting. Specialized for the Senegalese sector: commerce, restaurants, services, crafts. Contact: +212 701 193 811 for a free consultation.',
'services', 'en',
ARRAY['digital transformation', 'sme', 'audit', 'training', 'strategy', 'consulting']),

('Chatbot Development',
'We create intelligent chatbots that can handle customer inquiries 24/7, qualify leads, and even process orders. Our chatbots are available in both text and voice formats. Features: Natural language processing, Multi-language support (French and English), Integration with WhatsApp and websites, Lead qualification and follow-up, Order processing capabilities, Analytics dashboard. Pricing: From 50,000 CFA/month. Contact: +212 701 193 811 for a custom chatbot solution.',
'services', 'en',
ARRAY['chatbot', 'chatbot development', 'ai', 'artificial intelligence', 'customer service', 'lead qualification']),

('Digital Marketing',
'High-performing digital marketing campaigns tailored for Senegalese businesses. Our services: Social media management (Facebook, Instagram, LinkedIn), Attractive content creation, Paid advertising (Facebook Ads, Google Ads), Local SEO for Dakar/Senegal, Email marketing, Analytics and reporting. Objectives: Increase your online visibility, Acquire new customers, Improve audience engagement, Generate qualified leads. Pricing: From 75,000 CFA/month. Contact: +212 701 193 811 for a free strategy session.',
'services', 'en',
ARRAY['digital marketing', 'social media', 'seo', 'advertising', 'campaigns', 'leads']),

('Contact and Support',
'Contact OMA Digital: Phone/WhatsApp +212 701 193 811, Email omasenegal25@gmail.com. Hours: Monday-Friday 9am-6pm. 24/7 technical support. Free quote within 24h. Head office Dakar, Liberté 6. Service available throughout the Dakar region. Guaranteed response time: Within 2 hours on business days. Support available in French and English.',
'contact', 'en',
ARRAY['contact', 'phone', 'email', 'support', 'quote', 'dakar', 'whatsapp', 'hours']),

('Pricing and ROI',
'Our rates start at 50,000 CFA/month for WhatsApp automation with a guaranteed 200% ROI in 6 months. Service details: WhatsApp Automation: 50,000 CFA/month, Websites: From 200,000 CFA, Mobile Apps: From 500,000 CFA, Chatbots: From 50,000 CFA/month, Digital Marketing: From 75,000 CFA/month. All our services include: Free consultation, Personalized quote within 24h, Team training, 6-month technical support, Performance monitoring. Payment options: Monthly, quarterly, or annual. Satisfaction guarantee. No hidden fees.',
'pricing', 'en',
ARRAY['price', 'cost', 'roi', 'quote', 'payment', 'guarantee', 'whatsapp', 'website', 'app']),

('Frequently Asked Questions - Automation',
'Q: How does WhatsApp automation work? A: Our system uses AI to automatically respond to customers, process orders, schedule reminders. Q: How long for setup? A: Maximum 48h. Q: Training included? A: Yes, complete training for your team. Q: What payment methods do you accept? A: Orange Money, Wave, Free Money, bank transfer. Q: Can I try it for free? A: Yes, first week free with no commitment.',
'faq', 'en',
ARRAY['faq', 'questions', 'automation', 'training', 'setup', 'payment', 'trial']),

('Use Cases - Restaurants',
'Perfect automation for restaurants: automatic order taking via WhatsApp, interactive digital menu, real-time delivery confirmation, customer review collection, targeted promotions. Possible integration with existing POS systems. Average sales increase of 40%. Concrete example: A restaurant in Dakar saw their WhatsApp orders increase from 10/day to 40/day in 2 weeks.',
'use_cases', 'en',
ARRAY['restaurant', 'delivery', 'orders', 'menu', 'pos', 'sales']),

('Use Cases - E-commerce',
'Ideal solution for online shops: interactive product catalog, real-time inventory management, mobile money payment (Orange Money, Wave, Free Money), order tracking, 24/7 automated customer service. Compatible with all e-commerce systems. Average reduction of customer service costs by 60%.',
'use_cases', 'en',
ARRAY['ecommerce', 'shop', 'catalog', 'inventory', 'mobile money', 'customer service']),

('Security and Compliance',
'OMA Digital meets security standards: end-to-end encryption, GDPR compliance, daily automatic backup, secure access with two-factor authentication. Data hosted in Senegal with local partners. ISO 27001 certification in progress. Protection against data loss and unauthorized access.',
'technical', 'en',
ARRAY['security', 'gdpr', 'encryption', 'backup', 'iso', 'hosting', 'authentication']);

-- Enable Row Level Security for all tables
ALTER TABLE performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagespeed_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_budget_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_config ENABLE ROW LEVEL SECURITY;

ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_article_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_seo_data ENABLE ROW LEVEL SECURITY;

ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_vitals ENABLE ROW LEVEL SECURITY;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_responses ENABLE ROW LEVEL SECURITY;

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin full access to performance_alerts" ON performance_alerts FOR ALL USING (true);
CREATE POLICY "Admin full access to pagespeed_results" ON pagespeed_results FOR ALL USING (true);
CREATE POLICY "Admin full access to performance_budget_checks" ON performance_budget_checks FOR ALL USING (true);
CREATE POLICY "Admin full access to performance_trends" ON performance_trends FOR ALL USING (true);
CREATE POLICY "Admin full access to real_user_metrics" ON real_user_metrics FOR ALL USING (true);
CREATE POLICY "Admin full access to performance_config" ON performance_config FOR ALL USING (true);

CREATE POLICY "Admin full access to blog_articles" ON blog_articles FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_article_stats" ON blog_article_stats FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_comments" ON blog_comments FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_categories" ON blog_categories FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_tags" ON blog_tags FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_article_views" ON blog_article_views FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_subscribers" ON blog_subscribers FOR ALL USING (true);
CREATE POLICY "Admin full access to blog_seo_data" ON blog_seo_data FOR ALL USING (true);

CREATE POLICY "Allow inserts for analytics" ON ab_test_results 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow selects for admins" ON ab_test_results 
  FOR SELECT USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

CREATE POLICY "Allow inserts for analytics" ON analytics_events 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow selects for admins" ON analytics_events 
  FOR SELECT USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

CREATE POLICY "Allow inserts for analytics" ON web_vitals 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow selects for admins" ON web_vitals 
  FOR SELECT USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

CREATE POLICY "Allow public access to conversations" ON conversations FOR ALL USING (true);
CREATE POLICY "Allow public access to messages" ON messages FOR ALL USING (true);
CREATE POLICY "Allow public read access to knowledge_base" ON knowledge_base FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public access to user_intents" ON user_intents FOR ALL USING (true);
CREATE POLICY "Allow public access to bot_responses" ON bot_responses FOR ALL USING (true);

CREATE POLICY "Allow admin access to conversations" ON conversations FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to messages" ON messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to knowledge_base" ON knowledge_base FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to user_intents" ON user_intents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow admin access to bot_responses" ON bot_responses FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow inserts for contact forms" ON quotes 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow selects for admins" ON quotes 
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );
CREATE POLICY "Allow updates for admins" ON quotes 
  FOR UPDATE USING (
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow selects for admins" ON user_roles 
FOR SELECT USING (
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  COALESCE(auth.jwt() ->> 'role', '') = 'admin' OR
  -- Allow users to see their own roles
  user_id = auth.uid()
);
CREATE POLICY "Allow admin writes" ON user_roles 
FOR ALL USING (
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  COALESCE(auth.jwt() ->> 'role', '') = 'admin'
);

-- Public read access policies
CREATE POLICY "Public read access to published articles" ON blog_articles 
FOR SELECT USING (status = 'published');

CREATE POLICY "Public read access to article stats" ON blog_article_stats 
FOR SELECT USING (true);

CREATE POLICY "Public read access to approved comments" ON blog_comments 
FOR SELECT USING (status = 'approved');

CREATE POLICY "Public read access to categories" ON blog_categories 
FOR SELECT USING (active = true);

CREATE POLICY "Public read access to tags" ON blog_tags 
FOR SELECT USING (true);

-- Grant permissions
GRANT INSERT ON ab_test_results TO anon;
GRANT SELECT ON ab_test_results TO authenticated;

GRANT INSERT ON analytics_events TO anon;
GRANT SELECT ON analytics_events TO authenticated;

GRANT INSERT ON web_vitals TO anon;
GRANT SELECT ON web_vitals TO authenticated;

GRANT INSERT ON quotes TO anon;
GRANT SELECT, UPDATE ON quotes TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;

GRANT SELECT ON blog_articles TO anon;
GRANT ALL ON blog_articles TO authenticated;

-- Create views for dashboards
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

COMMENT ON TABLE blog_articles IS 'Main blog articles storage with full content and metadata';
COMMENT ON TABLE blog_article_stats IS 'Article performance statistics and analytics';
COMMENT ON TABLE blog_comments IS 'User comments and discussions on articles';
COMMENT ON TABLE blog_categories IS 'Blog categories for content organization';
COMMENT ON TABLE blog_tags IS 'Tags for article tagging and search';
COMMENT ON TABLE blog_article_views IS 'Detailed view tracking for analytics';
COMMENT ON TABLE blog_subscribers IS 'Newsletter subscribers and preferences';
COMMENT ON TABLE blog_seo_data IS 'SEO performance tracking and metrics';

COMMENT ON TABLE conversations IS 'Chatbot conversation sessions';
COMMENT ON TABLE messages IS 'Individual messages in chatbot conversations';
COMMENT ON TABLE knowledge_base IS 'Knowledge base for chatbot responses';
COMMENT ON TABLE user_intents IS 'Detected user intents from messages';
COMMENT ON TABLE bot_responses IS 'Chatbot responses with feedback tracking';

COMMENT ON TABLE quotes IS 'Free quote form submissions';
COMMENT ON TABLE user_roles IS 'User roles for admin access control';