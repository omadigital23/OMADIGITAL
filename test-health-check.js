// Test script to verify the health check API endpoint
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health-check',
  method: 'GET'
};

console.log('Testing health check API endpoint...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
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

req.end();