-- Fix circular reference in admin_users table policies that was causing "infinite recursion detected in policy for relation 'admin_users'"
-- This migration specifically addresses the admin_users table policies to ensure they don't create circular references

-- Drop existing policies on admin_users table
DROP POLICY IF EXISTS "Allow admin access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow admin full access to admin_users" ON admin_users;

-- Create new policy for admin_users table that uses auth.jwt() directly
CREATE POLICY "Allow admin full access to admin_users" ON admin_users 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Also update the conversations table policies to avoid potential circular references
-- Drop existing policies on conversations table
DROP POLICY IF EXISTS "Allow admin full access to conversations" ON conversations;
DROP POLICY IF EXISTS "Allow admin access to conversations" ON conversations;

-- Create new policy for conversations table that uses auth.jwt() directly
CREATE POLICY "Allow admin full access to conversations" ON conversations 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Drop existing policies on messages table
DROP POLICY IF EXISTS "Allow admin full access to messages" ON messages;
DROP POLICY IF EXISTS "Allow admin access to messages" ON messages;

-- Create new policy for messages table that uses auth.jwt() directly
CREATE POLICY "Allow admin full access to messages" ON messages 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Drop existing policies on user_intents table
DROP POLICY IF EXISTS "Allow admin full access to user_intents" ON user_intents;
DROP POLICY IF EXISTS "Allow admin access to user_intents" ON user_intents;

-- Create new policy for user_intents table that uses auth.jwt() directly
CREATE POLICY "Allow admin full access to user_intents" ON user_intents 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );

-- Drop existing policies on bot_responses table
DROP POLICY IF EXISTS "Allow admin full access to bot_responses" ON bot_responses;
DROP POLICY IF EXISTS "Allow admin access to bot_responses" ON bot_responses;

-- Create new policy for bot_responses table that uses auth.jwt() directly
CREATE POLICY "Allow admin full access to bot_responses" ON bot_responses 
  FOR ALL TO authenticated USING (
    -- Check if current user is an admin using auth.jwt() to avoid recursion
    COALESCE(auth.jwt() ->> 'role', '') = 'admin'
  );