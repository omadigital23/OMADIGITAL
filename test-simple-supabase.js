const { createClient } = require('@supabase/supabase-js');

// Configuration with new credentials
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function testSimpleConnection() {
  console.log('🔍 Testing simple Supabase connection...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with new credentials
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    console.log(`📍 URL: ${supabaseUrl}`);

    // Test basic connection by listing tables
    console.log('\n📡 Testing connection by listing tables...');
    
    // Get list of tables
    const { data, error } = await supabase
      .from('chatbot_interactions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      console.log('Error details:', error);
      return false;
    } else {
      console.log('✅ Connection test successful - Supabase is accessible');
      console.log('Sample data check passed');
      return true;
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testSimpleConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Simple Supabase connection is working correctly!');
    } else {
      console.log('\n💥 Simple Supabase connection failed.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });