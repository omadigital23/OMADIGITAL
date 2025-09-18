const { createClient } = require('@supabase/supabase-js');

// Configuration with service role key for full access
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function checkTableFields() {
  console.log('🔍 Checking table fields and data...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');

    // Check what fields are available in each table
    const tables = ['chatbot_interactions', 'quotes', 'blog_subscribers', 'analytics_events'];
    
    for (const table of tables) {
      console.log(`\n📡 Checking ${table}...`);
      
      // Get column info using a simple query
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} error:`, error.message);
      } else {
        console.log(`✅ ${table} accessible`);
        console.log(`  Rows: ${data.length}`);
        
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          console.log(`  Columns: ${columns.join(', ')}`);
          
          // Check for date fields
          const dateFields = columns.filter(col => 
            col.includes('created') || col.includes('timestamp') || col.includes('date')
          );
          console.log(`  Date fields: ${dateFields.join(', ') || 'None found'}`);
          
          // Show a sample row
          console.log(`  Sample data:`, JSON.stringify(data[0], null, 2));
        } else {
          console.log(`  No data found in table`);
        }
      }
    }
    
    console.log('\n✅ Field check completed');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Run the test
checkTableFields();