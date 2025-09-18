const https = require('https');

// Google AI API key from .env.local
const GOOGLE_AI_API_KEY = 'AIzaSyDxS9gcTOhVqXP1EfqeoveN0lFUbk4M-9g';

// Test the Google AI API directly
const postData = JSON.stringify({
  contents: [{
    parts: [{
      text: "What are the services offered by OMA Digital? Respond in one sentence."
    }]
  }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 100,
  }
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:', response);
      
      if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        const generatedText = response.candidates[0].content.parts[0].text;
        console.log('Generated text:', generatedText);
      } else {
        console.log('No candidates found in response');
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(postData);
req.end();