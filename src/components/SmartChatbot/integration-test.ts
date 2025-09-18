/**
 * SCRIPT DE TEST - Validation des Améliorations RAG/STT/TTS
 * À exécuter pour vérifier le bon fonctionnement de toutes les améliorations
 */

// Test de l'environnement et des credentials
export async function testEnvironmentSetup(): Promise<boolean> {
  console.log('🔍 Testing environment setup...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'GOOGLE_AI_API_KEY',
    'HUGGINGFACE_API_KEY'
  ];

  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing);
    return false;
  }
  
  console.log('✅ All environment variables present');
  return true;
}

// Test de la connexion Supabase et structure knowledge_base
export async function testSupabaseConnection(): Promise<boolean> {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test de connexion
    const { data, error, count } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }

    console.log(`✅ Supabase connected - ${count} documents in knowledge_base`);
    
    // Vérification de la structure
    if (data && data.length > 0) {
      const requiredColumns = ['id', 'title', 'content', 'embedding', 'language', 'keywords'];
      const availableColumns = Object.keys(data[0]);
      const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
      
      if (missingColumns.length > 0) {
        console.warn('⚠️ Missing columns in knowledge_base:', missingColumns);
      } else {
        console.log('✅ Knowledge base structure is correct');
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return false;
  }
}

// Test du RAG Enhanced
export async function testEnhancedRAG(): Promise<boolean> {
  console.log('🔍 Testing Enhanced RAG system...');
  
  try {
    const { enhancedRAG } = await import('../../lib/rag-enhanced-optimized');
    
    // Test de recherche sémantique
    const testQueries = [
      'automatisation WhatsApp',
      'site web moderne',
      'prix et tarifs'
    ];

    for (const query of testQueries) {
      console.log(`🔍 Testing query: "${query}"`);
      
      const results = await enhancedRAG.searchSemantic(query, 'fr', 2);
      console.log(`📊 Found ${results.length} documents`);
      
      if (results.length > 0) {
        console.log(`📄 Top result: ${results[0].title} (similarity: ${results[0].similarity.toFixed(3)})`);
      }
    }

    console.log('✅ Enhanced RAG test completed');
    return true;
  } catch (error) {
    console.error('❌ Enhanced RAG test failed:', error);
    return false;
  }
}

// Test des APIs IA
export async function testAIAPIs(): Promise<boolean> {
  console.log('🔍 Testing AI APIs...');
  
  // Test Gemini API
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, this is a test.' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    if (response.ok) {
      console.log('✅ Gemini API is working');
    } else {
      console.error('❌ Gemini API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Gemini API test failed:', error);
    return false;
  }

  // Test Hugging Face API
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: "test" })
    });

    if (response.status === 200 || response.status === 503) { // 503 = model loading
      console.log('✅ Hugging Face API is accessible');
    } else {
      console.error('❌ Hugging Face API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Hugging Face API test failed:', error);
    return false;
  }

  return true;
}

// Test complet du système
export async function runCompleteTest(): Promise<void> {
  console.log('🚀 Starting Complete Integration Test...');
  console.log('==========================================\n');

  const tests = [
    { name: 'Environment Setup', fn: testEnvironmentSetup },
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'Enhanced RAG', fn: testEnhancedRAG },
    { name: 'AI APIs', fn: testAIAPIs }
  ];

  const results: { name: string; success: boolean }[] = [];

  for (const test of tests) {
    try {
      const success = await test.fn();
      results.push({ name: test.name, success });
      console.log(''); // Ligne vide entre les tests
    } catch (error) {
      console.error(`❌ Test ${test.name} crashed:`, error);
      results.push({ name: test.name, success: false });
    }
  }

  // Résumé final
  console.log('📊 TEST SUMMARY');
  console.log('===============');
  
  let allPassed = true;
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (!result.success) allPassed = false;
  });

  console.log(''); // Ligne vide
  
  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED - Enhanced Chatbot Ready!');
    console.log('🚀 Next steps:');
    console.log('1. Execute SQL function in Supabase (supabase/functions/match_documents.sql)');
    console.log('2. Replace existing chatbot component with enhanced version');
    console.log('3. Test in development environment');
    console.log('4. Deploy to production');
  } else {
    console.log('⚠️ SOME TESTS FAILED - Please fix the issues above');
    console.log('🔧 Check your .env.local configuration');
    console.log('🔧 Verify Supabase credentials and table structure');
    console.log('🔧 Confirm API keys are valid');
  }
}

// Export pour utilisation directe
if (typeof window === 'undefined' && require.main === module) {
  runCompleteTest().catch(console.error);
}