-- Replace policies using is_admin_user() function with direct auth.jwt() checks
-- This migration updates all policies that were using the is_admin_user() function to use direct auth.jwt() checks

-- Update knowledge_base table policies
DROP POLICY IF EXISTS "Allow admin full access to knowledge_base" ON knowledge_base;
CREATE POLICY "Allow admin full access to knowledge_base" ON knowledge_base 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update chatbot_interactions table policies
DROP POLICY IF EXISTS "Allow admin full access to chatbot_interactions" ON chatbot_interactions;
CREATE POLICY "Allow admin full access to chatbot_interactions" ON chatbot_interactions 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update quotes table policies
DROP POLICY IF EXISTS "Allow admin full access to quotes" ON quotes;
CREATE POLICY "Allow admin full access to quotes" ON quotes 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update blog_articles table policies
DROP POLICY IF EXISTS "Allow admin full access to blog_articles" ON blog_articles;
CREATE POLICY "Allow admin full access to blog_articles" ON blog_articles 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update analytics_events table policies
DROP POLICY IF EXISTS "Allow admin full access to analytics_events" ON analytics_events;
CREATE POLICY "Allow admin full access to analytics_events" ON analytics_events 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update cta_actions table policies
DROP POLICY IF EXISTS "Allow admin full access to cta_actions" ON cta_actions;
CREATE POLICY "Allow admin full access to cta_actions" ON cta_actions 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update cta_tracking table policies
DROP POLICY IF EXISTS "Allow admin full access to cta_tracking" ON cta_tracking;
CREATE POLICY "Allow admin full access to cta_tracking" ON cta_tracking 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update cta_conversions table policies
DROP POLICY IF EXISTS "Allow admin full access to cta_conversions" ON cta_conversions;
CREATE POLICY "Allow admin full access to cta_conversions" ON cta_conversions 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update ab_test_results table policies
DROP POLICY IF EXISTS "Allow admin full access to ab_test_results" ON ab_test_results;
CREATE POLICY "Allow admin full access to ab_test_results" ON ab_test_results 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update performance_alerts table policies
DROP POLICY IF EXISTS "Allow admin full access to performance_alerts" ON performance_alerts;
CREATE POLICY "Allow admin full access to performance_alerts" ON performance_alerts 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update pagespeed_results table policies
DROP POLICY IF EXISTS "Allow admin full access to pagespeed_results" ON pagespeed_results;
CREATE POLICY "Allow admin full access to pagespeed_results" ON pagespeed_results 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update performance_budget_checks table policies
DROP POLICY IF EXISTS "Allow admin full access to performance_budget_checks" ON performance_budget_checks;
CREATE POLICY "Allow admin full access to performance_budget_checks" ON performance_budget_checks 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update performance_trends table policies
DROP POLICY IF EXISTS "Allow admin full access to performance_trends" ON performance_trends;
CREATE POLICY "Allow admin full access to performance_trends" ON performance_trends 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update real_user_metrics table policies
DROP POLICY IF EXISTS "Allow admin full access to real_user_metrics" ON real_user_metrics;
CREATE POLICY "Allow admin full access to real_user_metrics" ON real_user_metrics 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update performance_config table policies
DROP POLICY IF EXISTS "Allow admin full access to performance_config" ON performance_config;
CREATE POLICY "Allow admin full access to performance_config" ON performance_config 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );