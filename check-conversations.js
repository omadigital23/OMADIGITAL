// Script to check if there are conversations in the database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConversations() {
  console.log('🔍 Checking for chatbot conversations in database...');
  
  try {
    // Check conversations table
    console.log('\n1️⃣ Checking conversations table...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(10);
    
    if (convError) {
      console.error('❌ Error fetching conversations:', convError.message);
    } else {
      console.log(`✅ Found ${conversations.length} conversations:`);
      conversations.forEach((conv, index) => {
        console.log(`   ${index + 1}. Session: ${conv.session_id} | Created: ${conv.created_at}`);
      });
    }
    
    // Check messages table
    console.log('\n2️⃣ Checking messages table...');
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(10);
    
    if (msgError) {
      console.error('❌ Error fetching messages:', msgError.message);
    } else {
      console.log(`✅ Found ${messages.length} messages:`);
      messages.forEach((msg, index) => {
        console.log(`   ${index + 1}. Conv ID: ${msg.conversation_id} | Sender: ${msg.sender} | Content: ${msg.content.substring(0, 30)}...`);
      });
    }
    
    // Check chatbot_interactions table
    console.log('\n3️⃣ Checking chatbot_interactions table...');
    const { data: interactions, error: interactionError } = await supabase
      .from('chatbot_interactions')
      .select('*')
      .limit(10);
    
    if (interactionError) {
      console.error('❌ Error fetching interactions:', interactionError.message);
    } else {
      console.log(`✅ Found ${interactions.length} interactions:`);
      interactions.forEach((interaction, index) => {
        console.log(`   ${index + 1}. Session: ${interaction.session_id} | Message: ${interaction.message_text.substring(0, 30)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the check
checkConversations();