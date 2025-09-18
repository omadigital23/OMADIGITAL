// Script to test the transcription API
const fs = require('fs');

async function testTranscriptionAPI() {
  try {
    console.log('🔍 Testing transcription API...');
    
    // Create a minimal test request to the transcription API
    const response = await fetch('http://localhost:3000/api/chat/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        test: true
      })
    });
    
    console.log('📥 Transcription API response status:', response.status);
    
    if (response.status === 405) {
      console.log('✅ Transcription API is accessible (returned 405 for wrong method, which is expected)');
    } else if (response.ok) {
      const data = await response.json();
      console.log('✅ Transcription API is working:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Transcription API test failed:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('💥 Error testing transcription API:', error);
  }
}

// Run the test
testTranscriptionAPI();