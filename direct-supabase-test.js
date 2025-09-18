/**
 * Direct Supabase connection test script
 * Bypasses local Supabase CLI and connects directly to the remote database
 */

const { createClient } = require('@supabase/supabase-js');

// Direct connection to remote Supabase project
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectConnection() {
  console.log('🔍 Testing direct Supabase connection...\n');

  try {
    // Test 1: Check if we can access the database directly
    console.log('🧪 Test 1: Checking direct database connection...');
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id')
      .limit(1);

    if (error) {
      console.log('❌ Direct connection failed:', error.message);
      
      // Try a more basic query to see what's available
      console.log('\n🔄 Trying alternative query...');
      const { data: tables, error: tablesError } = await supabase
        .from('knowledge_base')
        .select('*')
        .limit(1);
      
      if (tablesError) {
        console.log('❌ Alternative query also failed:', tablesError.message);
        return false;
      }
      
      console.log('✅ Alternative query succeeded');
      return true;
    }

    console.log('✅ Direct connection successful');
    console.log(`📊 Retrieved ${data ? data.length : 0} records\n`);

    // Test 2: Check table structure with a more detailed query
    console.log('🧪 Test 2: Checking table structure...');
    const { data: structure, error: structureError } = await supabase
      .from('knowledge_base')
      .select(`
        id,
        title,
        content,
        category,
        language,
        keywords,
        is_active,
        created_at,
        updated_at
      `)
      .limit(1);

    if (structureError) {
      console.log('❌ Table structure query failed:', structureError.message);
      
      // Try querying information schema directly
      console.log('\n🔄 Checking information schema...');
      const { data: schema, error: schemaError } = await supabase
        .rpc('execute_sql', {
          sql: `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'knowledge_base'
            ORDER BY ordinal_position
          `
        });

      if (schemaError) {
        console.log('❌ Information schema query failed:', schemaError.message);
        return false;
      }

      console.log('✅ Information schema query succeeded');
      console.log('📋 Table columns:');
      schema.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type})`);
      });
      
      return true;
    }

    console.log('✅ Table structure verified');
    if (structure && structure.length > 0) {
      console.log('📄 Sample record:');
      Object.keys(structure[0]).forEach(key => {
        console.log(`   ${key}: ${JSON.stringify(structure[0][key]).substring(0, 50)}${JSON.stringify(structure[0][key]).length > 50 ? '...' : ''}`);
      });
    }

    // Test 3: Count total records
    console.log('\n🧪 Test 3: Counting total records...');
    const { count, error: countError } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Count query failed:', countError.message);
      return false;
    }

    console.log(`✅ Total records in knowledge_base: ${count}`);

    console.log('\n🎉 All direct connection tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. The database is accessible directly');
    console.log('2. The schema cache issue is likely with the local Supabase CLI');
    console.log('3. Try restarting Docker and Supabase services');
    console.log('4. If issues persist, populate the knowledge base manually via the Supabase dashboard');

    return true;

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error.message);
    return false;
  }
}

// Run the test
testDirectConnection().then(success => {
  if (!success) {
    process.exit(1);
  }
});