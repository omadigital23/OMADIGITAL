// Test script to verify Google TTS API functionality
console.log('🔍 Testing Google TTS API functionality...');

// Load environment variables
require('dotenv').config({ path: './.env.local' });

async function testGoogleTTS() {
  try {
    console.log('🔑 Checking Google API key...');
    
    const googleApiKey = process.env.GOOGLE_AI_API_KEY;
    if (!googleApiKey) {
      console.log('❌ ERROR: GOOGLE_AI_API_KEY not found in environment variables');
      return false;
    }
    
    console.log('✅ Google API key found');
    
    // Test text to synthesize
    const testText = "Bonjour, je suis l'assistant vocal d'OMA Digital. Comment puis-je vous aider aujourd'hui ?";
    const language = 'fr';
    
    console.log('📝 Testing with text:', testText.substring(0, 50) + '...');
    console.log('🌍 Language:', language);
    
    // Configuration for Google TTS
    const VOICE_CONFIG = {
      fr: {
        languageCode: 'fr-FR',
        name: 'fr-FR-Standard-A',
        ssmlGender: 'FEMALE'
      },
      en: {
        languageCode: 'en-US',
        name: 'en-US-Standard-A',
        ssmlGender: 'FEMALE'
      }
    };
    
    const voiceConfig = {
      languageCode: VOICE_CONFIG[language].languageCode,
      name: VOICE_CONFIG[language].name,
      ssmlGender: VOICE_CONFIG[language].ssmlGender
    };

    const audioConfig = {
      audioEncoding: 'MP3',
      speakingRate: 0.9,
      volumeGainDb: 0.0,
      pitch: 0.0
    };

    const requestBody = {
      input: { text: testText },
      voice: voiceConfig,
      audioConfig
    };
    
    console.log('📡 Sending request to Google TTS API...');
    
    // Test the Google TTS API directly
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );
    
    console.log('🎵 Google TTS API response:', {
      status: response.status,
      statusText: response.statusText
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.audioContent) {
        console.log('✅ SUCCESS: Google TTS API working correctly!');
        console.log('   Audio content length:', data.audioContent.length, 'characters');
        return true;
      } else {
        console.log('❌ ERROR: No audio content in response');
        console.log('   Response keys:', Object.keys(data));
        return false;
      }
    } else {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.log('❌ ERROR: Google TTS API request failed');
      console.log('   Status:', response.status);
      console.log('   Error:', errorText);
      
      if (response.status === 403) {
        console.log('   This might be a quota issue. Check your Google Cloud billing.');
      } else if (response.status === 400) {
        console.log('   This might be an invalid request. Check the request format.');
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('   This might be a network connectivity issue.');
    }
    
    return false;
  }
}

// Run the test
testGoogleTTS().then(success => {
  if (success) {
    console.log('\n🎉 Google TTS API test completed successfully!');
    console.log('   The chatbot should be able to generate speech from text.');
  } else {
    console.log('\n💥 Google TTS API test failed!');
    console.log('   There may be an issue with the Google TTS configuration.');
  }
});