const https = require('https');
const http = require('http');

// Data to send
const data = JSON.stringify({
  message: 'Hello, this is a test message',
  sessionId: 'test-session-123'
});

console.log('Sending request to chatbot API...');

// Options for the request (using http instead of https)
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/chat/gemini',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

// Make the request using http
const req = http.request(options, res => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', chunk => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', error => {
  console.error('Request Error:', error.message);
});

req.write(data);
req.end();

console.log('Request sent with data:', data);