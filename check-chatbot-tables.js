const { createClient } = require('@supabase/supabase-js');

// Configuration with service role key for full access
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function checkChatbotTables() {
  console.log('🔍 Checking chatbot-related tables...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');

    // Check conversations table
    console.log('\n📡 Checking conversations table...');
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (convError) {
      console.log('❌ conversations error:', convError.message);
    } else {
      console.log('✅ conversations table accessible');
      console.log('  Sample row:', JSON.stringify(convData[0], null, 2));
    }

    // Check messages table
    console.log('\n📡 Checking messages table...');
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (msgError) {
      console.log('❌ messages error:', msgError.message);
    } else {
      console.log('✅ messages table accessible');
      console.log('  Sample row:', JSON.stringify(msgData[0], null, 2));
    }

    // Check chatbot_interactions table
    console.log('\n📡 Checking chatbot_interactions table...');
    const { data: interactionData, error: interactionError } = await supabase
      .from('chatbot_interactions')
      .select('*')
      .limit(1);
    
    if (interactionError) {
      console.log('❌ chatbot_interactions error:', interactionError.message);
    } else {
      console.log('✅ chatbot_interactions table accessible');
      console.log('  Sample row:', JSON.stringify(interactionData[0], null, 2));
    }
    
    console.log('\n✅ Table check completed');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Run the test
checkChatbotTables();