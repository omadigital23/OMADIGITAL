// Test script to verify the API endpoint works
const http = require('http');

// Test data
const testData = {
  formData: {
    name: 'API Endpoint Test User',
    email: 'api-endpoint-test@example.com',
    phone: '+221701193811',
    company: 'API Endpoint Test Company',
    service: 'Website Development',
    message: 'This is a test message from the API endpoint test script.',
    budget: '1000-5000 FCFA',
    status: 'nouveau'
  }
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test-cta-form',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing API endpoint...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    console.log(`Body: ${chunk}`);
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();