const { createClient } = require('@supabase/supabase-js');

// Configuration using service role key for full access
const supabaseUrl = 'https://osewplkvprtrlsrvegpl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAndFixKnowledgeBase() {
  console.log('🔍 Verifying and potentially fixing knowledge base table structure...\n');

  try {
    // Test 1: Check if we can access specific columns
    console.log('🧪 Test 1: Testing access to specific columns...');
    
    const columnTests = [
      { name: 'id', query: supabase.from('knowledge_base').select('id').limit(1) },
      { name: 'title', query: supabase.from('knowledge_base').select('title').limit(1) },
      { name: 'content', query: supabase.from('knowledge_base').select('content').limit(1) },
      { name: 'category', query: supabase.from('knowledge_base').select('category').limit(1) },
      { name: 'language', query: supabase.from('knowledge_base').select('language').limit(1) },
      { name: 'keywords', query: supabase.from('knowledge_base').select('keywords').limit(1) },
      { name: 'is_active', query: supabase.from('knowledge_base').select('is_active').limit(1) }
    ];

    const results = {};
    
    for (const test of columnTests) {
      try {
        const { data, error } = await test.query;
        if (error) {
          console.log(`❌ Column '${test.name}' access failed: ${error.message}`);
          results[test.name] = false;
        } else {
          console.log(`✅ Column '${test.name}' accessible`);
          results[test.name] = true;
        }
      } catch (error) {
        console.log(`❌ Column '${test.name}' access failed with exception: ${error.message}`);
        results[test.name] = false;
      }
    }

    // Summary of column access
    console.log('\n📊 Column Access Summary:');
    const accessibleColumns = Object.entries(results).filter(([_, accessible]) => accessible).map(([name, _]) => name);
    const inaccessibleColumns = Object.entries(results).filter(([_, accessible]) => !accessible).map(([name, _]) => name);
    
    console.log(`✅ Accessible columns: [${accessibleColumns.join(', ')}]`);
    console.log(`❌ Inaccessible columns: [${inaccessibleColumns.join(', ')}]`);
    
    // Test 2: Try to insert a test record to verify table functionality
    console.log('\n🧪 Test 2: Testing insert functionality...');
    const testRecord = {
      title: 'Test Record for Schema Verification',
      content: 'This is a test record to verify the knowledge base table structure.',
      category: 'test',
      language: 'en',
      keywords: ['test', 'verification'],
      is_active: true
    };
    
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert(testRecord)
        .select();
        
      if (error) {
        console.log('❌ Insert test failed:', error.message);
        console.log('This confirms there is a schema mismatch issue.');
      } else {
        console.log('✅ Insert test succeeded');
        console.log('Test record inserted with ID:', data[0].id);
        
        // Clean up the test record
        await supabase
          .from('knowledge_base')
          .delete()
          .eq('id', data[0].id);
          
        console.log('✅ Test record cleaned up');
      }
    } catch (error) {
      console.log('❌ Insert test failed with exception:', error.message);
    }

    // Recommendations based on findings
    console.log('\n📋 Recommendations:');
    if (inaccessibleColumns.length > 0) {
      console.log('The Supabase schema cache issue is confirmed.');
      console.log('The knowledge_base table exists but some columns are not accessible due to schema cache problems.');
      console.log('\n🔧 To fix this issue:');
      console.log('1. Ensure Docker is running');
      console.log('2. Run: npx supabase stop');
      console.log('3. Run: npx supabase start');
      console.log('4. Run: npx supabase link --project-ref osewplkvprtrlsrvegpl');
      console.log('5. Run: npx supabase migration up');
      console.log('\nIf the above steps fail, manually verify the table structure in the Supabase dashboard.');
    } else {
      console.log('✅ All columns are accessible. The schema cache issue may be resolved.');
    }

    return inaccessibleColumns.length === 0;

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the verification
verifyAndFixKnowledgeBase().then(success => {
  if (!success) {
    console.log('\n⚠️ Knowledge base verification found issues.');
    process.exit(1);
  } else {
    console.log('\n✅ Knowledge base verification completed successfully!');
  }
});