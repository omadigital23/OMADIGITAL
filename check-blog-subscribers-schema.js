// Script to check the blog_subscribers table schema
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase from the verify script
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('🔍 Checking blog_subscribers table schema...');
    
    // Try to get column information using a different approach
    const { data, error } = await supabase
      .from('blog_subscribers')
      .select('id, email, status, confirmation_token, unsubscribe_token, subscribed_at, confirmed_at')
      .limit(1);
    
    if (error) {
      console.log('❌ Error accessing blog_subscribers table:', error.message);
      console.log('📋 Error details:', error);
      return false;
    }
    
    console.log('✅ blog_subscribers table schema is correct');
    console.log('📋 Sample data structure:', data ? data[0] : 'No data');
    return true;
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the check
checkSchema()
  .then(success => {
    if (success) {
      console.log('\n✅ Schema check completed successfully!');
    } else {
      console.log('\n❌ Schema check failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });