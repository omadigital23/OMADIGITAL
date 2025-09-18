-- Create website analytics tables for visitor/session tracking and article view tracking

-- Table for visitor sessions
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  visitor_id UUID, -- For identified visitors
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

-- Table for article reading tracking
CREATE TABLE IF NOT EXISTS article_read_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  article_id UUID REFERENCES blog_articles(id) ON DELETE CASCADE,
  article_slug TEXT NOT NULL,
  start_reading_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_reading_time TIMESTAMPTZ,
  reading_duration INTERVAL GENERATED ALWAYS AS (end_reading_time - start_reading_time) STORED,
  scroll_progress INTEGER, -- Percentage of article read
  read_completion NUMERIC(3,2) CHECK (read_completion >= 0 AND read_completion <= 1),
  is_completed BOOLEAN DEFAULT FALSE, -- Considered completed if read_completion >= 0.8
  engagement_score NUMERIC(3,2) CHECK (engagement_score >= 0 AND engagement_score <= 1),
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

-- Indexes for better query performance
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

CREATE INDEX IF NOT EXISTS idx_article_read_tracking_session_id ON article_read_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_article_read_tracking_article_id ON article_read_tracking(article_id);
CREATE INDEX IF NOT EXISTS idx_article_read_tracking_article_slug ON article_read_tracking(article_slug);
CREATE INDEX IF NOT EXISTS idx_article_read_tracking_start_reading_time ON article_read_tracking(start_reading_time);
CREATE INDEX IF NOT EXISTS idx_article_read_tracking_read_completion ON article_read_tracking(read_completion);

CREATE INDEX IF NOT EXISTS idx_user_behavior_events_session_id ON user_behavior_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_event_type ON user_behavior_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_page_url ON user_behavior_events(page_url);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_timestamp ON user_behavior_events(timestamp);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_time_device ON visitor_sessions(start_time, device_type);
CREATE INDEX IF NOT EXISTS idx_page_views_session_page ON page_views(session_id, page_url);
CREATE INDEX IF NOT EXISTS idx_article_read_tracking_session_article ON article_read_tracking(session_id, article_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_events_session_event ON user_behavior_events(session_id, event_type);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_visitor_sessions_updated_at 
    BEFORE UPDATE ON visitor_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_read_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_events ENABLE ROW LEVEL SECURITY;

-- Allow inserts for everyone (analytics data collection)
CREATE POLICY "Allow inserts for analytics data" ON visitor_sessions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow inserts for page views" ON page_views 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow inserts for article tracking" ON article_read_tracking 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow inserts for behavior events" ON user_behavior_events 
  FOR INSERT WITH CHECK (true);

-- Allow selects for admins only
CREATE POLICY "Allow admin access to visitor_sessions" ON visitor_sessions 
  FOR SELECT TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

CREATE POLICY "Allow admin access to page_views" ON page_views 
  FOR SELECT TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

CREATE POLICY "Allow admin access to article_read_tracking" ON article_read_tracking 
  FOR SELECT TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

CREATE POLICY "Allow admin access to user_behavior_events" ON user_behavior_events 
  FOR SELECT TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Grant permissions
GRANT INSERT ON visitor_sessions TO anon;
GRANT INSERT ON page_views TO anon;
GRANT INSERT ON article_read_tracking TO anon;
GRANT INSERT ON user_behavior_events TO anon;

GRANT SELECT ON visitor_sessions TO authenticated;
GRANT SELECT ON page_views TO authenticated;
GRANT SELECT ON article_read_tracking TO authenticated;
GRANT SELECT ON user_behavior_events TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE visitor_sessions IS 'Tracks visitor sessions with detailed information about device, location, and behavior';
COMMENT ON TABLE page_views IS 'Tracks individual page views with time spent and engagement metrics';
COMMENT ON TABLE article_read_tracking IS 'Tracks article reading behavior including time spent and completion rates';
COMMENT ON TABLE user_behavior_events IS 'Tracks specific user interactions like clicks, scrolls, and form submissions';