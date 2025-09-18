// Check existing tables in Supabase
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase - using your actual credentials
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('Checking existing tables in Supabase...');
    
    // Try a different approach - list all tables using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'" 
    });
    
    if (error) {
      console.log('Error using RPC:', error);
      console.log('Let\'s try to access a known table...');
      
      // Try to access a known table like 'conversations' which seems to exist based on the error message
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .limit(1);
      
      if (convError) {
        console.error('Error accessing conversations table:', convError);
      } else {
        console.log('✅ Successfully accessed conversations table');
      }
      
      return;
    }
    
    console.log('✅ Successfully retrieved table list:');
    if (data && data.length > 0) {
      data.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
      
      // Check if chatbot_interactions exists
      const hasChatbotTable = data.some(table => table.table_name === 'chatbot_interactions');
      if (hasChatbotTable) {
        console.log('✅ chatbot_interactions table exists');
      } else {
        console.log('❌ chatbot_interactions table does not exist');
        console.log('You need to create it manually through the Supabase dashboard.');
      }
    } else {
      console.log('No tables found or empty result');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();