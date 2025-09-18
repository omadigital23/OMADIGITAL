const { createClient } = require('@supabase/supabase-js');

// Configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzcyMzksImV4cCI6MjA3Mjk1MzIzOX0.OT-zQbg0Q8BzupmUzQH9xNL8aRCKNO73onKlsaLaE30';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test fetching conversations
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (convError) {
      console.log('❌ Conversations fetch error:', convError);
      return;
    }

    console.log('✅ Successfully fetched conversations:');
    console.log('Found', conversations.length, 'conversations');
    
    if (conversations.length > 0) {
      console.log('Most recent conversation:');
      console.log('- ID:', conversations[0].id);
      console.log('- Session ID:', conversations[0].session_id);
      console.log('- Created at:', conversations[0].created_at);
      
      // Fetch messages for this conversation
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversations[0].id)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.log('❌ Messages fetch error:', msgError);
      } else {
        console.log('✅ Successfully fetched messages for conversation:');
        console.log('Found', messages.length, 'messages');
        messages.forEach((msg, index) => {
          console.log(`Message ${index + 1}:`);
          console.log('  Sender:', msg.sender);
          console.log('  Content:', msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''));
          console.log('  Created at:', msg.created_at);
        });
      }
    }

    console.log('\n🎉 Supabase connection working correctly!');
    
  } catch (error) {
    console.log('💥 Error:', error);
  }
}

// Run the test
testSupabaseConnection();