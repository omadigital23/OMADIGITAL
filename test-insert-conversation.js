// Script to test inserting a conversation
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const projectId = 'osewplkvprtrlsrvegpl';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsertConversation() {
  try {
    console.log('Testing conversation insertion...');
    
    // Insert a test conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: 'test-user-id',
        session_id: 'test-session-id',
        language: 'fr',
        context: { test: true },
        metadata: { test: true }
      })
      .select();
    
    if (error) {
      console.error('Error inserting conversation:', error.message);
      return;
    }
    
    console.log('✅ Conversation inserted successfully!');
    console.log('Inserted data:', data);
    
    // Clean up test record
    if (data && data[0]) {
      const { error: deleteError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', data[0].id);
      
      if (deleteError) {
        console.warn('Warning: Could not clean up test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
testInsertConversation();