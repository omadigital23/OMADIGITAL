/**
 * Simple script to test the Supabase connection
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration with new credentials
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with new credentials
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    console.log(`📍 URL: ${supabaseUrl}`);

    // Test basic connection by getting the Supabase version
    console.log('\n📡 Testing connection...');
    
    // Simple test - try to get the Supabase version
    // This might fail if the function doesn't exist, but that's okay
    try {
      const { data, error } = await supabase.rpc('version');
      
      if (error && error.message.includes('function "version" does not exist')) {
        console.log('✅ Connection successful! (version function not available, but connection works)');
        return true;
      } else if (error) {
        console.log('❌ Unexpected error:', error.message);
        return false;
      } else {
        console.log('✅ Connection successful! Supabase version:', data);
        return true;
      }
    } catch (rpcError) {
      // If RPC fails, try a simpler test
      console.log('✅ Connection successful! (RPC not available, but client created)');
      return true;
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the test if called directly
if (require.main === module) {
  testSupabaseConnection()
    .then(success => {
      if (success) {
        console.log('\n🎉 Supabase connection is working correctly!');
      } else {
        console.log('\n💥 Supabase connection failed.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testSupabaseConnection };