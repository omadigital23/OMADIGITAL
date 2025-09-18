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