#!/usr/bin/env node

/**
 * Test direct de l'architecture conversationnelle
 * Teste les modules directement sans serveur HTTP
 */

// Simuler l'environnement Next.js
process.env.NODE_ENV = 'development';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://pcedyohixahtfogfdlig.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzcyMzksImV4cCI6MjA3Mjk1MzIzOX0.OT-zQbg0Q8BzupmUzQH9xNL8aRCKNO73onKlsaLaE30';

console.log('🏗️  TEST DIRECT DE L\'ARCHITECTURE CONVERSATIONNELLE');
console.log('═'.repeat(60));

async function testRAGSystem() {
  console.log('🧪 Test du système RAG ultra-intelligent...\n');

  try {
    // Importer le module RAG
    const { ultraIntelligentRAG } = require('./src/lib/ultra-intelligent-rag.ts');
    
    console.log('✅ Module RAG importé avec succès');

    const testCases = [
      {
        message: 'hello',
        testName: 'Salutation anglaise simple',
        expectedLanguage: 'en'
      },
      {
        message: 'bonjour',
        testName: 'Salutation française simple',
        expectedLanguage: 'fr'
      },
      {
        message: 'Hello, can you tell me about your WhatsApp automation?',
        testName: 'Question WhatsApp en anglais',
        expectedLanguage: 'en'
      },
      {
        message: 'Bonjour, pouvez-vous me parler de l\'automatisation WhatsApp ?',
        testName: 'Question WhatsApp en français',
        expectedLanguage: 'fr'
      }
    ];

    let results = {
      total: testCases.length,
      passed: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🧪 TEST ${i + 1}/${testCases.length}: ${testCase.testName}`);
      console.log('─'.repeat(40));
      console.log(`📝 Message: "${testCase.message}"`);

      try {
        const startTime = Date.now();
        
        // Tester le processMessage
        const result = await ultraIntelligentRAG.processMessage(
          testCase.message,
          `test_session_${Date.now()}`,
          'text'
        );

        const processingTime = Date.now() - startTime;

        console.log(`📤 Réponse: "${result.response.substring(0, 100)}..."`);
        console.log(`🌍 Langue: ${result.language}`);
        console.log(`🎯 Source: ${result.source}`);
        console.log(`📊 Confiance: ${result.confidence}`);
        console.log(`⏱️  Temps: ${processingTime}ms`);
        
        if (result.suggestions && result.suggestions.length > 0) {
          console.log(`💡 Suggestions: ${result.suggestions.slice(0, 3).join(', ')}...`);
        }
        
        if (result.cta) {
          console.log(`🔗 CTA: ${result.cta.action || 'Aucun'}`);
        }

        // Analyser la langue de la réponse
        const responseLanguage = analyzeResponseLanguage(result.response);
        console.log(`🔍 Langue analysée: ${responseLanguage}`);

        // Vérifier la cohérence
        const isCorrect = responseLanguage === testCase.expectedLanguage;
        console.log(`${isCorrect ? '✅' : '❌'} Cohérence: ${isCorrect ? 'CORRECTE' : 'INCORRECTE'}`);

        if (isCorrect) {
          results.passed++;
        } else {
          results.failed++;
          results.errors.push(`${testCase.testName}: Attendu ${testCase.expectedLanguage}, reçu ${responseLanguage}`);
        }

      } catch (error) {
        console.log(`❌ ERREUR: ${error.message}`);
        results.failed++;
        results.errors.push(`${testCase.testName}: ${error.message}`);
      }

      // Pause entre les tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Résumé
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RÉSUMÉ DU TEST DIRECT');
    console.log('═'.repeat(60));
    console.log(`✅ Tests réussis: ${results.passed}/${results.total} (${Math.round((results.passed/results.total)*100)}%)`);
    console.log(`❌ Tests échoués: ${results.failed}/${results.total}`);

    if (results.errors.length > 0) {
      console.log('\n🔍 ERREURS DÉTAILLÉES:');
      results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (results.passed === results.total) {
      console.log('\n🎉 PARFAIT! Architecture conversationnelle entièrement fonctionnelle!');
      console.log('✅ Délégation de langue à Gemini: SUCCÈS');
      console.log('✅ RAG bilingue: FONCTIONNEL');
      console.log('✅ Prompt maître: OPTIMISÉ');
    } else if (results.passed >= results.total * 0.75) {
      console.log('\n🟢 TRÈS BIEN! Architecture majoritairement fonctionnelle');
    } else {
      console.log('\n🟡 ATTENTION! Des améliorations sont nécessaires');
    }

    return results.passed === results.total;

  } catch (error) {
    console.error('❌ ERREUR CRITIQUE:', error.message);
    console.log('\n💡 SOLUTIONS POSSIBLES:');
    console.log('1. Vérifiez que les modules TypeScript sont compilés');
    console.log('2. Vérifiez les variables d\'environnement');
    console.log('3. Vérifiez la connexion Supabase');
    return false;
  }
}

function analyzeResponseLanguage(text) {
  const lowerText = text.toLowerCase();
  
  // Indicateurs français
  const frenchIndicators = [
    'bonjour', 'salut', 'je suis', 'nous sommes', 'comment puis-je',
    'nos services', 'contactez-nous', 'téléphone', 'gratuit', 'devis'
  ];
  
  // Indicateurs anglais
  const englishIndicators = [
    'hello', 'hi', 'i am', 'we are', 'how can i',
    'our services', 'contact us', 'phone', 'free', 'quote'
  ];
  
  let frenchScore = 0;
  let englishScore = 0;
  
  frenchIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      frenchScore += indicator.length;
    }
  });
  
  englishIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      englishScore += indicator.length;
    }
  });
  
  return englishScore > frenchScore ? 'en' : 'fr';
}

async function testPromptMaster() {
  console.log('\n🎯 Test du Prompt Maître...');
  
  try {
    const { MASTER_PROMPT } = require('./src/lib/prompts/master-prompt.ts');
    
    console.log('✅ Prompt maître importé');
    console.log(`📏 Longueur: ${MASTER_PROMPT.length} caractères`);
    
    // Vérifier les éléments clés
    const hasLanguageRules = MASTER_PROMPT.includes('Analyse toujours la langue');
    const hasRAGInstructions = MASTER_PROMPT.includes('Documents de référence');
    const hasCTAFormat = MASTER_PROMPT.includes('```json');
    const hasPlaceholders = MASTER_PROMPT.includes('{{retrieved_documents}}');
    
    console.log(`🌍 Règles de langue: ${hasLanguageRules ? '✅' : '❌'}`);
    console.log(`🧠 Instructions RAG: ${hasRAGInstructions ? '✅' : '❌'}`);
    console.log(`🔗 Format CTA: ${hasCTAFormat ? '✅' : '❌'}`);
    console.log(`📝 Placeholders: ${hasPlaceholders ? '✅' : '❌'}`);
    
    const allChecks = hasLanguageRules && hasRAGInstructions && hasCTAFormat && hasPlaceholders;
    console.log(`${allChecks ? '✅' : '❌'} Prompt maître: ${allChecks ? 'VALIDE' : 'INVALIDE'}`);
    
    return allChecks;
    
  } catch (error) {
    console.error('❌ Erreur prompt maître:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Démarrage des tests directs...\n');

  // Test 1: Prompt maître
  const promptValid = await testPromptMaster();
  
  // Test 2: Système RAG
  const ragWorking = await testRAGSystem();

  // Résumé final
  console.log('\n' + '═'.repeat(60));
  console.log('🏁 RÉSUMÉ FINAL DES TESTS');
  console.log('═'.repeat(60));
  console.log(`🎯 Prompt maître: ${promptValid ? '✅ VALIDE' : '❌ INVALIDE'}`);
  console.log(`🧠 Système RAG: ${ragWorking ? '✅ FONCTIONNEL' : '❌ DÉFAILLANT'}`);
  
  const overallSuccess = promptValid && ragWorking;
  console.log(`\n🎖️  STATUT GLOBAL: ${overallSuccess ? '✅ SUCCÈS COMPLET' : '❌ CORRECTIONS NÉCESSAIRES'}`);

  if (overallSuccess) {
    console.log('\n🎉 L\'architecture conversationnelle est prête!');
    console.log('💡 Vous pouvez maintenant démarrer le serveur et tester en conditions réelles');
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. npm run dev');
    console.log('2. Tester avec de vrais utilisateurs');
    console.log('3. Surveiller les analytics');
  } else {
    console.log('\n🔧 ACTIONS REQUISES:');
    if (!promptValid) console.log('- Corriger le prompt maître');
    if (!ragWorking) console.log('- Déboguer le système RAG');
  }

  process.exit(overallSuccess ? 0 : 1);
}

main().catch(console.error);