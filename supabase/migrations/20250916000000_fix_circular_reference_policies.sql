-- Fix circular reference in RLS policies that was causing "infinite recursion detected in policy for relation 'admin_users'"
-- This migration updates policies that were still referencing user_roles table directly, creating circular dependencies

-- First, drop existing policies that reference user_roles directly
-- Update chatbot_interactions table policies
DROP POLICY IF EXISTS "Allow selects for admins" ON chatbot_interactions;

-- Update analytics_events table policies
DROP POLICY IF EXISTS "Allow selects for admins" ON analytics_events;

-- Update ab_test_results table policies
DROP POLICY IF EXISTS "Allow selects for admins" ON ab_test_results;

-- Update web_vitals table policies
DROP POLICY IF EXISTS "Allow selects for admins" ON web_vitals;

-- Update website analytics tables policies
DROP POLICY IF EXISTS "Allow admin access to visitor_sessions" ON visitor_sessions;
DROP POLICY IF EXISTS "Allow admin access to page_views" ON page_views;
DROP POLICY IF EXISTS "Allow admin access to article_read_tracking" ON article_read_tracking;
DROP POLICY IF EXISTS "Allow admin access to user_behavior_events" ON user_behavior_events;

-- Update user_roles table policies
DROP POLICY IF EXISTS "Allow selects for admins" ON user_roles;
DROP POLICY IF EXISTS "Allow admin writes" ON user_roles;
DROP POLICY IF EXISTS "Allow select own roles" ON user_roles;
DROP POLICY IF EXISTS "Allow admin full access to user_roles" ON user_roles;

-- Now create new policies that use auth.jwt() directly to avoid circular references
-- Update chatbot_interactions table policies
CREATE POLICY "Allow selects for admins" ON chatbot_interactions 
  FOR SELECT USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update analytics_events table policies
CREATE POLICY "Allow selects for admins" ON analytics_events 
  FOR SELECT USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update ab_test_results table policies
CREATE POLICY "Allow selects for admins" ON ab_test_results 
  FOR SELECT USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update web_vitals table policies
CREATE POLICY "Allow selects for admins" ON web_vitals 
  FOR SELECT USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Update website analytics tables policies
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

-- Update user_roles table policies
CREATE POLICY "Allow select own roles" ON user_roles 
FOR SELECT USING (
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  COALESCE(auth.jwt() ->> 'role', '') = 'admin' OR
  -- Allow users to see their own roles
  user_id = auth.uid()
);

CREATE POLICY "Allow admin full access to user_roles" ON user_roles 
FOR ALL TO authenticated USING (
  -- Check if current user is an admin using auth.jwt() to avoid recursion
  COALESCE(auth.jwt() ->> 'role', '') = 'admin'
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON ALL TABLES IN SCHEMA public TO anon;