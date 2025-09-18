// Script to test Apyhub API directly
const fs = require('fs');

async function testApyhubDirect() {
  try {
    console.log('🔍 Testing Apyhub API directly...');
    
    // Get the API key from .env.local file
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const apiKeyMatch = envContent.match(/APYHUB_API_KEY=(.*)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;
    
    if (!apiKey) {
      console.log('❌ APYHUB_API_KEY not found in .env.local');
      return;
    }
    
    console.log('🔑 API Key found');
    
    // Read the test audio file
    const audioBuffer = fs.readFileSync('test-audio.wav');
    console.log('📝 Audio file size:', audioBuffer.length, 'bytes');
    
    // Test the speech-to-text endpoint directly
    console.log('🎤 Testing speech-to-text endpoint...');
    
    // Create form data
    const FormData = require('form-data');
    const form = new FormData();
    form.append('audio', audioBuffer, {
      filename: 'test-audio.wav',
      contentType: 'audio/wav'
    });
    form.append('language', 'fr-FR,en-US');
    form.append('response_type', 'json');
    
    const sttResponse = await fetch('https://api.apyhub.com/processor/speech-to-text', {
      method: 'POST',
      headers: {
        'apy-token': apiKey,
        ...form.getHeaders()
      },
      body: form
    });
    
    console.log('📥 Speech-to-text response status:', sttResponse.status);
    if (sttResponse.ok) {
      const sttData = await sttResponse.json();
      console.log('✅ Speech-to-text successful:', JSON.stringify(sttData, null, 2));
    } else {
      const errorText = await sttResponse.text();
      console.log('❌ Speech-to-text failed:', sttResponse.status, errorText);
      
      // Try with a different endpoint
      console.log('🔄 Trying alternative endpoint...');
      const altResponse = await fetch('https://api.apyhub.com/processor/speech-to-text/async', {
        method: 'POST',
        headers: {
          'apy-token': apiKey,
          ...form.getHeaders()
        },
        body: form
      });
      
      console.log('📥 Alternative endpoint response status:', altResponse.status);
      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log('✅ Alternative endpoint successful:', JSON.stringify(altData, null, 2));
      } else {
        const altErrorText = await altResponse.text();
        console.log('❌ Alternative endpoint failed:', altResponse.status, altErrorText);
      }
    }
    
  } catch (error) {
    console.error('💥 Error testing Apyhub:', error);
  }
}

// Run the test
testApyhubDirect();