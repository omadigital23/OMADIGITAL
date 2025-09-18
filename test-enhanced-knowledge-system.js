#!/usr/bin/env node

/**
 * Test Enhanced Knowledge System
 * Comprehensive testing of the Supabase cache fix and enhanced knowledge base
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  db: { schema: 'public' },
  global: {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }
});

// Test queries to validate the enhanced knowledge system
const testQueries = [
  // French queries
  { query: 'automatisation whatsapp', language: 'fr', expectedCategory: 'services' },
  { query: 'prix tarif', language: 'fr', expectedCategory: 'services' },
  { query: 'contact téléphone', language: 'fr', expectedCategory: 'contact' },
  { query: 'restaurant livraison', language: 'fr', expectedCategory: 'use_cases' },
  { query: 'sécurité données', language: 'fr', expectedCategory: 'technical' },
  { query: 'questions fréquentes', language: 'fr', expectedCategory: 'faq' },
  
  // English queries
  { query: 'whatsapp automation', language: 'en', expectedCategory: 'services' },
  { query: 'price cost', language: 'en', expectedCategory: 'services' },
  { query: 'contact phone', language: 'en', expectedCategory: 'contact' },
  { query: 'website development', language: 'en', expectedCategory: 'services' },
  { query: 'mobile app', language: 'en', expectedCategory: 'services' },
  
  // Edge cases
  { query: 'orange money wave', language: 'fr', expectedCategory: 'services' },
  { query: 'roi return investment', language: 'en', expectedCategory: 'services' },
  { query: 'formation training', language: 'fr', expectedCategory: 'faq' }
];

async function testEnhancedKnowledgeSystem() {
  console.log('🧪 Testing Enhanced Knowledge System...\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = [];

  try {
    // Test 1: Database Connection
    console.log('📡 Test 1: Database Connection');
    try {
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('count(*)')
        .limit(1);

      if (error) {
        console.error('❌ Database connection failed:', error.message);
        failedTests.push('Database Connection');
      } else {
        console.log('✅ Database connection successful');
        passedTests++;
      }
    } catch (error) {
      console.error('❌ Database connection error:', error.message);
      failedTests.push('Database Connection');
    }
    totalTests++;

    // Test 2: Knowledge Base Population
    console.log('\n📚 Test 2: Knowledge Base Population');
    try {
      const { data: frenchItems, error: frenchError } = await supabase
        .from('knowledge_base')
        .select('count(*)')
        .eq('language', 'fr')
        .eq('is_active', true);

      const { data: englishItems, error: englishError } = await supabase
        .from('knowledge_base')
        .select('count(*)')
        .eq('language', 'en')
        .eq('is_active', true);

      if (frenchError || englishError) {
        console.error('❌ Knowledge base query failed:', frenchError || englishError);
        failedTests.push('Knowledge Base Population');
      } else {
        const frenchCount = frenchItems?.[0]?.count || 0;
        const englishCount = englishItems?.[0]?.count || 0;
        const totalCount = frenchCount + englishCount;

        console.log(`📊 Knowledge base items found:`);
        console.log(`   • French items: ${frenchCount}`);
        console.log(`   • English items: ${englishCount}`);
        console.log(`   • Total items: ${totalCount}`);

        if (totalCount > 0) {
          console.log('✅ Knowledge base populated successfully');
          passedTests++;
        } else {
          console.error('❌ Knowledge base is empty');
          failedTests.push('Knowledge Base Population');
        }
      }
    } catch (error) {
      console.error('❌ Knowledge base population test error:', error.message);
      failedTests.push('Knowledge Base Population');
    }
    totalTests++;

    // Test 3: Search Functionality
    console.log('\n🔍 Test 3: Search Functionality');
    let searchTestsPassed = 0;
    let searchTestsTotal = testQueries.length;

    for (let i = 0; i < testQueries.length; i++) {
      const test = testQueries[i];
      console.log(`\n   Testing query ${i + 1}/${testQueries.length}: "${test.query}" (${test.language})`);

      try {
        // Test multiple search methods
        const searchMethods = [
          // Text search
          supabase
            .from('knowledge_base')
            .select('*')
            .eq('language', test.language)
            .eq('is_active', true)
            .textSearch('content', test.query, { type: 'websearch' })
            .limit(3),

          // Keyword search
          supabase
            .from('knowledge_base')
            .select('*')
            .eq('language', test.language)
            .eq('is_active', true)
            .contains('keywords', [test.query.split(' ')[0]])
            .limit(3),

          // Title search
          supabase
            .from('knowledge_base')
            .select('*')
            .eq('language', test.language)
            .eq('is_active', true)
            .ilike('title', `%${test.query.split(' ')[0]}%`)
            .limit(3)
        ];

        const results = await Promise.allSettled(searchMethods);
        let foundResults = false;
        let totalResults = 0;

        results.forEach((result, index) => {
          const methodNames = ['Text Search', 'Keyword Search', 'Title Search'];
          if (result.status === 'fulfilled' && result.value.data && result.value.data.length > 0) {
            console.log(`      ✅ ${methodNames[index]}: ${result.value.data.length} results`);
            totalResults += result.value.data.length;
            foundResults = true;
          } else if (result.status === 'fulfilled') {
            console.log(`      ⚪ ${methodNames[index]}: 0 results`);
          } else {
            console.log(`      ❌ ${methodNames[index]}: Error - ${result.reason?.message || 'Unknown error'}`);
          }
        });

        if (foundResults) {
          console.log(`   ✅ Query "${test.query}" found ${totalResults} total results`);
          searchTestsPassed++;
        } else {
          console.log(`   ❌ Query "${test.query}" found no results`);
        }

      } catch (error) {
        console.error(`   ❌ Search error for "${test.query}":`, error.message);
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Search tests summary: ${searchTestsPassed}/${searchTestsTotal} passed`);
    
    if (searchTestsPassed > searchTestsTotal * 0.7) { // 70% pass rate
      console.log('✅ Search functionality test passed');
      passedTests++;
    } else {
      console.log('❌ Search functionality test failed');
      failedTests.push('Search Functionality');
    }
    totalTests++;

    // Test 4: Schema Cache Validation
    console.log('\n🗄️ Test 4: Schema Cache Validation');
    try {
      const tables = ['knowledge_base', 'conversations', 'messages'];
      let schemaTestsPassed = 0;

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);

          if (error) {
            console.log(`   ❌ Table "${table}": ${error.message}`);
          } else {
            console.log(`   ✅ Table "${table}": Accessible`);
            schemaTestsPassed++;
          }
        } catch (tableError) {
          console.log(`   ❌ Table "${table}": ${tableError.message}`);
        }
      }

      if (schemaTestsPassed === tables.length) {
        console.log('✅ Schema cache validation passed');
        passedTests++;
      } else {
        console.log(`❌ Schema cache validation failed (${schemaTestsPassed}/${tables.length} tables accessible)`);
        failedTests.push('Schema Cache Validation');
      }
    } catch (error) {
      console.error('❌ Schema cache validation error:', error.message);
      failedTests.push('Schema Cache Validation');
    }
    totalTests++;

    // Test 5: Performance Test
    console.log('\n⚡ Test 5: Performance Test');
    try {
      const startTime = Date.now();
      
      const performanceQueries = [
        supabase.from('knowledge_base').select('*').eq('language', 'fr').limit(10),
        supabase.from('knowledge_base').select('*').eq('language', 'en').limit(10),
        supabase.from('knowledge_base').select('*').eq('is_active', true).limit(20)
      ];

      await Promise.all(performanceQueries);
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`   Query duration: ${duration}ms`);

      if (duration < 2000) { // Less than 2 seconds
        console.log('✅ Performance test passed');
        passedTests++;
      } else {
        console.log('❌ Performance test failed (queries too slow)');
        failedTests.push('Performance Test');
      }
    } catch (error) {
      console.error('❌ Performance test error:', error.message);
      failedTests.push('Performance Test');
    }
    totalTests++;

    // Final Results
    console.log('\n' + '='.repeat(60));
    console.log('📊 ENHANCED KNOWLEDGE SYSTEM TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${totalTests - passedTests} ❌`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => console.log(`   • ${test}`));
    }

    if (passedTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! Enhanced knowledge system is working perfectly.');
    } else if (passedTests >= totalTests * 0.8) {
      console.log('\n✅ Most tests passed. System is functional with minor issues.');
    } else {
      console.log('\n⚠️ Several tests failed. System needs attention.');
    }

    console.log('\n📝 Next Steps:');
    console.log('1. Run the enhanced knowledge population script if needed');
    console.log('2. Test the chatbot with real queries');
    console.log('3. Monitor response quality and relevance');
    console.log('4. Update knowledge base content as needed');

  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
    process.exit(1);
  }
}

// Run the test
testEnhancedKnowledgeSystem();