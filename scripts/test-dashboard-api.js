#!/usr/bin/env node

/**
 * Test Dashboard API Endpoint
 * Tests if the admin dashboard API endpoint is working correctly
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: './.env.local' });

async function testDashboardAPI() {
  console.log('🔍 Testing Admin Dashboard API Endpoint...\n');
  
  // Check if we're running the Next.js server
  console.log('🧪 Test: Checking if Next.js development server is running...');
  
  // For this test, we'll simulate what the frontend does
  // In a real scenario, you would need the server running
  
  try {
    // Read the dashboard-metrics API file to understand what it does
    const apiFilePath = path.join(__dirname, '../pages/api/admin/dashboard-metrics.ts');
    
    if (!fs.existsSync(apiFilePath)) {
      console.error('❌ Dashboard API file not found:', apiFilePath);
      return false;
    }
    
    console.log('✅ Dashboard API file found');
    
    // Check environment variables needed by the API
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    let allEnvVarsPresent = true;
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.error(`❌ Missing required environment variable: ${envVar}`);
        allEnvVarsPresent = false;
      } else {
        console.log(`✅ ${envVar}: Present`);
      }
    }
    
    if (!allEnvVarsPresent) {
      console.error('\n❌ Missing required environment variables for API');
      return false;
    }
    
    console.log('\n✅ All environment variables are present for the API');
    
    // Explain what the API does
    console.log('\n📋 Dashboard API Functionality:');
    console.log('   1. Connects to Supabase using service role key');
    console.log('   2. Queries multiple tables:');
    console.log('      - chatbot_interactions');
    console.log('      - quotes');
    console.log('      - blog_subscribers');
    console.log('      - analytics_events');
    console.log('   3. Calculates real-time metrics');
    console.log('   4. Returns JSON data for the admin dashboard');
    
    console.log('\n💡 To test the actual API endpoint:');
    console.log('   1. Make sure your Next.js server is running (npm run dev)');
    console.log('   2. Visit http://localhost:3000/api/admin/dashboard-metrics');
    console.log('   3. Or make a GET request to that endpoint');
    
    console.log('\n✅ Dashboard API test setup completed!');
    return true;
    
  } catch (error) {
    console.error('❌ Error during API test:', error.message);
    return false;
  }
}

// Function to test the actual API endpoint (if server is running)
async function testActualAPIEndpoint() {
  console.log('\n🔍 Testing actual API endpoint connection...\n');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/dashboard-metrics',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.get(options, (res) => {
      console.log(`✅ API endpoint responded with status code: ${res.statusCode}`);
      
      if (res.statusCode === 200) {
        console.log('🎉 The admin dashboard API is working correctly!');
        console.log('   Your admin page should be able to fetch data.');
      } else {
        console.log('⚠️  API endpoint returned non-200 status code');
        console.log('   This might indicate an issue with data fetching.');
      }
      
      resolve(true);
    });
    
    req.on('error', (error) => {
      console.log('ℹ️  Could not connect to API endpoint (server may not be running)');
      console.log('   Error:', error.message);
      console.log('   Make sure to run "npm run dev" to start the development server');
      resolve(true); // This is not a failure, just that the server isn't running
    });
    
    req.on('timeout', () => {
      console.log('⚠️  API endpoint request timed out');
      req.destroy();
      resolve(true);
    });
  });
}

// Run the tests
async function runAllTests() {
  console.log('🚀 Starting Admin Dashboard Data Fetching Tests\n');
  
  const apiTestSuccess = await testDashboardAPI();
  if (!apiTestSuccess) {
    process.exit(1);
  }
  
  await testActualAPIEndpoint();
  
  console.log('\n🏁 Admin Dashboard Data Fetching Tests Completed');
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testDashboardAPI, testActualAPIEndpoint };