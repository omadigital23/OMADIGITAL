/**
 * Script to test the new Supabase connection with updated credentials
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration with new credentials
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function testNewSupabaseConnection() {
  console.log('🔍 Testing new Supabase connection...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with new credentials
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    console.log(`📍 URL: ${supabaseUrl}`);

    // Test connection by querying a simple table
    console.log('\n📋 Testing table access...');
    
    // Try to access the knowledge_base table
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing knowledge_base table:', error.message);
      return false;
    } else {
      console.log('✅ Successfully accessed knowledge_base table');
      return true;
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the test if called directly
if (require.main === module) {
  testNewSupabaseConnection()
    .then(success => {
      if (success) {
        console.log('\n🎉 New Supabase connection is working correctly!');
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

module.exports = { testNewSupabaseConnection };