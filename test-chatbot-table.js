// Script to test the chatbot_interactions table
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase from environment variables
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzcyMzksImV4cCI6MjA3Mjk1MzIzOX0.OT-zQbg0Q8BzupmUzQH9xNL8aRCKNO73onKlsaLaE30';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testChatbotTable() {
  try {
    console.log('🔍 Testing chatbot_interactions table...');
    
    // Try to query the chatbot_interactions table to see if it exists
    const { data, error } = await supabase
      .from('chatbot_interactions')
      .select('message_id')
      .limit(1);
    
    if (error) {
      console.log('❌ Error querying table:', error);
      if (error.message.includes('relation "chatbot_interactions" does not exist')) {
        console.log('📝 The chatbot_interactions table does not exist.');
        console.log('💡 Please create it using the SQL migration file:');
        console.log('   supabase/migrations/20250909000000_chatbot_interactions_table.sql');
        return;
      }
      return;
    }
    
    console.log('✅ chatbot_interactions table exists and is accessible!');
    
    // Test inserting a sample record
    console.log('📝 Testing insert operation...');
    const testMessageId = 'test-' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('chatbot_interactions')
      .insert({
        message_id: testMessageId,
        session_id: 'test-session',
        message_text: 'Test message',
        response_text: 'Test response',
        input_method: 'text',
        response_time: 1000,
        timestamp: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting test record:', insertError);
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
        console.warn('⚠️ Warning: Could not clean up test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }
    
    console.log('🎉 Table verification complete! Chatbot interactions should work correctly.');
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

// Run the test
testChatbotTable();