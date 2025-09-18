const { createClient } = require('@supabase/supabase-js');

// Configuration
const supabaseUrl = 'https://osewplkvprtrlsrvegpl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTA4NDcsImV4cCI6MjA3MTgyNjg0N30.V17cK4-ALQDtqEEH_tz1L4YtdVu9sru5ILhuIldUCzo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testKnowledgeBaseAccess() {
  console.log('🔍 Testing knowledge base access...\n');

  try {
    // Test 1: Basic connection and table access
    console.log('🧪 Test 1: Basic table access...');
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Basic table access failed:', error.message);
      console.log('Error details:', error);
      
      // Try a simpler query
      console.log('\n🔄 Trying simpler query...');
      const { data: simpleData, error: simpleError } = await supabase
        .from('knowledge_base')
        .select('id')
        .limit(1);
        
      if (simpleError) {
        console.log('❌ Even simple query failed:', simpleError.message);
        return false;
      } else {
        console.log('✅ Simple query succeeded');
        console.log('Data:', simpleData);
      }
    } else {
      console.log('✅ Basic table access successful');
      console.log('Data:', data);
    }

    // Test 2: Check table structure
    console.log('\n🧪 Test 2: Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('knowledge_base')
      .select('id, title, content, category, language')
      .limit(1);

    if (columnsError) {
      console.log('❌ Table structure check failed:', columnsError.message);
      console.log('This suggests a schema cache issue.');
      return false;
    } else {
      console.log('✅ Table structure verified');
      console.log('Sample data:', columns[0]);
    }

    console.log('\n🎉 All tests completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testKnowledgeBaseAccess().then(success => {
  if (!success) {
    console.log('\n⚠️ Knowledge base access test failed.');
    process.exit(1);
  } else {
    console.log('\n✅ Knowledge base access test completed successfully!');
  }
});