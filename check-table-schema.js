const { createClient } = require('@supabase/supabase-js');

// Configuration with service role key for full access
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function checkTableSchema() {
  console.log('🔍 Checking table schemas...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');

    // Check chatbot_interactions table schema
    console.log('\n📡 Checking chatbot_interactions schema...');
    const { data: interactionsSchema, error: interactionsError } = await supabase
      .from('chatbot_interactions')
      .select('*')
      .limit(1);
    
    if (interactionsError) {
      console.log('❌ chatbot_interactions schema error:', interactionsError.message);
    } else {
      console.log('✅ chatbot_interactions columns:');
      if (interactionsSchema.length > 0) {
        const columns = Object.keys(interactionsSchema[0]);
        columns.forEach(col => console.log('  -', col));
      }
    }

    // Check quotes table schema
    console.log('\n📡 Checking quotes schema...');
    const { data: quotesSchema, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(1);
    
    if (quotesError) {
      console.log('❌ quotes schema error:', quotesError.message);
    } else {
      console.log('✅ quotes columns:');
      if (quotesSchema.length > 0) {
        const columns = Object.keys(quotesSchema[0]);
        columns.forEach(col => console.log('  -', col));
      }
    }

    // Check blog_subscribers table schema
    console.log('\n📡 Checking blog_subscribers schema...');
    const { data: subscribersSchema, error: subscribersError } = await supabase
      .from('blog_subscribers')
      .select('*')
      .limit(1);
    
    if (subscribersError) {
      console.log('❌ blog_subscribers schema error:', subscribersError.message);
    } else {
      console.log('✅ blog_subscribers columns:');
      if (subscribersSchema.length > 0) {
        const columns = Object.keys(subscribersSchema[0]);
        columns.forEach(col => console.log('  -', col));
      }
    }

    // Check analytics_events table schema
    console.log('\n📡 Checking analytics_events schema...');
    const { data: eventsSchema, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .limit(1);
    
    if (eventsError) {
      console.log('❌ analytics_events schema error:', eventsError.message);
    } else {
      console.log('✅ analytics_events columns:');
      if (eventsSchema.length > 0) {
        const columns = Object.keys(eventsSchema[0]);
        columns.forEach(col => console.log('  -', col));
      }
    }
    
    console.log('\n✅ Schema check completed');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

// Run the test
checkTableSchema();