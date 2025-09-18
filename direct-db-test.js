const { createClient } = require('@supabase/supabase-js');

// Configuration using service role key for full access
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectDatabaseAccess() {
  console.log('🔍 Testing direct database access with service role key...\n');

  try {
    // Test 1: Check if we can access the knowledge_base table structure
    console.log('🧪 Test 1: Checking knowledge_base table structure...');
    
    // First, let's try to get column information directly
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'knowledge_base')
      .order('ordinal_position');

    if (columnsError) {
      console.log('❌ Failed to get column information:', columnsError.message);
    } else {
      console.log('✅ Successfully retrieved column information:');
      columns.forEach(column => {
        console.log(`   - ${column.column_name} (${column.data_type})`);
      });
    }

    // Test 2: Try to access the knowledge_base table directly
    console.log('\n🧪 Test 2: Accessing knowledge_base table...');
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Failed to access knowledge_base table:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
      
      // Try a more basic query
      console.log('\n🔄 Trying basic id query...');
      const { data: idData, error: idError } = await supabase
        .from('knowledge_base')
        .select('id')
        .limit(1);
        
      if (idError) {
        console.log('❌ Even basic id query failed:', idError.message);
        return false;
      } else {
        console.log('✅ Basic id query succeeded');
        console.log('Data:', idData);
      }
    } else {
      console.log('✅ Successfully accessed knowledge_base table');
      console.log('Data:', data);
    }

    // Test 3: Check if the table exists at all
    console.log('\n🧪 Test 3: Checking if knowledge_base table exists...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'knowledge_base');

    if (tablesError) {
      console.log('❌ Failed to check table existence:', tablesError.message);
    } else if (tables && tables.length > 0) {
      console.log('✅ knowledge_base table exists');
    } else {
      console.log('❌ knowledge_base table does not exist');
    }

    console.log('\n📋 Summary:');
    console.log('If the table exists but columns are missing, it indicates a schema cache issue.');
    console.log('If the table does not exist, it needs to be created with the proper migrations.');

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testDirectDatabaseAccess().then(success => {
  if (!success) {
    console.log('\n⚠️ Direct database access test encountered issues.');
    process.exit(1);
  } else {
    console.log('\n✅ Direct database access test completed.');
  }
});