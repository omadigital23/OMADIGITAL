-- Replace policies using is_admin_user() function with direct auth.jwt() checks
-- This migration updates all policies that were using the is_admin_user() function to use direct auth.jwt() checks
-- Only applies policies to tables that exist

DO $$ 
BEGIN
  -- Update knowledge_base table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'knowledge_base') THEN
    DROP POLICY IF EXISTS "Allow admin full access to knowledge_base" ON knowledge_base;
    CREATE POLICY "Allow admin full access to knowledge_base" ON knowledge_base 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update chatbot_interactions table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chatbot_interactions') THEN
    DROP POLICY IF EXISTS "Allow admin full access to chatbot_interactions" ON chatbot_interactions;
    CREATE POLICY "Allow admin full access to chatbot_interactions" ON chatbot_interactions 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update quotes table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'quotes') THEN
    DROP POLICY IF EXISTS "Allow admin full access to quotes" ON quotes;
    CREATE POLICY "Allow admin full access to quotes" ON quotes 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update blog_articles table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'blog_articles') THEN
    DROP POLICY IF EXISTS "Allow admin full access to blog_articles" ON blog_articles;
    CREATE POLICY "Allow admin full access to blog_articles" ON blog_articles 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update analytics_events table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analytics_events') THEN
    DROP POLICY IF EXISTS "Allow admin full access to analytics_events" ON analytics_events;
    CREATE POLICY "Allow admin full access to analytics_events" ON analytics_events 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update conversations table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
    DROP POLICY IF EXISTS "Allow admin full access to conversations" ON conversations;
    CREATE POLICY "Allow admin full access to conversations" ON conversations 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update messages table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    DROP POLICY IF EXISTS "Allow admin full access to messages" ON messages;
    CREATE POLICY "Allow admin full access to messages" ON messages 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update user_intents table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_intents') THEN
    DROP POLICY IF EXISTS "Allow admin full access to user_intents" ON user_intents;
    CREATE POLICY "Allow admin full access to user_intents" ON user_intents 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update bot_responses table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bot_responses') THEN
    DROP POLICY IF EXISTS "Allow admin full access to bot_responses" ON bot_responses;
    CREATE POLICY "Allow admin full access to bot_responses" ON bot_responses 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update cta_actions table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cta_actions') THEN
    DROP POLICY IF EXISTS "Allow admin full access to cta_actions" ON cta_actions;
    CREATE POLICY "Allow admin full access to cta_actions" ON cta_actions 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update cta_tracking table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cta_tracking') THEN
    DROP POLICY IF EXISTS "Allow admin full access to cta_tracking" ON cta_tracking;
    CREATE POLICY "Allow admin full access to cta_tracking" ON cta_tracking 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update cta_conversions table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cta_conversions') THEN
    DROP POLICY IF EXISTS "Allow admin full access to cta_conversions" ON cta_conversions;
    CREATE POLICY "Allow admin full access to cta_conversions" ON cta_conversions 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update ab_test_results table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ab_test_results') THEN
    DROP POLICY IF EXISTS "Allow admin full access to ab_test_results" ON ab_test_results;
    CREATE POLICY "Allow admin full access to ab_test_results" ON ab_test_results 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update performance_alerts table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'performance_alerts') THEN
    DROP POLICY IF EXISTS "Allow admin full access to performance_alerts" ON performance_alerts;
    CREATE POLICY "Allow admin full access to performance_alerts" ON performance_alerts 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update pagespeed_results table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pagespeed_results') THEN
    DROP POLICY IF EXISTS "Allow admin full access to pagespeed_results" ON pagespeed_results;
    CREATE POLICY "Allow admin full access to pagespeed_results" ON pagespeed_results 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update performance_budget_checks table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'performance_budget_checks') THEN
    DROP POLICY IF EXISTS "Allow admin full access to performance_budget_checks" ON performance_budget_checks;
    CREATE POLICY "Allow admin full access to performance_budget_checks" ON performance_budget_checks 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update performance_trends table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'performance_trends') THEN
    DROP POLICY IF EXISTS "Allow admin full access to performance_trends" ON performance_trends;
    CREATE POLICY "Allow admin full access to performance_trends" ON performance_trends 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update real_user_metrics table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'real_user_metrics') THEN
    DROP POLICY IF EXISTS "Allow admin full access to real_user_metrics" ON real_user_metrics;
    CREATE POLICY "Allow admin full access to real_user_metrics" ON real_user_metrics 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Update performance_config table policies
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'performance_config') THEN
    DROP POLICY IF EXISTS "Allow admin full access to performance_config" ON performance_config;
    CREATE POLICY "Allow admin full access to performance_config" ON performance_config 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;
END $$;