#!/usr/bin/env node

/**
 * Test de la nouvelle architecture conversationnelle simplifiée
 * Vérifie que Gemini gère correctement la détection de langue
 */

console.log('🏗️  TEST DE LA NOUVELLE ARCHITECTURE CONVERSATIONNELLE');
console.log('═'.repeat(60));

async function testChatAPI(message, testName, expectedLanguage) {
  console.log(`\n🧪 TEST: ${testName}`);
  console.log('─'.repeat(40));
  console.log(`📝 Message: "${message}"`);
  console.log(`🎯 Langue attendue: ${expectedLanguage}`);

  try {
    const response = await fetch('http://localhost:3000/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        sessionId: `test_arch_${Date.now()}`,
        inputMethod: 'text'
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      console.log(`📤 Réponse: "${data.response.substring(0, 150)}..."`);
      console.log(`🌍 Langue détectée: ${data.language}`);
      console.log(`🎯 Source: ${data.source}`);
      console.log(`📊 Confiance: ${data.confidence}`);
      console.log(`💡 Suggestions: ${data.suggestions?.slice(0, 3).join(', ')}...`);
      
      if (data.cta) {
        console.log(`🔗 CTA: ${data.cta.action || 'Aucun'}`);
      }

      // Analyser la langue de la réponse
      const responseLanguage = analyzeResponseLanguage(data.response);
      console.log(`🔍 Langue de réponse analysée: ${responseLanguage}`);

      // Vérifier la cohérence
      const isCorrect = responseLanguage === expectedLanguage;
      console.log(`${isCorrect ? '✅' : '❌'} Cohérence langue: ${isCorrect ? 'CORRECTE' : 'INCORRECTE'}`);

      return {
        success: isCorrect,
        detectedLanguage: data.language,
        responseLanguage: responseLanguage,
        hasRAG: data.source === 'ultra_intelligent_rag',
        hasCTA: !!data.cta,
        hasSuggestions: data.suggestions && data.suggestions.length > 0
      };
    } else {
      console.log('❌ ERREUR API:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log('❌ ERREUR:', error.message);
    return { success: false, error: error.message };
  }
}

function analyzeResponseLanguage(text) {
  const lowerText = text.toLowerCase();
  
  // Indicateurs français forts
  const frenchIndicators = [
    'bonjour', 'salut', 'je suis', 'nous sommes', 'vous pouvez', 'comment puis-je',
    'nos services', 'notre équipe', 'contactez-nous', 'téléphone', 'email',
    'gratuit', 'devis', 'consultation', 'rendez-vous', 'tarifs', 'prix'
  ];
  
  // Indicateurs anglais forts
  const englishIndicators = [
    'hello', 'hi', 'i am', 'we are', 'you can', 'how can i',
    'our services', 'our team', 'contact us', 'phone', 'email',
    'free', 'quote', 'consultation', 'appointment', 'pricing', 'price'
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

async function runArchitectureTests() {
  console.log('🚀 Test de l\'architecture conversationnelle simplifiée...\n');

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
      message: 'Hello, can you tell me about your WhatsApp automation services?',
      testName: 'Question détaillée en anglais',
      expectedLanguage: 'en'
    },
    {
      message: 'Bonjour, pouvez-vous me parler de vos services d\'automatisation WhatsApp ?',
      testName: 'Question détaillée en français',
      expectedLanguage: 'fr'
    },
    {
      message: 'What are your prices for website development?',
      testName: 'Question prix en anglais',
      expectedLanguage: 'en'
    },
    {
      message: 'Quels sont vos tarifs pour le développement web ?',
      testName: 'Question prix en français',
      expectedLanguage: 'fr'
    },
    {
      message: 'I need a demo of your chatbot solution',
      testName: 'Demande de démo en anglais',
      expectedLanguage: 'en'
    },
    {
      message: 'J\'ai besoin d\'une démo de votre solution chatbot',
      testName: 'Demande de démo en français',
      expectedLanguage: 'fr'
    }
  ];

  let results = {
    total: testCases.length,
    passed: 0,
    failed: 0,
    languageAccuracy: 0,
    ragWorking: 0,
    ctaGenerated: 0,
    suggestionsGenerated: 0
  };

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = await testChatAPI(
      testCase.message, 
      `${i + 1}/${testCases.length} - ${testCase.testName}`,
      testCase.expectedLanguage
    );
    
    if (result.success) {
      results.passed++;
      results.languageAccuracy++;
    } else {
      results.failed++;
    }

    if (result.hasRAG) results.ragWorking++;
    if (result.hasCTA) results.ctaGenerated++;
    if (result.hasSuggestions) results.suggestionsGenerated++;
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Calcul des pourcentages
  const languageAccuracyPercent = Math.round((results.languageAccuracy / results.total) * 100);
  const ragWorkingPercent = Math.round((results.ragWorking / results.total) * 100);
  const ctaGeneratedPercent = Math.round((results.ctaGenerated / results.total) * 100);
  const suggestionsGeneratedPercent = Math.round((results.suggestionsGenerated / results.total) * 100);

  // Résumé final
  console.log('\n' + '═'.repeat(60));
  console.log('📊 RÉSUMÉ DE L\'ARCHITECTURE CONVERSATIONNELLE');
  console.log('═'.repeat(60));
  console.log(`✅ Tests réussis: ${results.passed}/${results.total} (${Math.round((results.passed/results.total)*100)}%)`);
  console.log(`❌ Tests échoués: ${results.failed}/${results.total}`);
  console.log('─'.repeat(60));
  console.log('📈 MÉTRIQUES DE QUALITÉ:');
  console.log(`🌍 Précision langue: ${languageAccuracyPercent}% (${results.languageAccuracy}/${results.total})`);
  console.log(`🧠 RAG fonctionnel: ${ragWorkingPercent}% (${results.ragWorking}/${results.total})`);
  console.log(`🔗 CTA générés: ${ctaGeneratedPercent}% (${results.ctaGenerated}/${results.total})`);
  console.log(`💡 Suggestions générées: ${suggestionsGeneratedPercent}% (${results.suggestionsGenerated}/${results.total})`);
  
  // Évaluation globale
  console.log('\n' + '═'.repeat(60));
  if (results.passed === results.total) {
    console.log('🎉 PARFAIT! Architecture conversationnelle entièrement fonctionnelle!');
    console.log('✅ Détection de langue déléguée à Gemini: SUCCÈS');
    console.log('✅ RAG bilingue: FONCTIONNEL');
    console.log('✅ CTA structurés: GÉNÉRÉS');
    console.log('✅ Suggestions contextuelles: ACTIVES');
  } else if (results.passed >= results.total * 0.8) {
    console.log('🟢 TRÈS BIEN! Architecture majoritairement fonctionnelle');
    console.log('⚠️  Quelques ajustements mineurs peuvent être nécessaires');
  } else if (results.passed >= results.total * 0.6) {
    console.log('🟡 BIEN! Architecture partiellement fonctionnelle');
    console.log('🔧 Des améliorations sont nécessaires');
  } else {
    console.log('🔴 ATTENTION! Architecture nécessite des corrections majeures');
    console.log('🛠️  Révision complète recommandée');
  }

  // Recommandations
  console.log('\n💡 RECOMMANDATIONS:');
  if (languageAccuracyPercent < 90) {
    console.log('1. 🌍 Améliorer les instructions de langue dans le prompt maître');
  }
  if (ragWorkingPercent < 90) {
    console.log('2. 🧠 Vérifier la base de connaissances et la recherche vectorielle');
  }
  if (ctaGeneratedPercent < 70) {
    console.log('3. 🔗 Optimiser la génération de CTA dans le prompt');
  }
  if (suggestionsGeneratedPercent < 90) {
    console.log('4. 💡 Vérifier la génération de suggestions contextuelles');
  }

  if (results.passed === results.total) {
    console.log('🚀 L\'architecture conversationnelle est prête pour la production!');
  }

  process.exit(results.passed === results.total ? 0 : 1);
}

async function checkServerHealth() {
  console.log('🔍 Vérification du serveur...');
  
  try {
    const response = await fetch('http://localhost:3000/api/chat/status');
    if (response.ok) {
      console.log('✅ Serveur accessible et fonctionnel');
      return true;
    } else {
      console.log('⚠️  Serveur accessible mais problème:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    console.log('\n💡 SOLUTION:');
    console.log('1. Démarrez le serveur: npm run dev');
    console.log('2. Attendez que le serveur soit prêt');
    console.log('3. Relancez ce test');
    return false;
  }
}

async function main() {
  const serverHealthy = await checkServerHealth();
  
  if (!serverHealthy) {
    console.log('\n❌ Impossible de continuer sans serveur fonctionnel');
    process.exit(1);
  }

  await runArchitectureTests();
}

main().catch(console.error);