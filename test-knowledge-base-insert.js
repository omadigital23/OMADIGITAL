/**
 * Simple script to test inserting data into the knowledge base
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration with new credentials
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function testKnowledgeBaseInsert() {
  console.log('🔍 Testing knowledge base insert...');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with new credentials
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    console.log(`📍 URL: ${supabaseUrl}`);

    // Test inserting a simple record into knowledge_base
    console.log('\n💾 Testing knowledge base insert...');
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .insert({
        title: 'Test Entry',
        content: 'This is a test entry to verify database connectivity.',
        category: 'test',
        language: 'en',
        keywords: ['test', 'verification'],
        is_active: true
      })
      .select();

    if (error) {
      console.log('❌ Insert failed:', error.message);
      return false;
    } else {
      console.log('✅ Insert successful!');
      console.log('📝 Inserted record ID:', data[0].id);
      
      // Try to delete the test record
      const { error: deleteError } = await supabase
        .from('knowledge_base')
        .delete()
        .eq('id', data[0].id);
        
      if (deleteError) {
        console.log('❌ Cleanup failed:', deleteError.message);
      } else {
        console.log('✅ Cleanup successful!');
      }
      
      return true;
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the test if called directly
if (require.main === module) {
  testKnowledgeBaseInsert()
    .then(success => {
      if (success) {
        console.log('\n🎉 Knowledge base test successful!');
      } else {
        console.log('\n💥 Knowledge base test failed.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testKnowledgeBaseInsert };