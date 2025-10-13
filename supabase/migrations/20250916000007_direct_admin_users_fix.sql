-- Direct fix for admin_users table to completely eliminate circular reference issues
-- This migration focuses specifically on the admin_users table policies

-- First, let's check if the admin_users table exists
DO $$ 
BEGIN
  -- Only proceed if the admin_users table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_users') THEN
    -- Drop all existing policies on admin_users table
    DROP POLICY IF EXISTS "Allow admin access to admin_users" ON admin_users;
    DROP POLICY IF EXISTS "Allow admin full access to admin_users" ON admin_users;
    DROP POLICY IF EXISTS "Allow select own roles" ON admin_users;
    DROP POLICY IF EXISTS "Allow admin writes" ON admin_users;
    DROP POLICY IF EXISTS "Allow selects for admins" ON admin_users;
    
    -- Create a simple, non-recursive policy for admin_users
    -- This policy only checks the JWT directly without any function calls
    CREATE POLICY "Admin users full access" ON admin_users 
      FOR ALL TO authenticated 
      USING (
        -- Direct JWT check without any function calls
        (auth.jwt() ->> 'role') = 'admin'
      )
      WITH CHECK (
        -- Direct JWT check without any function calls
        (auth.jwt() ->> 'role') = 'admin'
      );
    
    -- Also create a more permissive policy as a fallback
    CREATE POLICY "Admin users read access" ON admin_users 
      FOR SELECT TO authenticated 
      USING (
        -- Allow admins to read, and users to read their own record
        (auth.jwt() ->> 'role') = 'admin' OR
        id = auth.uid()
      );
  END IF;
  
  -- Also fix the conversations table which might be involved in the circular reference
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'conversations') THEN
    -- Drop all existing policies on conversations table
    DROP POLICY IF EXISTS "Allow admin access to conversations" ON conversations;
    DROP POLICY IF EXISTS "Allow admin full access to conversations" ON conversations;
    DROP POLICY IF EXISTS "Allow public access to conversations" ON conversations;
    DROP POLICY IF EXISTS "Allow public insert to conversations" ON conversations;
    DROP POLICY IF EXISTS "Allow select own conversations" ON conversations;
    
    -- Create simple policies for conversations
    CREATE POLICY "Conversations public insert" ON conversations 
      FOR INSERT WITH CHECK (true);
      
    CREATE POLICY "Conversations select own" ON conversations 
      FOR SELECT USING (
        user_id = auth.uid() OR 
        session_id = current_setting('request.headers', true)::json->>'x-session-id'
      );
      
    CREATE POLICY "Conversations admin access" ON conversations 
      FOR ALL TO authenticated 
      USING (
        -- Direct JWT check without any function calls
        (auth.jwt() ->> 'role') = 'admin'
      );
  END IF;
  
  -- Fix messages table as well
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    -- Drop all existing policies on messages table
    DROP POLICY IF EXISTS "Allow admin access to messages" ON messages;
    DROP POLICY IF EXISTS "Allow admin full access to messages" ON messages;
    DROP POLICY IF EXISTS "Allow public access to messages" ON messages;
    DROP POLICY IF EXISTS "Allow insert to messages" ON messages;
    DROP POLICY IF EXISTS "Allow select conversation messages" ON messages;
    
    -- Create simple policies for messages
    CREATE POLICY "Messages public insert" ON messages 
      FOR INSERT WITH CHECK (true);
      
    CREATE POLICY "Messages admin access" ON messages 
      FOR ALL TO authenticated 
      USING (
        -- Direct JWT check without any function calls
        (auth.jwt() ->> 'role') = 'admin'
      );
  END IF;
END $$;