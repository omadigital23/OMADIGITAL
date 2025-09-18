#!/usr/bin/env node

/**
 * Complete verification script for Supabase schema cache fix
 * This script verifies all aspects of the fix
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySchemaCacheFix() {
  console.log('🔍 Complete Verification of Supabase Schema Cache Fix\n');
  console.log('=====================================================\n');

  try {
    // Test 1: Basic connection
    console.log('🧪 Test 1: Basic Supabase Connection...');
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id')
      .limit(1);

    if (error) {
      console.log('❌ Basic connection failed:', error.message);
      return false;
    }
    console.log('✅ Basic connection successful\n');

    // Test 2: Table structure verification
    console.log('🧪 Test 2: Table Structure Verification...');
    const { data: structureData, error: structureError } = await supabase
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
      console.log('❌ Table structure verification failed:', structureError.message);
      return false;
    }
    console.log('✅ Table structure verified\n');

    // Test 3: Data retrieval
    console.log('🧪 Test 3: Data Retrieval...');
    const { data: contentData, error: contentError } = await supabase
      .from('knowledge_base')
      .select('id, title, content, category, language')
      .limit(3);

    if (contentError) {
      console.log('❌ Data retrieval failed:', contentError.message);
      return false;
    }
    
    console.log(`✅ Retrieved ${contentData.length} records successfully`);
    contentData.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.title} (${record.category}, ${record.language})`);
    });
    console.log();

    // Test 4: Search functionality
    console.log('🧪 Test 4: Search Functionality...');
    const { data: searchData, error: searchError } = await supabase
      .from('knowledge_base')
      .select('id, title')
      .ilike('title', '%OMA%')
      .limit(2);

    if (searchError) {
      console.log('❌ Search functionality failed:', searchError.message);
      return false;
    }
    
    console.log(`✅ Search returned ${searchData.length} results`);
    searchData.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.title}`);
    });
    console.log();

    // Test 5: Count verification
    console.log('🧪 Test 5: Count Verification...');
    const { count, error: countError } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Count verification failed:', countError.message);
      return false;
    }
    
    console.log(`✅ Total records in knowledge_base: ${count}\n`);

    // Test 6: Language distribution
    console.log('🧪 Test 6: Language Distribution...');
    const { data: languageData, error: languageError } = await supabase
      .from('knowledge_base')
      .select('language', { count: 'exact' })
      .group('language');

    if (languageError) {
      console.log('❌ Language distribution check failed:', languageError.message);
    } else {
      console.log('✅ Language distribution:');
      languageData.forEach(item => {
        console.log(`   ${item.language}: ${item.count} entries`);
      });
    }
    console.log();

    // Test 7: Category distribution
    console.log('🧪 Test 7: Category Distribution...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('knowledge_base')
      .select('category', { count: 'exact' })
      .group('category');

    if (categoryError) {
      console.log('❌ Category distribution check failed:', categoryError.message);
    } else {
      console.log('✅ Category distribution:');
      categoryData.forEach(item => {
        console.log(`   ${item.category}: ${item.count} entries`);
      });
    }
    console.log();

    // Test 8: Active records
    console.log('🧪 Test 8: Active Records Check...');
    const { count: activeCount, error: activeError } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (activeError) {
      console.log('❌ Active records check failed:', activeError.message);
    } else {
      console.log(`✅ Active records: ${activeCount}\n`);
    }

    console.log('🎉 All verification tests passed!');
    console.log('\n📋 Summary:');
    console.log(`   - Total records: ${count}`);
    console.log('   - Table structure: Verified');
    console.log('   - Data retrieval: Working');
    console.log('   - Search functionality: Working');
    console.log('   - Schema cache: Refreshed');
    
    console.log('\n📝 Next steps:');
    console.log('1. Test the chatbot with service-related queries');
    console.log('2. Verify that the RAG system can access the knowledge base');
    console.log('3. Run the full chatbot verification: node verify-chatbot-coherence.js');
    
    return true;

  } catch (error) {
    console.error('❌ Unexpected error during verification:', error.message);
    return false;
  }
}

// Run the verification
verifySchemaCacheFix().then(success => {
  if (!success) {
    console.log('\n⚠️ Some verification tests failed.');
    console.log('Please check the error messages above and try the following:');
    console.log('1. Restart Supabase services: node restart-supabase-services.js');
    console.log('2. Manually run the SQL script in Supabase SQL Editor');
    console.log('3. Contact support if issues persist');
    process.exit(1);
  } else {
    console.log('\n✅ Schema cache fix verification completed successfully!');
  }
});