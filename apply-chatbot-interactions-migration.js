// Script to apply the chatbot interactions table migration using direct API calls
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - using your actual credentials
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL for creating the chatbot_interactions table
const createChatbotInteractionsTableSQL = `
-- Create chatbot interactions table for tracking chatbot conversations
create table if not exists chatbot_interactions (
  message_id text primary key,
  user_id uuid,
  session_id text not null,
  message_text text not null,
  response_text text not null,
  input_method text check (input_method in ('text', 'voice')),
  response_time integer not null,
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  timestamp timestamptz not null default now(),
  conversation_length integer,
  user_satisfaction integer check (user_satisfaction >= 1 and user_satisfaction <= 5)
);

-- Create indexes for better query performance
create index if not exists idx_chatbot_interactions_session_id on chatbot_interactions(session_id);
create index if not exists idx_chatbot_interactions_timestamp on chatbot_interactions(timestamp);
create index if not exists idx_chatbot_interactions_user_id on chatbot_interactions(user_id);

-- Add RLS policies
alter table chatbot_interactions enable row level security;

-- Allow inserts for everyone (chatbot data)
create policy "Allow inserts for chatbot interactions" on chatbot_interactions 
  for insert with check (true);

-- Allow selects for admins only
create policy "Allow selects for admins" on chatbot_interactions 
  for select using (
    exists (
      select 1 from user_roles 
      where user_id = auth.uid() 
      and role = 'admin'
    )
  );

-- Grant permissions
grant insert on chatbot_interactions to anon;
grant select on chatbot_interactions to authenticated;
`;

async function applyMigration() {
  try {
    console.log('Checking if chatbot_interactions table exists...');
    
    // Try to query the chatbot_interactions table to see if it exists
    const { data, error } = await supabase
      .from('chatbot_interactions')
      .select('message_id')
      .limit(1);
    
    if (error && error.message.includes('relation "chatbot_interactions" does not exist')) {
      console.log('Chatbot interactions table does not exist. Creating it now...');
      
      // Split the SQL into individual statements
      const statements = createChatbotInteractionsTableSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      let success = true;
      for (const statement of statements) {
        console.log('Executing:', statement.substring(0, 50) + (statement.length > 50 ? '...' : ''));
        try {
          // For table creation, we need to use the Supabase SQL editor or CLI
          // Since we're using the JS client, we'll need to execute each statement separately
          const { error: execError } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (execError) {
            console.warn('Warning with statement:', execError.message);
            // Try alternative approach for some statements
            if (statement.includes('create policy') || statement.includes('grant')) {
              console.log('Skipping policy/grant statement for now (may need to be done in SQL editor)');
              continue;
            } else {
              success = false;
            }
          }
        } catch (stmtError) {
          console.error('Error executing statement:', stmtError);
          success = false;
        }
      }
      
      if (success) {
        console.log('✅ Chatbot interactions table creation commands sent!');
        console.log('Note: Some policy and grant statements may need to be applied manually through the Supabase SQL editor.');
      } else {
        console.log('⚠️  Some statements failed. You may need to apply the migration manually through the Supabase dashboard:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the content from supabase/migrations/20250909000000_chatbot_interactions_table.sql');
        console.log('4. Run the SQL commands');
        return;
      }
    } else if (error) {
      console.error('Error checking table:', error);
      return;
    } else {
      console.log('✅ Chatbot interactions table already exists!');
    }
    
    // Test inserting a sample record
    console.log('Testing insert operation...');
    const testMessageId = 'test_' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('chatbot_interactions')
      .insert({
        message_id: testMessageId,
        session_id: 'test_session',
        message_text: 'Test message',
        response_text: 'Test response',
        input_method: 'text',
        response_time: 1000,
        timestamp: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.error('Error inserting test record:', insertError);
      console.log('You may need to apply the full migration through the Supabase SQL editor.');
      return;
    }
    
    console.log('✅ Insert test successful!');
    
    // Clean up test record
    if (insertData && insertData[0]) {
      const { error: deleteError } = await supabase
        .from('chatbot_interactions')
        .delete()
        .eq('message_id', testMessageId);
      
      if (deleteError) {
        console.warn('Warning: Could not clean up test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }
    
    console.log('🎉 Chatbot interactions table migration verification complete!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the migration
applyMigration();