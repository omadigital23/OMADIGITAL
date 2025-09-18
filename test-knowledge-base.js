/**
 * Simple script to test knowledge base connection
 */

// Import required modules
const { createClient } = require('@supabase/supabase-js');

// Configuration
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testKnowledgeBase() {
  console.log('🔍 Testing Knowledge Base Connection...\n');
  
  try {
    // Test 1: Check if the table exists by querying its structure
    console.log('Test 1: Checking table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table query failed:', tableError.message);
      return false;
    }
    
    console.log('✅ Table exists and is accessible');
    console.log(`✅ Found ${tableData.length} entries (limited to 1 for testing)`);
    
    if (tableData.length > 0) {
      const firstEntry = tableData[0];
      console.log('Sample entry structure:');
      console.log('- id:', firstEntry.id ? '✓' : '✗');
      console.log('- title:', firstEntry.title ? '✓' : '✗');
      console.log('- content:', firstEntry.content ? '✓' : '✗');
      console.log('- category:', firstEntry.category ? '✓' : '✗');
      console.log('- language:', firstEntry.language ? '✓' : '✗');
    }
    
    // Test 2: Try a simple search query
    console.log('\nTest 2: Testing search functionality...');
    const { data: searchData, error: searchError } = await supabase
      .from('knowledge_base')
      .select('id, title, content, category, language')
      .eq('is_active', true)
      .limit(3);
    
    if (searchError) {
      console.error('❌ Search query failed:', searchError.message);
      return false;
    }
    
    console.log(`✅ Search query successful, found ${searchData.length} active entries`);
    
    // Test 3: Try a text search (if available)
    console.log('\nTest 3: Testing text search functionality...');
    try {
      const { data: textSearchData, error: textSearchError } = await supabase
        .from('knowledge_base')
        .select('id, title, content, category, language')
        .eq('is_active', true)
        .textSearch('content', 'services', { type: 'websearch' })
        .limit(2);
      
      if (textSearchError) {
        console.log('⚠️ Text search not available or failed:', textSearchError.message);
      } else {
        console.log(`✅ Text search successful, found ${textSearchData.length} entries matching "services"`);
      }
    } catch (textSearchException) {
      console.log('⚠️ Text search not supported in this environment');
    }
    
    console.log('\n🎉 All knowledge base tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Knowledge base connection failed:', error.message);
    return false;
  }
}

// Run the test
testKnowledgeBase().then(success => {
  if (!success) {
    process.exit(1);
  }
});