const http = require('http');

console.log('Testing admin API endpoint with authentication over HTTP...');

// Use the token we generated
const adminToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluX2RjYTc0MGMxIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU4MDYxOTUzLCJleHAiOjE3NTgxNDgzNTN9.aHTHf-Rbpu5IvwVzrNn07ILaPl4y9ONlRu2WausFRho';

// Options for the request
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/chatbot-conversations',
  method: 'GET',
  headers: {
    'Cookie': `admin_token=${adminToken}`
  }
};

// Make the request
const req = http.request(options, res => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', chunk => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
    
    // Parse the response to see if there are any conversations
    try {
      const data = JSON.parse(responseData);
      console.log('\nParsed response:');
      console.log('Total conversations:', data.totalCount || 0);
      if (data.conversations && data.conversations.length > 0) {
        console.log('First conversation:', data.conversations[0]);
      } else {
        console.log('No conversations found in response');
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
    }
  });
});

req.on('error', error => {
  console.error('Request Error:', error.message);
});

req.end();