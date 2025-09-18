// Test script to verify TTS functionality with voice input
console.log('🔍 Testing TTS with voice input...');

// Simulate the voice input to TTS flow
async function testVoiceTTS() {
  try {
    console.log('🎤 Simulating voice input...');
    
    // Simulate voice transcription result
    const voiceTranscript = "Bonjour, pouvez-vous m'expliquer vos services ?";
    const detectedLanguage = 'fr';
    const inputMethod = 'voice';
    
    console.log('📝 Transcription result:', { voiceTranscript, detectedLanguage, inputMethod });
    
    // Simulate sending message to chat API
    console.log('💬 Sending message to chat API...');
    
    const chatResponse = {
      response: "Bien sûr ! OMA Digital propose plusieurs services d'automatisation pour les entreprises sénégalaises. Nous spécialisons dans l'automatisation WhatsApp avec un ROI garanti de 200%, le développement d'applications web et mobiles, ainsi que des solutions e-commerce. Comment puis-je vous aider spécifiquement ?",
      language: 'fr',
      suggestions: ['📞 Contactez-nous', '📱 Applications mobiles', '🌐 Sites web', '📊 Voir tarifs']
    };
    
    console.log('🤖 Chatbot response received:', {
      responseLength: chatResponse.response.length,
      language: chatResponse.language
    });
    
    // Simulate TTS request
    console.log('🔊 Testing TTS request...');
    
    // This would normally be called from the frontend
    const ttsRequest = {
      text: chatResponse.response,
      language: chatResponse.language,
      sessionId: 'test-session-' + Date.now(),
      inputMethod: inputMethod
    };
    
    console.log('🎵 TTS request data:', ttsRequest);
    
    // Test the TTS API directly
    console.log('📡 Testing TTS API call...');
    
    const response = await fetch('http://localhost:3000/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: ttsRequest.text,
        language: ttsRequest.language,
        sessionId: ttsRequest.sessionId
      })
    });
    
    console.log('🎵 TTS API response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type')
    });
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('audio')) {
        console.log('✅ SUCCESS: TTS audio generated correctly!');
        console.log('   Audio size:', response.headers.get('content-length'), 'bytes');
        console.log('   Content type:', contentType);
        return true;
      } else {
        console.log('❌ ERROR: Response is not audio content');
        const text = await response.text();
        console.log('   Response content:', text.substring(0, 100) + '...');
        return false;
      }
    } else {
      const errorText = await response.text();
      console.log('❌ ERROR: TTS API failed');
      console.log('   Status:', response.status);
      console.log('   Error:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testVoiceTTS().then(success => {
  if (success) {
    console.log('\n🎉 Voice TTS test completed successfully!');
    console.log('   The chatbot should be able to speak responses to voice inputs.');
  } else {
    console.log('\n💥 Voice TTS test failed!');
    console.log('   There may be an issue with the TTS functionality.');
  }
});