// Simple script to create chatbot_interactions table
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - using your actual credentials
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTable() {
  try {
    console.log('Attempting to create chatbot_interactions table...');
    
    // Try to create the table with a simple insert
    const { data, error } = await supabase.rpc('create_chatbot_interactions_table');
    
    if (error) {
      console.log('Custom RPC function not available, trying direct approach...');
      
      // Try a simple query to see if we can interact with any table
      const { data: testData, error: testError } = await supabase
        .from('chatbot_interactions')
        .select('message_id')
        .limit(1);
      
      if (testError && testError.message.includes('relation "chatbot_interactions" does not exist')) {
        console.log('Table does not exist. You need to create it manually through the Supabase dashboard.');
        console.log('Please follow these steps:');
        console.log('1. Go to your Supabase dashboard at https://app.supabase.com/project/pcedyohixahtfogfdlig');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the following SQL:');
        console.log(`
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
        `);
        console.log('4. Run the SQL commands');
        return;
      } else if (testError) {
        console.error('Other error:', testError);
        return;
      } else {
        console.log('✅ Table already exists and is accessible!');
      }
    } else {
      console.log('✅ Table creation successful!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTable();