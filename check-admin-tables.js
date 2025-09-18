const { createClient } = require('@supabase/supabase-js');

// Configuration with service role key for full access
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function checkAdminTables() {
  console.log('🔍 Checking admin dashboard tables...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    console.log(`📍 URL: ${supabaseUrl}`);

    // Check chatbot_interactions table
    console.log('\n📡 Checking chatbot_interactions table...');
    const { data: interactions, error: interactionsError } = await supabase
      .from('chatbot_interactions')
      .select('count');
    
    if (interactionsError) {
      console.log('❌ chatbot_interactions table error:', interactionsError.message);
    } else {
      console.log('✅ chatbot_interactions table accessible');
      console.log('  Rows count:', interactions.length);
    }

    // Check quotes table
    console.log('\n📡 Checking quotes table...');
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('count');
    
    if (quotesError) {
      console.log('❌ quotes table error:', quotesError.message);
    } else {
      console.log('✅ quotes table accessible');
      console.log('  Rows count:', quotes.length);
    }

    // Check blog_subscribers table
    console.log('\n📡 Checking blog_subscribers table...');
    const { data: subscribers, error: subscribersError } = await supabase
      .from('blog_subscribers')
      .select('count');
    
    if (subscribersError) {
      console.log('❌ blog_subscribers table error:', subscribersError.message);
    } else {
      console.log('✅ blog_subscribers table accessible');
      console.log('  Rows count:', subscribers.length);
    }

    // Check analytics_events table
    console.log('\n📡 Checking analytics_events table...');
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('count');
    
    if (eventsError) {
      console.log('❌ analytics_events table error:', eventsError.message);
    } else {
      console.log('✅ analytics_events table accessible');
      console.log('  Rows count:', events.length);
    }
    
    console.log('\n✅ Table checks completed');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Run the test
checkAdminTables();