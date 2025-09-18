// Script to check the actual columns in the blog_subscribers table
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from user input
const SUPABASE_URL = 'https://pcedyohixahtfogfdlig.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkColumns() {
  try {
    console.log('🔍 Checking blog_subscribers table columns...');
    
    // Try to get column information using a different approach
    const { data, error } = await supabase
      .from('blog_subscribers')
      .select('*')
      .limit(0); // Just get the structure, no data
    
    if (error) {
      console.log('❌ Error accessing blog_subscribers table:', error.message);
      // Try to get table info from information_schema
      const { data: schemaData, error: schemaError } = await supabase
        .rpc('exec_sql', { 
          sql: `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'blog_subscribers'
            ORDER BY ordinal_position;
          ` 
        });
      
      if (schemaError) {
        console.log('❌ Error getting schema info:', schemaError.message);
        return false;
      }
      
      console.log('📋 Table columns from information_schema:');
      schemaData.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable})`);
      });
      return true;
    }
    
    // If we got here, we can access the table
    console.log('✅ Successfully accessed blog_subscribers table');
    
    // Get the column names from the data structure
    if (data && data.length === 0) {
      // This means we successfully accessed the table structure
      console.log('📋 Table exists and is accessible');
      return true;
    }
    
    console.log('📋 Sample row structure:', Object.keys(data[0] || {}));
    return true;
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the check
checkColumns()
  .then(success => {
    if (success) {
      console.log('\n✅ Column check completed successfully!');
    } else {
      console.log('\n❌ Column check failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });