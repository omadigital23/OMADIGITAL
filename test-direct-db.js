const { createClient } = require('@supabase/supabase-js');

console.log('Testing direct Supabase connection and conversation insertion...');

// Use the credentials directly from the working test script
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseOperations() {
  console.log('Creating test conversation...');
  
  // Create a test conversation
  const sessionId = 'direct-test-session-' + Date.now();
  
  try {
    // Insert conversation (user_id should be null or a valid UUID)
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: null, // Changed from 'test-user' to null
        session_id: sessionId,
        language: 'fr',
        context: { 
          type: 'direct_test',
          source: 'test_script'
        },
        metadata: { 
          created_by: 'test_script',
          test: true
        }
      })
      .select('id')
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      return;
    }
    
    console.log('Conversation created successfully:', conversation);
    
    // Insert messages
    const { error: msgError } = await supabase.from('messages').insert([
      {
        conversation_id: conversation.id,
        content: 'Test user message',
        sender: 'user',
        language: 'fr',
        metadata: { 
          input_type: 'test',
          source: 'test_script'
        }
      },
      {
        conversation_id: conversation.id,
        content: 'Test bot response',
        sender: 'bot',
        language: 'fr',
        metadata: { 
          source: 'test_script',
          test: true
        }
      }
    ]);

    if (msgError) {
      console.error('Error inserting messages:', msgError);
      return;
    }
    
    console.log('Messages inserted successfully');
    
    // Verify the data was saved
    console.log('Verifying saved data...');
    
    const { data: savedConversations, error: convReadError } = await supabase
      .from('conversations')
      .select('*')
      .eq('session_id', sessionId);

    if (convReadError) {
      console.error('Error reading conversations:', convReadError);
    } else {
      console.log(`Found ${savedConversations.length} conversations with session ID ${sessionId}:`);
      savedConversations.forEach(conv => {
        console.log(`  - ID: ${conv.id}, Session: ${conv.session_id}, Created: ${conv.created_at}`);
      });
    }
    
  } catch (error) {
    console.error('Error in database operations:', error);
  }
}

testDatabaseOperations();