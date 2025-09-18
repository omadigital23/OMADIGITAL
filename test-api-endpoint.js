const https = require('https');
const http = require('http');

// Use the token we generated
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluX2RjYTc0MGMxIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU3NzM3OTU3LCJleHAiOjE3NTc4MjQzNTd9.WCw3WBJfdSkvQcF747XrVnXr6ecOWFvGukkke82Qt6s';

// Test the API endpoint
const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/admin/chatbot-conversations',
  method: 'GET',
  headers: {
    'Cookie': `admin_token=${token}`
  }
};

console.log('Testing API endpoint...');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response Data:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.log('Raw Response Data:');
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.end();