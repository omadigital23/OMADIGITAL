// Verify chatbot_interactions table structure
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - using your actual credentials
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTable() {
  try {
    console.log('Verifying chatbot_interactions table structure...');
    
    // Try to describe the table structure
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'chatbot_interactions' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.log('Error describing table structure:', error);
      
      // Try a simpler approach - check if we can insert a record
      console.log('Trying to insert a test record...');
      const testMessageId = 'test_' + Date.now();
      
      const { data: insertData, error: insertError } = await supabase
        .from('chatbot_interactions')
        .insert({
          message_id: testMessageId,
          session_id: 'test_session',
          message_text: 'Test message',
          response_text: 'Test response',
          input_method: 'text',
          response_time: 1000,
          timestamp: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Insert failed:', insertError);
        console.log('The chatbot_interactions table may not exist or has incorrect structure.');
        console.log('Please create it manually through the Supabase dashboard with this SQL:');
        console.log(`
CREATE TABLE IF NOT EXISTS chatbot_interactions (
  message_id TEXT PRIMARY KEY,
  user_id UUID,
  session_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  input_method TEXT CHECK (input_method IN ('text', 'voice')),
  response_time INTEGER NOT NULL,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  conversation_length INTEGER,
  user_satisfaction INTEGER CHECK (user_satisfaction >= 1 AND user_satisfaction <= 5)
);
        `);
      } else {
        console.log('✅ Insert successful - table exists and is working!');
        
        // Clean up
        const { error: deleteError } = await supabase
          .from('chatbot_interactions')
          .delete()
          .eq('message_id', testMessageId);
        
        if (deleteError) {
          console.log('Warning: Could not clean up test record');
        } else {
          console.log('✅ Test record cleaned up');
        }
      }
      
      return;
    }
    
    console.log('✅ Table structure:');
    if (data && data.length > 0) {
      data.forEach(column => {
        console.log(`  ${column.column_name}: ${column.data_type} (${column.is_nullable})`);
      });
    } else {
      console.log('No columns found - table may not exist');
      console.log('Please create it manually through the Supabase dashboard');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyTable();