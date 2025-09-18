const { createClient } = require('@supabase/supabase-js');

// Configuration with service role key for full access
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function checkTableData() {
  console.log('🔍 Checking table data without date filters...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');

    // Check chatbot_interactions table
    console.log('\n📡 Checking chatbot_interactions table...');
    const { data: interactions, error: interactionsError } = await supabase
      .from('chatbot_interactions')
      .select('*')
      .limit(5);
    
    if (interactionsError) {
      console.log('❌ chatbot_interactions error:', interactionsError.message);
    } else {
      console.log('✅ chatbot_interactions accessible');
      console.log('  Rows found:', interactions.length);
      if (interactions.length > 0) {
        console.log('  Sample row:', JSON.stringify(interactions[0], null, 2));
      }
    }

    // Check quotes table
    console.log('\n📡 Checking quotes table...');
    const { data: quotes, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(5);
    
    if (quotesError) {
      console.log('❌ quotes error:', quotesError.message);
    } else {
      console.log('✅ quotes accessible');
      console.log('  Rows found:', quotes.length);
      if (quotes.length > 0) {
        console.log('  Sample row:', JSON.stringify(quotes[0], null, 2));
      }
    }

    // Check blog_subscribers table
    console.log('\n📡 Checking blog_subscribers table...');
    const { data: subscribers, error: subscribersError } = await supabase
      .from('blog_subscribers')
      .select('*')
      .limit(5);
    
    if (subscribersError) {
      console.log('❌ blog_subscribers error:', subscribersError.message);
    } else {
      console.log('✅ blog_subscribers accessible');
      console.log('  Rows found:', subscribers.length);
      if (subscribers.length > 0) {
        console.log('  Sample row:', JSON.stringify(subscribers[0], null, 2));
      }
    }

    // Check analytics_events table
    console.log('\n📡 Checking analytics_events table...');
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .limit(5);
    
    if (eventsError) {
      console.log('❌ analytics_events error:', eventsError.message);
    } else {
      console.log('✅ analytics_events accessible');
      console.log('  Rows found:', events.length);
      if (events.length > 0) {
        console.log('  Sample row:', JSON.stringify(events[0], null, 2));
      }
    }
    
    console.log('\n✅ Data check completed');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Run the test
checkTableData();