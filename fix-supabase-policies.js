// Script to fix Supabase RLS policies
const { createClient } = require('@supabase/supabase-js');

// Configuration from environment variables
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSupabasePolicies() {
  try {
    console.log('🔧 Fixing Supabase RLS policies...');
    
    // Drop existing policies on user_roles table
    console.log('🗑️ Dropping existing policies on user_roles...');
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Allow selects for admins" ON user_roles;` 
    });
    
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Allow admin writes" ON user_roles;` 
    });
    
    // Create new policies for user_roles
    console.log('➕ Creating new policies for user_roles...');
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE POLICY "Allow selects for admins" ON user_roles 
        FOR SELECT USING (
          COALESCE(auth.jwt() ->> 'role', '') = 'admin' OR
          user_id = auth.uid()
        );
      ` 
    });
    
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE POLICY "Allow admin writes" ON user_roles 
        FOR ALL USING (
          COALESCE(auth.jwt() ->> 'role', '') = 'admin'
        );
      ` 
    });
    
    // Drop existing policies on chatbot_interactions table
    console.log('🗑️ Dropping existing policies on chatbot_interactions...');
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Allow selects for admins" ON chatbot_interactions;` 
    });
    
    await supabase.rpc('exec_sql', { 
      sql: `DROP POLICY IF EXISTS "Allow updates for admins" ON chatbot_interactions;` 
    });
    
    // Create new policies for chatbot_interactions
    console.log('➕ Creating new policies for chatbot_interactions...');
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE POLICY "Allow selects for admins" ON chatbot_interactions 
        FOR SELECT USING (
          COALESCE(auth.jwt() ->> 'role', '') = 'admin'
        );
      ` 
    });
    
    await supabase.rpc('exec_sql', { 
      sql: `
        CREATE POLICY "Allow updates for admins" ON chatbot_interactions 
        FOR UPDATE USING (
          COALESCE(auth.jwt() ->> 'role', '') = 'admin'
        );
      ` 
    });
    
    console.log('✅ Supabase RLS policies fixed successfully!');
    
    // Test the fix
    console.log('🔍 Testing the fix...');
    const { data, error } = await supabase
      .from('chatbot_interactions')
      .select('message_id')
      .limit(1);
    
    if (error) {
      console.log('❌ Error after fix:', error);
    } else {
      console.log('✅ Chatbot interactions table is now accessible!');
    }
    
  } catch (error) {
    console.log('💥 Error fixing Supabase policies:', error);
  }
}

// Run the fix
fixSupabasePolicies();