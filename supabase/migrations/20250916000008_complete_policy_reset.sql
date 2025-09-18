-- Complete policy reset to eliminate all circular references
-- This migration drops all policies and recreates them with direct JWT checks only

DO $$ 
DECLARE
  table_name_var TEXT;
BEGIN
  -- List of all tables that might have policies
  FOR table_name_var IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
      'admin_users', 'conversations', 'messages', 'knowledge_base', 'user_intents', 
      'bot_responses', 'chatbot_interactions', 'quotes', 'blog_articles', 'analytics_events',
      'cta_actions', 'cta_tracking', 'cta_conversions', 'ab_test_results', 'performance_alerts',
      'pagespeed_results', 'performance_budget_checks', 'performance_trends', 'real_user_metrics',
      'performance_config', 'visitor_sessions', 'page_views', 'article_read_tracking', 'user_behavior_events',
      'user_roles'
    )
  LOOP
    -- Drop all existing policies on each table
    EXECUTE format('DROP POLICY IF EXISTS "Allow admin access to %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow admin full access to %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public access to %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow selects for admins" ON %I', table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow select own roles" ON %I', table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow admin writes" ON %I', table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public insert to %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow select own %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow insert to %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Admin access to %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public reads for published %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read active %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read published %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow inserts for %I" ON %I', table_name_var, table_name_var);
    EXECUTE format('DROP POLICY IF EXISTS "Allow updates for admins" ON %I', table_name_var);
    
    -- For admin_users table, create simple non-recursive policies
    IF table_name_var = 'admin_users' THEN
      EXECUTE format('CREATE POLICY "Admin full access to %I" ON %I FOR ALL TO authenticated USING ((auth.jwt() ->> ''role'') = ''admin'')', table_name_var, table_name_var);
      EXECUTE format('CREATE POLICY "Admin read access to %I" ON %I FOR SELECT TO authenticated USING ((auth.jwt() ->> ''role'') = ''admin'' OR id = auth.uid())', table_name_var, table_name_var);
    
    -- For conversations table
    ELSIF table_name_var = 'conversations' THEN
      EXECUTE format('CREATE POLICY "Public insert to %I" ON %I FOR INSERT WITH CHECK (true)', table_name_var, table_name_var);
      EXECUTE format('CREATE POLICY "Select own %I" ON %I FOR SELECT USING (user_id = auth.uid() OR session_id = current_setting(''request.headers'', true)::json->>''x-session-id'')', table_name_var, table_name_var);
      EXECUTE format('CREATE POLICY "Admin full access to %I" ON %I FOR ALL TO authenticated USING ((auth.jwt() ->> ''role'') = ''admin'')', table_name_var, table_name_var);
    
    -- For messages table
    ELSIF table_name_var = 'messages' THEN
      EXECUTE format('CREATE POLICY "Public insert to %I" ON %I FOR INSERT WITH CHECK (true)', table_name_var, table_name_var);
      EXECUTE format('CREATE POLICY "Admin full access to %I" ON %I FOR ALL TO authenticated USING ((auth.jwt() ->> ''role'') = ''admin'')', table_name_var, table_name_var);
    
    -- For other tables that need admin access
    ELSIF table_name_var IN (
      'knowledge_base', 'user_intents', 'bot_responses', 'chatbot_interactions', 'quotes', 
      'blog_articles', 'analytics_events', 'cta_actions', 'cta_tracking', 'cta_conversions', 
      'ab_test_results', 'performance_alerts', 'pagespeed_results', 'performance_budget_checks', 
      'performance_trends', 'real_user_metrics', 'performance_config', 'visitor_sessions', 
      'page_views', 'article_read_tracking', 'user_behavior_events'
    ) THEN
      EXECUTE format('CREATE POLICY "Admin full access to %I" ON %I FOR ALL TO authenticated USING ((auth.jwt() ->> ''role'') = ''admin'')', table_name_var, table_name_var);
    
    -- For user_roles table
    ELSIF table_name_var = 'user_roles' THEN
      EXECUTE format('CREATE POLICY "Select own %I" ON %I FOR SELECT USING ((auth.jwt() ->> ''role'') = ''admin'' OR user_id = auth.uid())', table_name_var, table_name_var);
      EXECUTE format('CREATE POLICY "Admin full access to %I" ON %I FOR ALL TO authenticated USING ((auth.jwt() ->> ''role'') = ''admin'')', table_name_var, table_name_var);
    END IF;
  END LOOP;
  
  -- Drop the is_admin_user function if it still exists
  DROP FUNCTION IF EXISTS is_admin_user();
END $$;