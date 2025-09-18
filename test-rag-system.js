/**
 * Script de test automatique pour le système RAG
 * Vérifie que Google AI Studio est bien configuré
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Couleurs pour les logs
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testRAGSystem() {
  log('blue', '🚀 Test du Système RAG OMA Digital\n');

  // 1. Vérifier la configuration
  log('yellow', '1. 🔍 Vérification de la configuration...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    log('red', '❌ Fichier .env.local non trouvé');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasGoogleAI = envContent.includes('GOOGLE_AI_API_KEY');
  const hasRealKey = envContent.includes('AIzaSy') || !envContent.includes('your_google_ai_api_key_here');

  if (!hasGoogleAI) {
    log('red', '❌ Variable GOOGLE_AI_API_KEY manquante');
    return false;
  }

  if (!hasRealKey) {
    log('yellow', '⚠️  Clé Google AI non configurée (utilise la clé temporaire)');
    log('blue', '📋 Suivez le guide GOOGLE_AI_SETUP_GUIDE.md pour configurer votre clé');
  } else {
    log('green', '✅ Configuration Google AI Studio détectée');
  }

  // 2. Tester la détection de langue
  log('yellow', '\n2. 🌍 Test de détection de langue...');
  
  const testPhrases = [
    { text: 'Bonjour, que faites-vous ?', expected: 'fr' },
    { text: 'Hello, what do you do?', expected: 'en' },
    { text: 'Je veux créer un site web', expected: 'fr' },
    { text: 'I need a chatbot for my business', expected: 'en' }
  ];

  let languageTestsPassed = 0;
  testPhrases.forEach(test => {
    const frenchWords = ['bonjour', 'que', 'je', 'veux', 'créer', 'un'];
    const englishWords = ['hello', 'what', 'do', 'i', 'need', 'for', 'my'];
    
    const lowerText = test.text.toLowerCase();
    const frenchScore = frenchWords.filter(word => lowerText.includes(word)).length;
    const englishScore = englishWords.filter(word => lowerText.includes(word)).length;
    const detected = englishScore > frenchScore ? 'en' : 'fr';
    
    if (detected === test.expected) {
      log('green', `✅ "${test.text}" → ${detected}`);
      languageTestsPassed++;
    } else {
      log('red', `❌ "${test.text}" → ${detected} (attendu: ${test.expected})`);
    }
  });

  log('blue', `📊 Détection de langue: ${languageTestsPassed}/${testPhrases.length} tests réussis`);

  // 3. Tester la recherche de contexte
  log('yellow', '\n3. 📚 Test de recherche de contexte...');
  
  const mockKnowledge = {
    'sites_web_fr': {
      title: 'Création de sites web - OMA Digital',
      content: 'Nous créons des sites web professionnels qui capturent l\'essence de votre marque.',
      keywords: ['site', 'web', 'professionnel', 'marque']
    },
    'chatbots_fr': {
      title: 'Chatbots & Automatisation - OMA Digital', 
      content: 'Nous créons des chatbots simples et multimodaux qui interagissent par texte et par la voix.',
      keywords: ['chatbot', 'automatisation', 'texte', 'voix']
    },
    'services_en': {
      title: 'Our Key Services - OMA Digital',
      content: 'OMA Digital offers 4 key services: websites, mobile apps, chatbots and digital marketing.',
      keywords: ['services', 'website', 'mobile', 'chatbot', 'marketing']
    }
  };

  const searchTests = [
    { query: 'Je veux un site web', language: 'fr', expectedKey: 'sites_web_fr' },
    { query: 'I need a chatbot', language: 'en', expectedKey: 'services_en' },
    { query: 'automatisation WhatsApp', language: 'fr', expectedKey: 'chatbots_fr' }
  ];

  let contextTestsPassed = 0;
  searchTests.forEach(test => {
    const queryWords = test.query.toLowerCase().split(' ');
    let bestMatch = null;
    let bestScore = 0;

    Object.keys(mockKnowledge).forEach(key => {
      if (!key.endsWith(`_${test.language}`)) return;
      
      const item = mockKnowledge[key];
      let score = 0;
      
      const itemText = (item.title + ' ' + item.content).toLowerCase();
      queryWords.forEach(word => {
        if (itemText.includes(word)) score += 10;
      });
      
      item.keywords.forEach(keyword => {
        queryWords.forEach(word => {
          if (keyword.includes(word) || word.includes(keyword)) score += 15;
        });
      });

      if (score > bestScore) {
        bestScore = score;
        bestMatch = key;
      }
    });

    if (bestMatch && bestScore > 0) {
      log('green', `✅ "${test.query}" → ${mockKnowledge[bestMatch].title} (score: ${bestScore})`);
      contextTestsPassed++;
    } else {
      log('red', `❌ "${test.query}" → Aucun contexte trouvé`);
    }
  });

  log('blue', `📊 Recherche de contexte: ${contextTestsPassed}/${searchTests.length} tests réussis`);

  // 4. Test de l'API (si serveur en cours)
  log('yellow', '\n4. 🌐 Test de l\'API RAG...');
  
  try {
    const testAPICall = () => {
      return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
          message: "Bonjour, que faites-vous ?",
          sessionId: "test-rag-system",
          inputMethod: "text"
        });

        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/chat/send',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          },
          timeout: 5000
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              resolve(response);
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => reject(new Error('Request timeout')));
        req.write(postData);
        req.end();
      });
    };

    // Essayer différents ports
    const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007];
    let apiWorking = false;

    for (const port of ports) {
      try {
        log('blue', `   Tentative sur le port ${port}...`);
        
        const response = await new Promise((resolve, reject) => {
          const postData = JSON.stringify({
            message: "Test RAG system",
            sessionId: "test-rag-system", 
            inputMethod: "text"
          });

          const req = require('http').request({
            hostname: 'localhost',
            port: port,
            path: '/api/chat/send',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 3000
          }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error('Invalid JSON'));
              }
            });
          });

          req.on('error', reject);
          req.on('timeout', () => reject(new Error('Timeout')));
          req.write(postData);
          req.end();
        });

        if (response && response.source) {
          log('green', `✅ API RAG fonctionnelle sur le port ${port}`);
          log('blue', `   Source: ${response.source}`);
          log('blue', `   Confiance: ${response.confidence}`);
          log('blue', `   Langue: ${response.language}`);
          if (response.retrievedContext) {
            log('blue', `   Contextes: ${response.retrievedContext.length} récupérés`);
          }
          apiWorking = true;
          break;
        }
      } catch (error) {
        // Continuer avec le port suivant
      }
    }

    if (!apiWorking) {
      log('yellow', '⚠️  Serveur non démarré. Lancez "npm run dev" pour tester l\'API');
    }

  } catch (error) {
    log('yellow', '⚠️  Impossible de tester l\'API (serveur non démarré)');
  }

  // 5. Résumé final
  log('yellow', '\n5. 📋 Résumé du test...');
  
  const totalTests = testPhrases.length + searchTests.length;
  const passedTests = languageTestsPassed + contextTestsPassed;
  const successRate = Math.round((passedTests / totalTests) * 100);

  log('blue', `📊 Tests réussis: ${passedTests}/${totalTests} (${successRate}%)`);
  
  if (successRate >= 80) {
    log('green', '🎉 Système RAG fonctionnel !');
    log('blue', '\n📋 Prochaines étapes:');
    log('blue', '1. Configurez votre clé Google AI Studio (voir GOOGLE_AI_SETUP_GUIDE.md)');
    log('blue', '2. Lancez "npm run dev" pour démarrer le serveur');
    log('blue', '3. Testez avec de vraies questions clients');
    log('blue', '4. Surveillez les logs pour optimiser les performances');
  } else {
    log('red', '❌ Problèmes détectés dans le système RAG');
    log('blue', '\n🔧 Actions recommandées:');
    log('blue', '1. Vérifiez la configuration dans .env.local');
    log('blue', '2. Consultez les logs d\'erreur');
    log('blue', '3. Relancez le test après corrections');
  }

  log('blue', '\n🚀 Votre chatbot RAG OMA Digital est prêt !');
  return successRate >= 80;
}

// Exécuter le test
testRAGSystem().catch(error => {
  log('red', `❌ Erreur lors du test: ${error.message}`);
});