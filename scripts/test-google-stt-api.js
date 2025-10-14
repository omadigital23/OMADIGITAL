/**
 * Script de test direct de l'API Google Cloud Speech-to-Text
 */

require('dotenv').config({ path: '.env.local' });

const GOOGLE_CLOUD_API_KEY = process.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_AI_API_KEY;

if (!GOOGLE_CLOUD_API_KEY) {
  console.error('❌ GOOGLE_CLOUD_API_KEY non configurée');
  process.exit(1);
}

console.log('✅ API Key trouvée:', GOOGLE_CLOUD_API_KEY.substring(0, 20) + '...\n');

// Créer un audio de test simple (silence de 1 seconde en LINEAR16, mono, 16kHz)
// C'est juste pour tester si l'API répond correctement
function createTestAudio() {
  // Audio WAV header pour 1 seconde de silence
  const sampleRate = 16000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const duration = 1; // seconde
  const numSamples = sampleRate * duration;
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Data (silence = all zeros)
  // Already filled with zeros by Buffer.alloc
  
  return buffer.toString('base64');
}

async function testGoogleSpeechAPI() {
  console.log('🎤 Test de l\'API Google Cloud Speech-to-Text...\n');
  
  const audioBase64 = createTestAudio();
  console.log('📊 Audio de test créé (WAV, 1s de silence)');
  console.log('   Taille base64:', audioBase64.length, 'caractères\n');
  
  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode: 'fr-FR',
    alternativeLanguageCodes: ['en-US'],
    enableAutomaticPunctuation: true,
    model: 'default',
    maxAlternatives: 1
  };
  
  const requestBody = {
    config,
    audio: {
      content: audioBase64
    }
  };
  
  const endpoint = `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_CLOUD_API_KEY}`;
  
  console.log('📡 Appel de l\'API...');
  console.log('   Endpoint:', endpoint.replace(GOOGLE_CLOUD_API_KEY, 'API_KEY_HIDDEN'));
  console.log('   Config:', JSON.stringify(config, null, 2), '\n');
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📥 Réponse reçue');
    console.log('   Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    
    if (!response.ok) {
      console.error('\n❌ ERREUR API:');
      console.error('   Status:', response.status);
      console.error('   Response:', responseText);
      
      try {
        const errorJson = JSON.parse(responseText);
        console.error('\n   Détails de l\'erreur:');
        console.error('   ', JSON.stringify(errorJson, null, 2));
        
        if (errorJson.error?.message?.includes('API key not valid')) {
          console.error('\n💡 SOLUTION:');
          console.error('   1. Vérifiez que votre clé API est correcte');
          console.error('   2. Activez l\'API Speech-to-Text sur https://console.cloud.google.com/apis/library/speech.googleapis.com');
          console.error('   3. Vérifiez que la clé API a les permissions pour Speech-to-Text');
        }
      } catch (e) {
        // Not JSON
      }
      
      process.exit(1);
    }
    
    const result = JSON.parse(responseText);
    console.log('\n✅ SUCCÈS!');
    console.log('   Réponse:', JSON.stringify(result, null, 2));
    
    if (!result.results || result.results.length === 0) {
      console.log('\n   ℹ️  Aucun texte détecté (normal pour du silence)');
    } else {
      const transcript = result.results[0]?.alternatives[0]?.transcript;
      const confidence = result.results[0]?.alternatives[0]?.confidence;
      console.log('\n   Transcription:', transcript);
      console.log('   Confiance:', confidence);
    }
    
    console.log('\n✅ L\'API Google Cloud Speech fonctionne correctement!');
    console.log('   Le problème vient probablement du format audio envoyé depuis le navigateur.\n');
    
  } catch (error) {
    console.error('\n❌ ERREUR DE CONNEXION:');
    console.error('   ', error.message);
    console.error('\n   Vérifiez votre connexion internet.\n');
    process.exit(1);
  }
}

testGoogleSpeechAPI();
