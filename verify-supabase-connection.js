/**
 * Script to verify the Supabase connection with new credentials
 * This test only verifies that we can connect to Supabase, not that specific tables exist
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration with new credentials
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function verifySupabaseConnection() {
  console.log('🔍 Verifying new Supabase connection...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with new credentials
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    console.log(`📍 URL: ${supabaseUrl}`);

    // Test basic connection with a simple query
    console.log('\n📡 Testing basic connection...');
    
    // Try to get the Supabase version (this will verify the connection)
    const { data, error } = await supabase.rpc('version');
    
    // We don't care about the result, just that the connection works
    if (error && error.message.includes('function version() does not exist')) {
      // This is expected - we just wanted to test the connection
      console.log('✅ Connection test successful - Supabase is accessible');
      return true;
    } else if (error) {
      console.log('❌ Connection test failed:', error.message);
      return false;
    } else {
      console.log('✅ Connection test successful - Supabase is accessible');
      return true;
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the verification if called directly
if (require.main === module) {
  verifySupabaseConnection()
    .then(success => {
      if (success) {
        console.log('\n🎉 New Supabase connection is working correctly!');
        console.log('📝 Note: Table-specific errors are expected if this is a new Supabase instance');
      } else {
        console.log('\n💥 New Supabase connection failed.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { verifySupabaseConnection };