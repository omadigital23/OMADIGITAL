#!/usr/bin/env node

/**
 * Test de la correction de détection de langue du chatbot
 * Vérifie que le chatbot répond dans la bonne langue
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzcyMzksImV4cCI6MjA3Mjk1MzIzOX0.OT-zQbg0Q8BzupmUzQH9xNL8aRCKNO73onKlsaLaE30';

console.log('🌍 TEST DE DÉTECTION DE LANGUE DU CHATBOT');
console.log('═'.repeat(50));

async function testChatAPI(message, expectedLanguage, testName) {
  console.log(`\n🧪 TEST: ${testName}`);
  console.log('─'.repeat(30));
  console.log(`📝 Message: "${message}"`);
  console.log(`🎯 Langue attendue: ${expectedLanguage}`);

  try {
    const response = await fetch('http://localhost:3000/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        sessionId: `test_lang_${Date.now()}`,
        inputMethod: 'text'
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      console.log(`📤 Réponse reçue: "${data.response.substring(0, 100)}..."`);
      console.log(`🌍 Langue détectée: ${data.language}`);
      console.log(`🎯 Source: ${data.source}`);
      console.log(`📊 Confiance: ${data.confidence}`);

      // Vérifier la langue de la réponse
      const responseLanguage = detectLanguageInResponse(data.response);
      console.log(`🔍 Langue de la réponse analysée: ${responseLanguage}`);

      if (data.language === expectedLanguage && responseLanguage === expectedLanguage) {
        console.log('✅ SUCCÈS: Langue correctement détectée et réponse dans la bonne langue');
        return true;
      } else {
        console.log('❌ ÉCHEC: Problème de détection ou de réponse de langue');
        if (data.language !== expectedLanguage) {
          console.log(`   - Langue détectée incorrecte: attendu ${expectedLanguage}, reçu ${data.language}`);
        }
        if (responseLanguage !== expectedLanguage) {
          console.log(`   - Réponse dans la mauvaise langue: attendu ${expectedLanguage}, reçu ${responseLanguage}`);
        }
        return false;
      }
    } else {
      console.log('❌ ERREUR API:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ ERREUR:', error.message);
    return false;
  }
}

function detectLanguageInResponse(text) {
  const lowerText = text.toLowerCase();
  
  // Indicateurs français forts
  const frenchIndicators = [
    'bonjour', 'salut', 'merci', 'je suis', 'nous sommes', 'vous êtes', 'comment allez-vous',
    'puis-je', 'pouvez-vous', 'voulez-vous', 'souhaitez-vous', 'aidez-vous', 'aider',
    'nos services', 'notre équipe', 'votre projet', 'votre entreprise', 'contactez-nous',
    'téléphone', 'email', 'adresse', 'horaires', 'disponible', 'gratuit', 'devis'
  ];
  
  // Indicateurs anglais forts
  const englishIndicators = [
    'hello', 'hi', 'thank you', 'i am', 'we are', 'you are', 'how are you',
    'can i', 'can you', 'would you', 'do you want', 'help you', 'assist',
    'our services', 'our team', 'your project', 'your business', 'contact us',
    'phone', 'email', 'address', 'hours', 'available', 'free', 'quote'
  ];
  
  let frenchScore = 0;
  let englishScore = 0;
  
  frenchIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      frenchScore += indicator.length; // Poids basé sur la longueur
    }
  });
  
  englishIndicators.forEach(indicator => {
    if (lowerText.includes(indicator)) {
      englishScore += indicator.length;
    }
  });
  
  return englishScore > frenchScore ? 'en' : 'fr';
}

async function runLanguageDetectionTests() {
  console.log('🚀 Démarrage des tests de détection de langue...\n');

  const testCases = [
    {
      message: 'hello',
      expectedLanguage: 'en',
      testName: 'Salutation anglaise simple'
    },
    {
      message: 'bonjour',
      expectedLanguage: 'fr',
      testName: 'Salutation française simple'
    },
    {
      message: 'Hello, can you help me with your services?',
      expectedLanguage: 'en',
      testName: 'Question complète en anglais'
    },
    {
      message: 'Bonjour, pouvez-vous m\'aider avec vos services ?',
      expectedLanguage: 'fr',
      testName: 'Question complète en français'
    },
    {
      message: 'Hi there! I would like to know about WhatsApp automation',
      expectedLanguage: 'en',
      testName: 'Demande d\'information en anglais'
    },
    {
      message: 'Salut ! J\'aimerais en savoir plus sur l\'automatisation WhatsApp',
      expectedLanguage: 'fr',
      testName: 'Demande d\'information en français'
    },
    {
      message: 'What are your prices?',
      expectedLanguage: 'en',
      testName: 'Question sur les prix en anglais'
    },
    {
      message: 'Quels sont vos tarifs ?',
      expectedLanguage: 'fr',
      testName: 'Question sur les prix en français'
    },
    {
      message: 'Good morning, I need a website for my business',
      expectedLanguage: 'en',
      testName: 'Demande de service en anglais'
    },
    {
      message: 'Bonjour, j\'ai besoin d\'un site web pour mon entreprise',
      expectedLanguage: 'fr',
      testName: 'Demande de service en français'
    }
  ];

  let passedTests = 0;
  let totalTests = testCases.length;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const success = await testChatAPI(
      testCase.message, 
      testCase.expectedLanguage, 
      `${i + 1}/${totalTests} - ${testCase.testName}`
    );
    
    if (success) {
      passedTests++;
    }
    
    // Pause entre les tests pour éviter le rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Résumé final
  console.log('\n' + '═'.repeat(50));
  console.log('📊 RÉSUMÉ DES TESTS DE DÉTECTION DE LANGUE');
  console.log('═'.repeat(50));
  console.log(`✅ Tests réussis: ${passedTests}/${totalTests}`);
  console.log(`❌ Tests échoués: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Taux de réussite: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 PARFAIT! Tous les tests de détection de langue ont réussi!');
    console.log('✅ Le chatbot détecte correctement la langue');
    console.log('✅ Le chatbot répond dans la bonne langue');
    console.log('💡 Le problème de détection de langue est résolu!');
  } else if (passedTests > totalTests * 0.7) {
    console.log('\n🟡 BIEN! La plupart des tests ont réussi');
    console.log('⚠️  Quelques améliorations peuvent être nécessaires');
  } else {
    console.log('\n🔴 ATTENTION! Plusieurs tests ont échoué');
    console.log('🔧 Le système de détection de langue nécessite des corrections');
  }

  // Recommandations
  console.log('\n💡 RECOMMANDATIONS:');
  if (passedTests < totalTests) {
    console.log('1. Vérifiez que le serveur Next.js est démarré (npm run dev)');
    console.log('2. Vérifiez que les modifications du code ont été appliquées');
    console.log('3. Redémarrez le serveur si nécessaire');
    console.log('4. Vérifiez les logs du serveur pour les erreurs');
  } else {
    console.log('1. Le système fonctionne parfaitement!');
    console.log('2. Vous pouvez maintenant tester avec de vrais utilisateurs');
    console.log('3. Surveillez les analytics pour confirmer les améliorations');
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

// Vérifier que le serveur est accessible
async function checkServerHealth() {
  console.log('🔍 Vérification de la santé du serveur...');
  
  try {
    const response = await fetch('http://localhost:3000/api/chat/status');
    if (response.ok) {
      console.log('✅ Serveur accessible et fonctionnel');
      return true;
    } else {
      console.log('⚠️  Serveur accessible mais problème de statut:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Serveur non accessible:', error.message);
    console.log('\n💡 SOLUTION:');
    console.log('1. Démarrez le serveur Next.js: npm run dev');
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

  await runLanguageDetectionTests();
}

main().catch(console.error);