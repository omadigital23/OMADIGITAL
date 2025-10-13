-- Implement comprehensive Row Level Security (RLS) policies for all admin tables

-- Enable RLS on all tables if not already enabled
ALTER TABLE IF EXISTS conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bot_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chatbot_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cta_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cta_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cta_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS performance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pagespeed_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS performance_budget_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS performance_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS real_user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS performance_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  RETURN COALESCE(auth.jwt() ->> 'role', '') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conversations table policies
DROP POLICY IF EXISTS "Allow public access to conversations" ON conversations;
DROP POLICY IF EXISTS "Allow admin access to conversations" ON conversations;

CREATE POLICY "Allow public insert to conversations" ON conversations 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select own conversations" ON conversations 
  FOR SELECT USING (user_id = auth.uid() OR session_id = current_setting('request.headers', true)::json->>'x-session-id');

CREATE POLICY "Allow admin full access to conversations" ON conversations 
  FOR ALL TO authenticated USING (is_admin_user());

-- Messages table policies
DROP POLICY IF EXISTS "Allow public access to messages" ON messages;
DROP POLICY IF EXISTS "Allow admin access to messages" ON messages;

CREATE POLICY "Allow insert to messages" ON messages 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select conversation messages" ON messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.user_id = auth.uid() OR c.session_id = current_setting('request.headers', true)::json->>'x-session-id')
    )
  );

CREATE POLICY "Allow admin full access to messages" ON messages 
  FOR ALL TO authenticated USING (is_admin_user());

-- Knowledge base table policies
DROP POLICY IF EXISTS "Allow public read access to knowledge_base" ON knowledge_base;
DROP POLICY IF EXISTS "Allow admin access to knowledge_base" ON knowledge_base;

CREATE POLICY "Allow public read active knowledge" ON knowledge_base 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access to knowledge_base" ON knowledge_base 
  FOR ALL TO authenticated USING (is_admin_user());

-- User intents table policies
DROP POLICY IF EXISTS "Allow public access to user_intents" ON user_intents;
DROP POLICY IF EXISTS "Allow admin access to user_intents" ON user_intents;

CREATE POLICY "Allow insert to user_intents" ON user_intents 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select own intents" ON user_intents 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m 
      WHERE m.id = user_intents.message_id 
      AND EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = m.conversation_id 
        AND (c.user_id = auth.uid() OR c.session_id = current_setting('request.headers', true)::json->>'x-session-id')
      )
    )
  );

CREATE POLICY "Allow admin full access to user_intents" ON user_intents 
  FOR ALL TO authenticated USING (is_admin_user());

-- Bot responses table policies
DROP POLICY IF EXISTS "Allow public access to bot_responses" ON bot_responses;
DROP POLICY IF EXISTS "Allow admin access to bot_responses" ON bot_responses;

CREATE POLICY "Allow insert to bot_responses" ON bot_responses 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select conversation responses" ON bot_responses 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m 
      WHERE m.id = bot_responses.message_id 
      AND EXISTS (
        SELECT 1 FROM conversations c 
        WHERE c.id = m.conversation_id 
        AND (c.user_id = auth.uid() OR c.session_id = current_setting('request.headers', true)::json->>'x-session-id')
      )
    )
  );

CREATE POLICY "Allow admin full access to bot_responses" ON bot_responses 
  FOR ALL TO authenticated USING (is_admin_user());

-- Chatbot interactions table policies
DROP POLICY IF EXISTS "Allow inserts for chatbot interactions" ON chatbot_interactions;
DROP POLICY IF EXISTS "Allow selects for admins" ON chatbot_interactions;
DROP POLICY IF EXISTS "Allow updates for admins" ON chatbot_interactions;

CREATE POLICY "Allow insert to chatbot_interactions" ON chatbot_interactions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to chatbot_interactions" ON chatbot_interactions 
  FOR ALL TO authenticated USING (is_admin_user());

-- Quotes table policies
DROP POLICY IF EXISTS "Allow inserts for contact forms" ON quotes;
DROP POLICY IF EXISTS "Allow selects for admins" ON quotes;
DROP POLICY IF EXISTS "Allow updates for admins" ON quotes;

CREATE POLICY "Allow insert to quotes" ON quotes 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to quotes" ON quotes 
  FOR ALL TO authenticated USING (is_admin_user());

