const dotenv = require('dotenv');
const { existsSync } = require('fs');
const { join } = require('path');

// Load environment variables
const envPath = join(__dirname, '.env.local');

if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.log('No .env.local file found, using existing environment variables');
}

async function testTTSAPI() {
  try {
    console.log('Testing TTS API...');
    
    // Use the global fetch API (available in Node.js 18+)
    const response = await fetch('http://localhost:3000/api/tts/synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Bonjour, ceci est un test de synthèse vocale.',
        language: 'fr'
      })
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data.success);
      console.log('Model used:', data.model);
      console.log('Audio data length:', data.audio ? data.audio.length : 'No audio data');
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testTTSAPI();