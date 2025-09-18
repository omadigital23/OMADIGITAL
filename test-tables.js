// Script to test if tables were created properly
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const projectId = 'osewplkvprtrlsrvegpl';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  try {
    console.log('Testing tables...');
    
    // Test quotes table
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('count')
      .limit(1);
    
    if (quotesError) {
      console.error('Quotes table error:', quotesError.message);
    } else {
      console.log('✅ Quotes table accessible');
    }
    
    // Test conversations table
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);
    
    if (convError) {
      console.error('Conversations table error:', convError.message);
    } else {
      console.log('✅ Conversations table accessible');
    }
    
    // Test user_roles table
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1);
    
    if (rolesError) {
      console.error('User roles table error:', rolesError.message);
    } else {
      console.log('✅ User roles table accessible');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
testTables();