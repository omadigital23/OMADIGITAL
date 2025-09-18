// Script to get table information using Supabase client
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from user input
const SUPABASE_URL = 'https://pcedyohixahtfogfdlig.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function getTableInfo() {
  try {
    console.log('🔍 Getting table information using Supabase client...');
    
    // Try different approaches to get table schema information
    
    // Approach 1: Try to select specific columns to see which ones exist
    console.log('\n📋 Testing blog_subscribers columns...');
    const testColumns = [
      'id', 'email', 'name', 'status', 'source', 'interests',
      'confirmation_token', 'confirm_token', 'unsubscribe_token', 
      'confirmed_at', 'confirmed', 'subscribed_at', 'unsubscribed_at'
    ];
    
    for (const column of testColumns) {
      try {
        const { data, error } = await supabase
          .from('blog_subscribers')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${column}: ${error.message}`);
        } else {
          console.log(`  ✅ ${column}: Accessible`);
        }
      } catch (err) {
        console.log(`  ❌ ${column}: ${err.message}`);
      }
    }
    
    // Approach 2: Try to get a sample row to see the structure
    console.log('\n📋 Getting sample row structure...');
    try {
      const { data, error } = await supabase
        .from('blog_subscribers')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ Error getting sample row:', error.message);
      } else if (data && data.length > 0) {
        console.log('✅ Sample row retrieved successfully');
        console.log('📋 Available columns:', Object.keys(data[0]));
      } else {
        console.log('📋 No data found in table (empty table)');
      }
    } catch (err) {
      console.log('❌ Error getting sample row:', err.message);
    }
    
    // Test chatbot_interactions table
    console.log('\n📋 Testing chatbot_interactions columns...');
    const chatTestColumns = [
      'message_id', 'user_id', 'session_id', 'message_text', 'response_text',
      'input_method', 'response_time', 'sentiment', 'timestamp',
      'conversation_length', 'user_satisfaction'
    ];
    
    for (const column of chatTestColumns) {
      try {
        const { data, error } = await supabase
          .from('chatbot_interactions')
          .select(column)
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${column}: ${error.message}`);
        } else {
          console.log(`  ✅ ${column}: Accessible`);
        }
      } catch (err) {
        console.log(`  ❌ ${column}: ${err.message}`);
      }
    }
    
    console.log('\n🎉 Table information check completed!');
    return true;
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the table info check
getTableInfo()
  .then(success => {
    if (success) {
      console.log('\n✅ Table information check completed successfully!');
    } else {
      console.log('\n❌ Table information check failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });