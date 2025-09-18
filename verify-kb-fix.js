const { createClient } = require('@supabase/supabase-js');

// Configuration using service role key for full access
const supabaseUrl = 'https://osewplkvprtrlsrvegpl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyKnowledgeBaseFix() {
  console.log('🔍 Verifying knowledge base schema fix...\n');

  try {
    // Test 1: Check if we can access all the previously missing columns
    console.log('🧪 Test 1: Testing access to all required columns...');
    
    const columnTests = [
      { name: 'id', query: supabase.from('knowledge_base').select('id').limit(1) },
      { name: 'title', query: supabase.from('knowledge_base').select('title').limit(1) },
      { name: 'content', query: supabase.from('knowledge_base').select('content').limit(1) },
      { name: 'category', query: supabase.from('knowledge_base').select('category').limit(1) },
      { name: 'language', query: supabase.from('knowledge_base').select('language').limit(1) },
      { name: 'keywords', query: supabase.from('knowledge_base').select('keywords').limit(1) },
      { name: 'embedding', query: supabase.from('knowledge_base').select('embedding').limit(1) },
      { name: 'metadata', query: supabase.from('knowledge_base').select('metadata').limit(1) },
      { name: 'is_active', query: supabase.from('knowledge_base').select('is_active').limit(1) },
      { name: 'created_at', query: supabase.from('knowledge_base').select('created_at').limit(1) },
      { name: 'updated_at', query: supabase.from('knowledge_base').select('updated_at').limit(1) }
    ];

    let allPassed = true;
    
    for (const test of columnTests) {
      try {
        const { data, error } = await test.query;
        if (error) {
          console.log(`❌ Column '${test.name}' access failed: ${error.message}`);
          allPassed = false;
        } else {
          console.log(`✅ Column '${test.name}' accessible`);
        }
      } catch (error) {
        console.log(`❌ Column '${test.name}' access failed with exception: ${error.message}`);
        allPassed = false;
      }
    }

    // Test 2: Try to insert a test record with all required fields
    console.log('\n🧪 Test 2: Testing insert functionality with all fields...');
    const testRecord = {
      title: 'Test Record for Schema Verification',
      content: 'This is a test record to verify the knowledge base table structure.',
      category: 'test',
      language: 'en',
      keywords: ['test', 'verification'],
      embedding: Array(1536).fill(0), // Mock embedding vector
      metadata: { source: 'verification_test', version: '1.0' },
      is_active: true
    };
    
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert(testRecord)
        .select();
        
      if (error) {
        console.log('❌ Insert test failed:', error.message);
        allPassed = false;
      } else {
        console.log('✅ Insert test succeeded');
        console.log('Test record inserted with ID:', data[0].id);
        
        // Clean up the test record
        const { error: deleteError } = await supabase
          .from('knowledge_base')
          .delete()
          .eq('id', data[0].id);
          
        if (deleteError) {
          console.log('⚠️ Warning: Could not clean up test record:', deleteError.message);
        } else {
          console.log('✅ Test record cleaned up');
        }
      }
    } catch (error) {
      console.log('❌ Insert test failed with exception:', error.message);
      allPassed = false;
    }

    // Test 3: Run the original failing query
    console.log('\n🧪 Test 3: Testing the original failing query...');
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('id, title, content, category, language')
        .limit(1);

      if (error) {
        console.log('❌ Original query still failing:', error.message);
        allPassed = false;
      } else {
        console.log('✅ Original query now working!');
        if (data.length > 0) {
          console.log('Sample data:', JSON.stringify(data[0], null, 2));
        } else {
          console.log('Table is empty but query works');
        }
      }
    } catch (error) {
      console.log('❌ Original query failed with exception:', error.message);
      allPassed = false;
    }

    // Final result
    console.log('\n📋 Final Verification Result:');
    if (allPassed) {
      console.log('🎉 SUCCESS! The Supabase schema cache issue has been resolved!');
      console.log('✅ All required columns are now accessible');
      console.log('✅ Insert operations work correctly');
      console.log('✅ The original failing query now works');
      return true;
    } else {
      console.log('❌ FAILURE! The issue is not fully resolved yet.');
      console.log('Please check the error messages above and ensure all columns were added correctly.');
      return false;
    }

  } catch (error) {
    console.error('❌ Unexpected error during verification:', error.message);
    return false;
  }
}

// Run the verification
verifyKnowledgeBaseFix().then(success => {
  if (!success) {
    console.log('\n⚠️ Verification failed. Please review the issues above.');
    process.exit(1);
  } else {
    console.log('\n✅ Knowledge base schema fix verification completed successfully!');
    console.log('The Supabase schema cache issue has been resolved.');
  }
});