// Simple script to create chatbot_interactions table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Required environment variables not set');
  console.error('Please ensure .env.local contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

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
        console.log('1. Go to your Supabase dashboard at https://app.supabase.com');
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