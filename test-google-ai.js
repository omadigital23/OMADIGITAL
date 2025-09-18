// Script to test Google AI Studio API key
const fs = require('fs');

async function testGoogleAI() {
  try {
    console.log('🔍 Testing Google AI Studio API...');
    
    // Get the API key from .env.local file
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const apiKeyMatch = envContent.match(/GOOGLE_AI_API_KEY=(.*)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;
    
    if (!apiKey) {
      console.log('❌ GOOGLE_AI_API_KEY not found in .env.local');
      return;
    }
    
    console.log('🔑 API Key found');
    
    // Test the speech recognition API with a simple request
    console.log('🎤 Testing speech recognition endpoint...');
    
    // Create a minimal test request
    const testRequest = {
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 48000,
        languageCode: 'fr-FR',
        alternativeLanguageCodes: ['en-US'],
        enableAutomaticPunctuation: true
      },
      audio: {
        content: '' // Empty for testing
      }
    };
    
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testRequest)
      }
    );
    
    console.log('📥 Speech recognition response status:', response.status);
    if (response.status === 400) {
      // 400 is expected for empty audio, which means the API key is valid
      console.log('✅ Google AI Studio API key is valid (received 400 for empty audio)');
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ Google AI Studio API key is valid:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Google AI Studio API test failed:', response.status, errorText);
    }
    
    // Test the text-to-speech API
    console.log('🔊 Testing text-to-speech endpoint...');
    
    const ttsRequest = {
      input: {
        text: 'Bonjour, ceci est un test de synthèse vocale.'
      },
      voice: {
        languageCode: 'fr-FR',
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3'
      }
    };
    
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ttsRequest)
      }
    );
    
    console.log('📥 Text-to-speech response status:', ttsResponse.status);
    if (ttsResponse.status === 400) {
      // 400 might be expected for certain inputs, which still indicates valid key
      console.log('✅ Google AI Studio TTS API key is valid (received 400)');
    } else if (ttsResponse.ok) {
      const data = await ttsResponse.json();
      console.log('✅ Google AI Studio TTS API key is valid:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await ttsResponse.text();
      console.log('❌ Google AI Studio TTS API test failed:', ttsResponse.status, errorText);
    }
    
  } catch (error) {
    console.error('💥 Error testing Google AI Studio:', error);
  }
}

// Run the test
testGoogleAI();