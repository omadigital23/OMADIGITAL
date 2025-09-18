-- Row Level Security Policies for OMA Digital Database - Final Version
-- This file contains all the RLS policies for the tables

-- Chatbot tables policies
CREATE POLICY "Allow public insert to conversations" ON conversations 
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Select own conversations" ON conversations 
  FOR SELECT USING (
    user_id = auth.uid() OR 
    session_id = current_setting('request.headers', true)::json->>'x-session-id'
  );
  
CREATE POLICY "Admin full access to conversations" ON conversations 
  FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

CREATE POLICY "Allow public insert to messages" ON messages 
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Admin full access to messages" ON messages 
  FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

CREATE POLICY "Allow public read access to knowledge_base" ON knowledge_base 
  FOR SELECT USING (is_active = true);
  
CREATE POLICY "Admin full access to knowledge_base" ON knowledge_base 
  FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

CREATE POLICY "Allow public access to user_intents" ON user_intents 
  FOR ALL USING (true);
  
CREATE POLICY "Admin full access to user_intents" ON user_intents 
  FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

CREATE POLICY "Allow public access to bot_responses" ON bot_responses 
  FOR ALL USING (true);
  
CREATE POLICY "Admin full access to bot_responses" ON bot_responses 
  FOR ALL TO authenticated USING (
    (auth.jwt() ->> 'role') = 'admin'
  );

-- Chatbot interactions policies
CREATE POLICY "Allow inserts for chatbot interactions" ON chatbot_interactions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow selects for admins" ON chatbot_interactions 
  FOR SELECT USING (
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

CREATE POLICY "Allow updates for admins" ON chatbot_interactions 
  FOR UPDATE USING (
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Quotes table policies
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

-- Blog articles policies
CREATE POLICY "Allow public reads for published articles" ON blog_articles 
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow admin writes" ON blog_articles 
  FOR ALL TO authenticated USING (true);

-- Admin users policies
CREATE POLICY "Allow admin access to admin_users" ON admin_users 
FOR ALL USING (
  COALESCE(auth.jwt() ->> 'role', '') = 'admin' OR
  id = auth.uid()
);

-- User roles policies
CREATE POLICY "Allow selects for admins" ON user_roles 
FOR SELECT USING (
  COALESCE(auth.jwt() ->> 'role', '') = 'admin' OR
  user_id = auth.uid()
);

CREATE POLICY "Allow admin writes" ON user_roles 
FOR ALL USING (
  COALESCE(auth.jwt() ->> 'role', '') = 'admin'
);

-- CTA system policies
CREATE POLICY "Allow public read access to active CTAs" ON cta_actions 
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin full access to CTAs" ON cta_actions 
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow public insert to CTA tracking" ON cta_tracking 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read CTA tracking" ON cta_tracking 
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow public insert to CTA conversions" ON cta_conversions 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read CTA conversions" ON cta_conversions 
    FOR SELECT TO authenticated USING (true);

-- Analytics tables policies
CREATE POLICY "Allow inserts for analytics data" ON visitor_sessions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow inserts for page views" ON page_views 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow inserts for article tracking" ON article_read_tracking 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow inserts for behavior events" ON user_behavior_events 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin access to visitor_sessions" ON visitor_sessions 
  FOR SELECT TO authenticated USING (
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

CREATE POLICY "Allow admin access to page_views" ON page_views 
  FOR SELECT TO authenticated USING (
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

CREATE POLICY "Allow admin access to article_read_tracking" ON article_read_tracking 
  FOR SELECT TO authenticated USING (
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

CREATE POLICY "Allow admin access to user_behavior_events" ON user_behavior_events 
  FOR SELECT TO authenticated USING (
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Performance monitoring policies
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

-- Grant permissions
GRANT INSERT ON conversations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;

GRANT INSERT ON messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;

GRANT SELECT ON knowledge_base TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge_base TO authenticated;

GRANT INSERT ON user_intents TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_intents TO authenticated;

GRANT INSERT ON bot_responses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON bot_responses TO authenticated;

GRANT INSERT ON chatbot_interactions TO anon;
GRANT SELECT, UPDATE ON chatbot_interactions TO authenticated;

GRANT INSERT ON quotes TO anon;
GRANT SELECT, UPDATE ON quotes TO authenticated;

GRANT SELECT ON blog_articles TO anon;
GRANT ALL ON blog_articles TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON user_roles TO authenticated;

GRANT SELECT ON cta_actions TO anon;
GRANT ALL ON cta_actions TO authenticated;

GRANT INSERT ON cta_tracking TO anon;
GRANT SELECT ON cta_tracking TO authenticated;

GRANT INSERT ON cta_conversions TO anon;
GRANT SELECT ON cta_conversions TO authenticated;

GRANT INSERT ON visitor_sessions TO anon;
GRANT INSERT ON page_views TO anon;
GRANT INSERT ON article_read_tracking TO anon;
GRANT INSERT ON user_behavior_events TO anon;

GRANT SELECT ON visitor_sessions TO authenticated;
GRANT SELECT ON page_views TO authenticated;
GRANT SELECT ON article_read_tracking TO authenticated;
GRANT SELECT ON user_behavior_events TO authenticated;

GRANT ALL ON performance_alerts TO authenticated;
GRANT ALL ON pagespeed_results TO authenticated;
GRANT ALL ON performance_budget_checks TO authenticated;
GRANT ALL ON performance_trends TO authenticated;
GRANT ALL ON real_user_metrics TO authenticated;
GRANT ALL ON performance_config TO authenticated;