-- Blog articles table policies
DROP POLICY IF EXISTS "Allow public reads for published articles" ON blog_articles;
DROP POLICY IF EXISTS "Allow admin writes" ON blog_articles;

CREATE POLICY "Allow public read published articles" ON blog_articles 
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow admin full access to blog_articles" ON blog_articles 
  FOR ALL TO authenticated USING (is_admin_user());

-- Analytics events table policies
DROP POLICY IF EXISTS "Allow inserts for analytics" ON analytics_events;
DROP POLICY IF EXISTS "Allow selects for admins" ON analytics_events;

CREATE POLICY "Allow insert to analytics_events" ON analytics_events 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to analytics_events" ON analytics_events 
  FOR ALL TO authenticated USING (is_admin_user());

-- CTA actions table policies
DROP POLICY IF EXISTS "Allow public read access to active CTAs" ON cta_actions;
DROP POLICY IF EXISTS "Allow admin full access to CTAs" ON cta_actions;

CREATE POLICY "Allow public read active CTAs" ON cta_actions 
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access to cta_actions" ON cta_actions 
  FOR ALL TO authenticated USING (is_admin_user());

-- CTA tracking table policies
DROP POLICY IF EXISTS "Allow public insert to CTA tracking" ON cta_tracking;
DROP POLICY IF EXISTS "Allow admin read CTA tracking" ON cta_tracking;

CREATE POLICY "Allow insert to cta_tracking" ON cta_tracking 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to cta_tracking" ON cta_tracking 
  FOR ALL TO authenticated USING (is_admin_user());

-- CTA conversions table policies
DROP POLICY IF EXISTS "Allow public insert to CTA conversions" ON cta_conversions;
DROP POLICY IF EXISTS "Allow admin read CTA conversions" ON cta_conversions;

CREATE POLICY "Allow insert to cta_conversions" ON cta_conversions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to cta_conversions" ON cta_conversions 
  FOR ALL TO authenticated USING (is_admin_user());

-- AB test results table policies
DROP POLICY IF EXISTS "Allow inserts for analytics" ON ab_test_results;
DROP POLICY IF EXISTS "Allow selects for admins" ON ab_test_results;

CREATE POLICY "Allow insert to ab_test_results" ON ab_test_results 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to ab_test_results" ON ab_test_results 
  FOR ALL TO authenticated USING (is_admin_user());

-- Performance alerts table policies
DROP POLICY IF EXISTS "Admin access to performance_alerts" ON performance_alerts;

CREATE POLICY "Allow admin full access to performance_alerts" ON performance_alerts 
  FOR ALL TO authenticated USING (is_admin_user());

-- PageSpeed results table policies
DROP POLICY IF EXISTS "Admin access to pagespeed_results" ON pagespeed_results;

CREATE POLICY "Allow admin full access to pagespeed_results" ON pagespeed_results 
  FOR ALL TO authenticated USING (is_admin_user());

-- Performance budget checks table policies
DROP POLICY IF EXISTS "Admin access to performance_budget_checks" ON performance_budget_checks;

CREATE POLICY "Allow admin full access to performance_budget_checks" ON performance_budget_checks 
  FOR ALL TO authenticated USING (is_admin_user());

-- Performance trends table policies
DROP POLICY IF EXISTS "Admin access to performance_trends" ON performance_trends;

CREATE POLICY "Allow admin full access to performance_trends" ON performance_trends 
  FOR ALL TO authenticated USING (is_admin_user());

-- Real user metrics table policies
DROP POLICY IF EXISTS "Admin access to real_user_metrics" ON real_user_metrics;

CREATE POLICY "Allow admin full access to real_user_metrics" ON real_user_metrics 
  FOR ALL TO authenticated USING (is_admin_user());

-- Performance config table policies
DROP POLICY IF EXISTS "Admin access to performance_config" ON performance_config;

CREATE POLICY "Allow admin full access to performance_config" ON performance_config 
  FOR ALL TO authenticated USING (is_admin_user());

-- User roles table policies
DROP POLICY IF EXISTS "Allow selects for admins" ON user_roles;
DROP POLICY IF EXISTS "Allow admin writes" ON user_roles;

CREATE POLICY "Allow select own roles" ON user_roles 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Allow admin full access to user_roles" ON user_roles 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Admin users table policies
DROP POLICY IF EXISTS "Allow admin access to admin_users" ON admin_users;

CREATE POLICY "Allow admin full access to admin_users" ON admin_users 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO anon;