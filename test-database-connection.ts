import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test query to check if we can connect to the database
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, title')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      process.exit(1);
    }

    console.log('Database connection successful!');
    console.log('Sample data:', data);
    
    // Test chatbot_interactions table
    const { data: interactions, error: interactionsError } = await supabase
      .from('chatbot_interactions')
      .select('message_id')
      .limit(1);

    if (interactionsError) {
      console.error('Chatbot interactions table error:', interactionsError);
    } else {
      console.log('Chatbot interactions table accessible');
      console.log('Sample interaction:', interactions);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

testConnection();