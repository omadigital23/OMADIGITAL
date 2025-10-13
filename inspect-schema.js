const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function inspectSchema() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Inspecting database schema...\n');

  // Check cta_actions table structure
  console.log('=== cta_actions table ===');
  try {
    const { data, error } = await supabase
      .from('cta_actions')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying cta_actions:', error.message);
    } else if (data && data.length > 0) {
      console.log('Columns in cta_actions:');
      Object.keys(data[0]).forEach(col => console.log(`  - ${col}`));
    } else {
      console.log('No data found in cta_actions');
    }
  } catch (err) {
    console.error('Exception querying cta_actions:', err.message);
  }

  console.log('\n=== chatbot_conversations table ===');
  try {
    const { data, error } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying chatbot_conversations:', error.message);
    } else if (data && data.length > 0) {
      console.log('Columns in chatbot_conversations:');
      Object.keys(data[0]).forEach(col => console.log(`  - ${col}`));
    } else {
      console.log('No data found in chatbot_conversations');
    }
  } catch (err) {
    console.error('Exception querying chatbot_conversations:', err.message);
  }

  console.log('\n=== messages table ===');
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying messages:', error.message);
    } else if (data && data.length > 0) {
      console.log('Columns in messages:');
      Object.keys(data[0]).forEach(col => console.log(`  - ${col}`));
    } else {
      console.log('No data found in messages');
    }
  } catch (err) {
    console.error('Exception querying messages:', err.message);
  }
}

inspectSchema();