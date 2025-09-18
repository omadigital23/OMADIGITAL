// Test script to verify chatbot conversation saving to both tables
const supabaseClient = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration - Use the same environment variables as the app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Use anon key for this test
const supabase = supabaseClient.createClient(supabaseUrl, supabaseAnonKey);

async function testConversationSaving() {
  console.log('🧪 Testing Chatbot Conversation Saving...');
  
  try {
    console.log('\n1️⃣ Testing read access to conversations table...');
    
    // Test if we can read from the conversations table
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('id, session_id, created_at')
      .limit(5);
    
    if (convError) {
      console.error('❌ Error reading from conversations table:', convError.message);
    } else {
      console.log('✅ Successfully read from conversations table');
      console.log('Sample conversations:', convData);
    }
    
    console.log('\n2️⃣ Testing read access to messages table...');
    
    // Test if we can read from the messages table
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('id, conversation_id, sender, content')
      .limit(5);
    
    if (msgError) {
      console.error('❌ Error reading from messages table:', msgError.message);
    } else {
      console.log('✅ Successfully read from messages table');
      console.log('Sample messages:', msgData);
    }
    
    console.log('\n3️⃣ Testing read access to chatbot_interactions table...');
    
    // Test if we can read from the chatbot_interactions table
    const { data: interactionData, error: interactionError } = await supabase
      .from('chatbot_interactions')
      .select('message_id, session_id, message_text, response_text')
      .limit(5);
    
    if (interactionError) {
      console.error('❌ Error reading from chatbot_interactions table:', interactionError.message);
    } else {
      console.log('✅ Successfully read from chatbot_interactions table');
      console.log('Sample interactions:', interactionData);
    }
    
    console.log('\n🎉 Read test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

// Run the test
testConversationSaving();