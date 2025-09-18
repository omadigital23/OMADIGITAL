// Script to test newsletter API endpoints
const http = require('http');
const https = require('https');

// Configuration
const siteUrl = 'http://localhost:3000'; // Using local development server
const apiUrl = `${siteUrl}/api`;

// Test email
const testEmail = `test-${Date.now()}@example.com`;

// Function to make HTTP requests
function makeRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    if (postData) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }
    
    const req = lib.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testNewsletterAPI() {
  try {
    console.log('🔍 Testing newsletter API endpoints...');
    console.log('=' .repeat(50));
    
    // Test 1: Subscribe to newsletter
    console.log('\n📋 Test 1: Subscribing to newsletter...');
    
    const subscribeData = JSON.stringify({
      email: testEmail,
      source: 'test'
    });
    
    const subscribeResponse = await makeRequest(`${apiUrl}/subscribe-newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, subscribeData);
    
    console.log(`  Status: ${subscribeResponse.statusCode}`);
    console.log(`  Response: ${subscribeResponse.data.substring(0, 200)}${subscribeResponse.data.length > 200 ? '...' : ''}`);
    
    if (subscribeResponse.statusCode === 200) {
      console.log('  ✅ Subscription request successful');
    } else {
      console.log('  ❌ Subscription request failed');
      return false;
    }
    
    // Test 2: Try to subscribe with the same email (should return success)
    console.log('\n📋 Test 2: Subscribing with the same email...');
    
    const subscribeResponse2 = await makeRequest(`${apiUrl}/subscribe-newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, subscribeData);
    
    console.log(`  Status: ${subscribeResponse2.statusCode}`);
    console.log(`  Response: ${subscribeResponse2.data.substring(0, 200)}${subscribeResponse2.data.length > 200 ? '...' : ''}`);
    
    if (subscribeResponse2.statusCode === 200) {
      console.log('  ✅ Duplicate subscription handled correctly');
    } else {
      console.log('  ❌ Duplicate subscription handling failed');
      return false;
    }
    
    // Test 3: Try to subscribe with invalid email
    console.log('\n📋 Test 3: Subscribing with invalid email...');
    
    const invalidSubscribeData = JSON.stringify({
      email: 'invalid-email',
      source: 'test'
    });
    
    const invalidSubscribeResponse = await makeRequest(`${apiUrl}/subscribe-newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, invalidSubscribeData);
    
    console.log(`  Status: ${invalidSubscribeResponse.statusCode}`);
    console.log(`  Response: ${invalidSubscribeResponse.data.substring(0, 200)}${invalidSubscribeResponse.data.length > 200 ? '...' : ''}`);
    
    if (invalidSubscribeResponse.statusCode === 400) {
      console.log('  ✅ Invalid email validation working correctly');
    } else {
      console.log('  ❌ Invalid email validation failed');
      return false;
    }
    
    console.log('\n🎉 All newsletter API tests completed!');
    console.log('\n📝 Note: To fully test the confirmation flow, you would need to:');
    console.log('  1. Check the database to see if the subscriber was added with a confirmation token');
    console.log('  2. Extract the confirmation token from the database');
    console.log('  3. Make a GET request to /api/confirm-subscription?token={token}');
    console.log('  4. Verify the subscriber status was updated to active');
    console.log('  5. Test the unsubscribe functionality with the unsubscribe token');
    
    return true;
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testNewsletterAPI()
  .then(success => {
    if (success) {
      console.log('\n✅ Newsletter API functionality tests completed!');
    } else {
      console.log('\n❌ Newsletter API functionality tests failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });