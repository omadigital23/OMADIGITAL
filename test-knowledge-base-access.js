/**
 * Test script to verify knowledge base access after fixing Supabase schema cache issues
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://osewplkvprtrlsrvegpl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testKnowledgeBaseAccess() {
  console.log('🔍 Testing knowledge base access...\n');

  try {
    // Test 1: Check if knowledge_base table exists and is accessible
    console.log('🧪 Test 1: Checking knowledge base table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('knowledge_base')
      .select('id, title, content, category, language')
      .limit(1);

    if (columnsError) {
      console.log('❌ Failed to access knowledge_base table:', columnsError.message);
      
      // Try a more basic query to see what's available
      console.log('\n🔄 Trying alternative query with just id...');
      const { data: idData, error: idError } = await supabase
        .from('knowledge_base')
        .select('id')
        .limit(1);
        
      if (idError) {
        console.log('❌ Even id column query failed:', idError.message);
        console.log('⚠️ This confirms the schema cache issue.');
        return false;
      } else {
        console.log('✅ Id column query succeeded');
        console.log('This suggests the table exists but specific columns are not cached properly.');
      }
      
      return false;
    }

    console.log('✅ Successfully accessed knowledge_base table');
    console.log('📋 Sample column structure verified\n');

    // Test 2: Check if we can retrieve actual data
    console.log('🧪 Test 2: Retrieving sample knowledge base entries...');
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id, title, category, language')
      .limit(5);

    if (error) {
      console.log('❌ Failed to retrieve data from knowledge_base:', error.message);
      return false;
    }

    console.log(`✅ Successfully retrieved ${data.length} knowledge base entries`);
    data.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title} (${item.category}, ${item.language})`);
    });

    // Test 3: Check if we can search in the knowledge base
    console.log('\n🧪 Test 3: Testing knowledge base search functionality...');
    const { data: searchData, error: searchError } = await supabase
      .from('knowledge_base')
      .select('id, title, content')
      .ilike('title', '%service%')
      .limit(3);

    if (searchError) {
      console.log('❌ Failed to search knowledge_base:', searchError.message);
      return false;
    }

    console.log(`✅ Successfully searched knowledge base, found ${searchData.length} matching entries`);
    
    if (searchData.length > 0) {
      console.log('📄 Sample search result:');
      console.log(`   Title: ${searchData[0].title}`);
      console.log(`   Content preview: ${searchData[0].content.substring(0, 100)}...`);
    }

    // Test 4: Check table count
    console.log('\n🧪 Test 4: Counting total knowledge base entries...');
    const { count, error: countError } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Failed to count knowledge base entries:', countError.message);
      return false;
    }

    console.log(`✅ Total knowledge base entries: ${count}`);

    // Test 5: Check for French and English content
    console.log('\n🧪 Test 5: Checking language distribution...');
    const { data: languageData, error: languageError } = await supabase
      .from('knowledge_base')
      .select('language', { count: 'exact' })
      .group('language');

    if (languageError) {
      console.log('❌ Failed to check language distribution:', languageError.message);
    } else {
      console.log('✅ Language distribution:');
      languageData.forEach(item => {
        console.log(`   ${item.language}: ${item.count} entries`);
      });
    }

    console.log('\n🎉 All tests passed! Knowledge base is accessible.');
    console.log('\n📝 Next steps:');
    console.log('1. Run the populate-services-knowledge.js script to add enhanced content');
    console.log('2. Test the chatbot with queries about services');
    console.log('3. Verify that the RAG system can access the knowledge base properly');

    return true;

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error.message);
    return false;
  }
}

// Run the test
testKnowledgeBaseAccess().then(success => {
  if (!success) {
    process.exit(1);
  }
});