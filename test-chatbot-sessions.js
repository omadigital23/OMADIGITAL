const { createClient } = require('@supabase/supabase-js');

// Configuration with service role key for full access
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function testChatbotSessions() {
  console.log('🔍 Testing chatbot sessions data retrieval...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');

    // Fetch recent conversations
    console.log('\n📡 Fetching recent conversations...');
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (convError) {
      console.log('❌ Failed to fetch conversations:', convError.message);
      return;
    }

    console.log('✅ Successfully fetched conversations:');
    console.log('  Found', conversations.length, 'conversations');
    
    if (conversations.length > 0) {
      console.log('\n📋 Conversation details:');
      conversations.forEach((conv, index) => {
        console.log(`  ${index + 1}. ID: ${conv.id}`);
        console.log(`     User ID: ${conv.user_id}`);
        console.log(`     Session ID: ${conv.session_id}`);
        console.log(`     Created: ${conv.created_at}`);
        console.log(`     Context: ${JSON.stringify(conv.context)}`);
        console.log('');
      });
      
      // Fetch messages for the first conversation
      const firstConversation = conversations[0];
      console.log(`\n📡 Fetching messages for conversation ${firstConversation.id}...`);
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', firstConversation.id)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.log('❌ Failed to fetch messages:', msgError.message);
      } else {
        console.log('✅ Successfully fetched messages:');
        console.log('  Found', messages.length, 'messages');
        
        if (messages.length > 0) {
          console.log('\n💬 Messages:');
          messages.forEach((msg, index) => {
            console.log(`  ${index + 1}. Sender: ${msg.sender}`);
            console.log(`     Content: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
            console.log(`     Created: ${msg.created_at}`);
            console.log('');
          });
        }
      }
    }

    console.log('\n🎉 Chatbot sessions test completed successfully!');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

// Run the test
testChatbotSessions();