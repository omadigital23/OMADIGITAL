const { createClient } = require('@supabase/supabase-js');

// Use the credentials directly from the working test script
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConversations() {
  console.log('🔍 Checking conversations in database...');
  
  try {
    // Check conversations table
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(10);
      
    if (convError) {
      console.error('❌ Error fetching conversations:', convError);
    } else {
      console.log(`✅ Found ${conversations.length} conversations:`);
      conversations.forEach(conv => {
        console.log(`  - ID: ${conv.id}, Session: ${conv.session_id}, Created: ${conv.created_at}`);
      });
    }
    
    // Check messages table
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(10);
      
    if (msgError) {
      console.error('❌ Error fetching messages:', msgError);
    } else {
      console.log(`✅ Found ${messages.length} messages:`);
      messages.forEach(msg => {
        console.log(`  - ID: ${msg.id}, Conv ID: ${msg.conversation_id}, Sender: ${msg.sender}, Content: ${msg.content?.substring(0, 50)}...`);
      });
    }
    
    // Check chatbot_interactions table (older system)
    const { data: interactions, error: interError } = await supabase
      .from('chatbot_interactions')
      .select('*')
      .limit(10);
      
    if (interError) {
      console.error('❌ Error fetching chatbot_interactions:', interError);
    } else {
      console.log(`✅ Found ${interactions.length} chatbot interactions:`);
      interactions.forEach(inter => {
        console.log(`  - Message ID: ${inter.message_id}, Session: ${inter.session_id}, Message: ${inter.message_text?.substring(0, 50)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  }
}

checkConversations();