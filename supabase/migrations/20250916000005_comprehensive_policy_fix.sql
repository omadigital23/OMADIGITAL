-- Comprehensive policy fix to address "relation does not exist" errors
-- This migration checks if tables exist before applying policies

DO $$ 
BEGIN
  -- Fix for analytics_events table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analytics_events') THEN
    DROP POLICY IF EXISTS "Allow selects for admins" ON analytics_events;
    DROP POLICY IF EXISTS "Allow admin full access to analytics_events" ON analytics_events;
    CREATE POLICY "Allow admin full access to analytics_events" ON analytics_events 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for ab_test_results table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ab_test_results') THEN
    DROP POLICY IF EXISTS "Allow selects for admins" ON ab_test_results;
    DROP POLICY IF EXISTS "Allow admin full access to ab_test_results" ON ab_test_results;
    CREATE POLICY "Allow admin full access to ab_test_results" ON ab_test_results 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for web_vitals table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'web_vitals') THEN
    DROP POLICY IF EXISTS "Allow selects for admins" ON web_vitals;
    DROP POLICY IF EXISTS "Allow admin full access to web_vitals" ON web_vitals;
    CREATE POLICY "Allow admin full access to web_vitals" ON web_vitals 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for visitor_sessions table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visitor_sessions') THEN
    DROP POLICY IF EXISTS "Allow admin access to visitor_sessions" ON visitor_sessions;
    DROP POLICY IF EXISTS "Allow admin full access to visitor_sessions" ON visitor_sessions;
    CREATE POLICY "Allow admin full access to visitor_sessions" ON visitor_sessions 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for page_views table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'page_views') THEN
    DROP POLICY IF EXISTS "Allow admin access to page_views" ON page_views;
    DROP POLICY IF EXISTS "Allow admin full access to page_views" ON page_views;
    CREATE POLICY "Allow admin full access to page_views" ON page_views 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for article_read_tracking table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_read_tracking') THEN
    DROP POLICY IF EXISTS "Allow admin access to article_read_tracking" ON article_read_tracking;
    DROP POLICY IF EXISTS "Allow admin full access to article_read_tracking" ON article_read_tracking;
    CREATE POLICY "Allow admin full access to article_read_tracking" ON article_read_tracking 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for user_behavior_events table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_behavior_events') THEN
    DROP POLICY IF EXISTS "Allow admin access to user_behavior_events" ON user_behavior_events;
    DROP POLICY IF EXISTS "Allow admin full access to user_behavior_events" ON user_behavior_events;
    CREATE POLICY "Allow admin full access to user_behavior_events" ON user_behavior_events 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for cta_actions table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cta_actions') THEN
    DROP POLICY IF EXISTS "Allow admin full access to CTAs" ON cta_actions;
    DROP POLICY IF EXISTS "Allow admin full access to cta_actions" ON cta_actions;
    CREATE POLICY "Allow admin full access to cta_actions" ON cta_actions 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for cta_tracking table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cta_tracking') THEN
    DROP POLICY IF EXISTS "Allow admin read CTA tracking" ON cta_tracking;
    DROP POLICY IF EXISTS "Allow admin full access to cta_tracking" ON cta_tracking;
    CREATE POLICY "Allow admin full access to cta_tracking" ON cta_tracking 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for cta_conversions table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cta_conversions') THEN
    DROP POLICY IF EXISTS "Allow admin read CTA conversions" ON cta_conversions;
    DROP POLICY IF EXISTS "Allow admin full access to cta_conversions" ON cta_conversions;
    CREATE POLICY "Allow admin full access to cta_conversions" ON cta_conversions 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for admin_users table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    DROP POLICY IF EXISTS "Allow admin access to admin_users" ON admin_users;
    DROP POLICY IF EXISTS "Allow admin full access to admin_users" ON admin_users;
    CREATE POLICY "Allow admin full access to admin_users" ON admin_users 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for conversations table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
    DROP POLICY IF EXISTS "Allow admin access to conversations" ON conversations;
    DROP POLICY IF EXISTS "Allow admin full access to conversations" ON conversations;
    CREATE POLICY "Allow admin full access to conversations" ON conversations 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for messages table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    DROP POLICY IF EXISTS "Allow admin access to messages" ON messages;
    DROP POLICY IF EXISTS "Allow admin full access to messages" ON messages;
    CREATE POLICY "Allow admin full access to messages" ON messages 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for user_intents table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_intents') THEN
    DROP POLICY IF EXISTS "Allow admin access to user_intents" ON user_intents;
    DROP POLICY IF EXISTS "Allow admin full access to user_intents" ON user_intents;
    CREATE POLICY "Allow admin full access to user_intents" ON user_intents 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for bot_responses table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bot_responses') THEN
    DROP POLICY IF EXISTS "Allow admin access to bot_responses" ON bot_responses;
    DROP POLICY IF EXISTS "Allow admin full access to bot_responses" ON bot_responses;
    CREATE POLICY "Allow admin full access to bot_responses" ON bot_responses 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for chatbot_interactions table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chatbot_interactions') THEN
    DROP POLICY IF EXISTS "Allow admin full access to chatbot_interactions" ON chatbot_interactions;
    CREATE POLICY "Allow admin full access to chatbot_interactions" ON chatbot_interactions 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for quotes table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quotes') THEN
    DROP POLICY IF EXISTS "Allow admin full access to quotes" ON quotes;
    CREATE POLICY "Allow admin full access to quotes" ON quotes 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for blog_articles table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'blog_articles') THEN
    DROP POLICY IF EXISTS "Allow admin full access to blog_articles" ON blog_articles;
    CREATE POLICY "Allow admin full access to blog_articles" ON blog_articles 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for knowledge_base table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'knowledge_base') THEN
    DROP POLICY IF EXISTS "Allow admin access to knowledge_base" ON knowledge_base;
    DROP POLICY IF EXISTS "Allow admin full access to knowledge_base" ON knowledge_base;
    CREATE POLICY "Allow admin full access to knowledge_base" ON knowledge_base 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for performance_alerts table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'performance_alerts') THEN
    DROP POLICY IF EXISTS "Admin access to performance_alerts" ON performance_alerts;
    DROP POLICY IF EXISTS "Allow admin full access to performance_alerts" ON performance_alerts;
    CREATE POLICY "Allow admin full access to performance_alerts" ON performance_alerts 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for pagespeed_results table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pagespeed_results') THEN
    DROP POLICY IF EXISTS "Admin access to pagespeed_results" ON pagespeed_results;
    DROP POLICY IF EXISTS "Allow admin full access to pagespeed_results" ON pagespeed_results;
    CREATE POLICY "Allow admin full access to pagespeed_results" ON pagespeed_results 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for performance_budget_checks table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'performance_budget_checks') THEN
    DROP POLICY IF EXISTS "Admin access to performance_budget_checks" ON performance_budget_checks;
    DROP POLICY IF EXISTS "Allow admin full access to performance_budget_checks" ON performance_budget_checks;
    CREATE POLICY "Allow admin full access to performance_budget_checks" ON performance_budget_checks 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for performance_trends table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'performance_trends') THEN
    DROP POLICY IF EXISTS "Admin access to performance_trends" ON performance_trends;
    DROP POLICY IF EXISTS "Allow admin full access to performance_trends" ON performance_trends;
    CREATE POLICY "Allow admin full access to performance_trends" ON performance_trends 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for real_user_metrics table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'real_user_metrics') THEN
    DROP POLICY IF EXISTS "Admin access to real_user_metrics" ON real_user_metrics;
    DROP POLICY IF EXISTS "Allow admin full access to real_user_metrics" ON real_user_metrics;
    CREATE POLICY "Allow admin full access to real_user_metrics" ON real_user_metrics 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Fix for performance_config table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'performance_config') THEN
    DROP POLICY IF EXISTS "Admin access to performance_config" ON performance_config;
    DROP POLICY IF EXISTS "Allow admin full access to performance_config" ON performance_config;
    CREATE POLICY "Allow admin full access to performance_config" ON performance_config 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;
END $$;