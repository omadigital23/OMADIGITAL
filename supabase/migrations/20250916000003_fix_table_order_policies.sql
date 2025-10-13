-- Fix policies for tables that may not exist yet
-- This migration ensures policies are applied in the correct order

-- First, check if tables exist before applying policies
DO $$ 
BEGIN
  -- Fix policies that directly reference user_roles table
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analytics_events') THEN
    DROP POLICY IF EXISTS "Allow selects for admins" ON analytics_events;
    CREATE POLICY "Allow selects for admins" ON analytics_events 
      FOR SELECT USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ab_test_results') THEN
    DROP POLICY IF EXISTS "Allow selects for admins" ON ab_test_results;
    CREATE POLICY "Allow selects for admins" ON ab_test_results 
      FOR SELECT USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'web_vitals') THEN
    DROP POLICY IF EXISTS "Allow selects for admins" ON web_vitals;
    CREATE POLICY "Allow selects for admins" ON web_vitals 
      FOR SELECT USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- Website analytics tables
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visitor_sessions') THEN
    DROP POLICY IF EXISTS "Allow admin access to visitor_sessions" ON visitor_sessions;
    CREATE POLICY "Allow admin access to visitor_sessions" ON visitor_sessions 
      FOR SELECT TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'page_views') THEN
    DROP POLICY IF EXISTS "Allow admin access to page_views" ON page_views;
    CREATE POLICY "Allow admin access to page_views" ON page_views 
      FOR SELECT TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_read_tracking') THEN
    DROP POLICY IF EXISTS "Allow admin access to article_read_tracking" ON article_read_tracking;
    CREATE POLICY "Allow admin access to article_read_tracking" ON article_read_tracking 
      FOR SELECT TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_behavior_events') THEN
    DROP POLICY IF EXISTS "Allow admin access to user_behavior_events" ON user_behavior_events;
    CREATE POLICY "Allow admin access to user_behavior_events" ON user_behavior_events 
      FOR SELECT TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  -- CTA tables
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cta_actions') THEN
    DROP POLICY IF EXISTS "Allow admin full access to cta_actions" ON cta_actions;
    CREATE POLICY "Allow admin full access to cta_actions" ON cta_actions 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cta_tracking') THEN
    DROP POLICY IF EXISTS "Allow admin full access to cta_tracking" ON cta_tracking;
    CREATE POLICY "Allow admin full access to cta_tracking" ON cta_tracking 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cta_conversions') THEN
    DROP POLICY IF EXISTS "Allow admin full access to cta_conversions" ON cta_conversions;
    CREATE POLICY "Allow admin full access to cta_conversions" ON cta_conversions 
      FOR ALL TO authenticated USING (
        COALESCE(auth.jwt() ->> 'role', '') = 'admin'
      );
  END IF;
END $$;