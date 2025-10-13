const http = require('http');

// Test the newsletter subscription API with detailed debugging
const postData = JSON.stringify({
  email: 'debug-test@example.com',
  source: 'debug_script'
});

console.log('Sending request with data:', postData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/subscribe-newsletter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'DebugScript/1.0'
  }
};

const req = http.request(options, (res) => {
  console.log(`Response Status: ${res.statusCode}`);
  console.log(`Response Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    console.log('Received chunk:', chunk.toString());
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response complete');
    console.log('Response body:', data);
    
    try {
      const result = JSON.parse(data);
      console.log('Parsed response:', result);
    } catch (error) {
      console.log('Could not parse response as JSON:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  console.error('Error details:', error);
});

req.on('close', () => {
  console.log('Request closed');
});

req.write(postData);
req.end();

console.log('Request sent');