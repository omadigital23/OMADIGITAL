const { createClient } = require('@supabase/supabase-js');

// Configuration with service role key for full access
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function checkAnalyticsSchema() {
  console.log('🔍 Checking analytics_events schema in detail...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');

    // Check if we can get any information about the table structure
    console.log('\n📡 Getting table info for analytics_events...');
    
    // Try to insert a test row to see what fields are required
    const testEvent = {
      event_name: 'test_event',
      url: '/test',
      timestamp: new Date().toISOString(),
      session_id: 'test_session'
    };
    
    const { data, error } = await supabase
      .from('analytics_events')
      .insert(testEvent)
      .select();
    
    if (error) {
      console.log('❌ Error inserting test row:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Successfully inserted test row');
      console.log('Data returned:', JSON.stringify(data, null, 2));
      
      // Delete the test row
      if (data && data[0] && data[0].id) {
        await supabase
          .from('analytics_events')
          .delete()
          .eq('id', data[0].id);
        console.log('✅ Test row deleted');
      }
    }
    
    console.log('\n✅ Analytics schema check completed');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Run the test
checkAnalyticsSchema();