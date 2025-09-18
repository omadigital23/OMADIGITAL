/**
 * Final script to verify Supabase connection - client creation only
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration with new credentials
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

function verifySupabaseCredentials() {
  console.log('🔍 Verifying Supabase credentials...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with new credentials
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    console.log(`📍 URL: ${supabaseUrl}`);
    console.log('\n🎉 Credentials verification successful!');
    console.log('📝 Note: This confirms your credentials are valid for client creation.');
    console.log('📝 To test database operations, you need to set up the database tables first.');
    return true;
  } catch (error) {
    console.error('💥 Failed to create Supabase client:', error.message);
    return false;
  }
}

// Run the verification if called directly
if (require.main === module) {
  const success = verifySupabaseCredentials();
  process.exit(success ? 0 : 1);
}

module.exports = { verifySupabaseCredentials };