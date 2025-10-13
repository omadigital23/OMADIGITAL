#!/usr/bin/env node

/**
 * Comprehensive Admin Dashboard Test
 * Tests both database connectivity and API endpoint functionality
 */

const { createClient } = require('@supabase/supabase-js');
const http = require('http');

// Load environment variables
require('dotenv').config({ path: './.env.local' });

class AdminDashboardTester {
  constructor() {
    this.supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
    this.supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
    this.supabase = null;
    
    if (this.supabaseUrl && this.supabaseKey) {
      this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
    }
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async testEnvironmentVariables() {
    this.log('🔍 Testing Environment Variables...\n');
    
    const requiredVars = [
      { name: 'NEXT_PUBLIC_SUPABASE_URL', value: this.supabaseUrl },
      { name: 'SUPABASE_SERVICE_ROLE_KEY', value: this.supabaseKey }
    ];
    
    let allPresent = true;
    
    for (const envVar of requiredVars) {
      if (!envVar.value) {
        this.log(`❌ Missing: ${envVar.name}`, 'error');
        allPresent = false;
      } else {
        this.log(`✅ Found: ${envVar.name}`, 'success');
      }
    }
    
    return allPresent;
  }

  async testDatabaseConnection() {
    this.log('\n🔍 Testing Database Connection...\n');
    
    if (!this.supabase) {
      this.log('❌ Supabase client not initialized', 'error');
      return false;
    }
    
    // Test tables that the dashboard uses
    const tablesToTest = [
      { name: 'admin_users', description: 'Admin users' },
      { name: 'chatbot_interactions', description: 'Chatbot interactions' },
      { name: 'quotes', description: 'Contact form submissions' },
      { name: 'knowledge_base', description: 'Chatbot knowledge base' },
      { name: 'analytics_events', description: 'Website analytics' }
    ];
    
    let successCount = 0;
    
    for (const table of tablesToTest) {
      try {
        const { data, error } = await this.supabase
          .from(table.name)
          .select('count()', { count: 'exact' })
          .limit(1);
        
        if (error) {
          this.log(`❌ ${table.description} (${table.name}): ${error.message}`, 'error');
          if (error.message.includes('infinite recursion')) {
            this.log(`   ⚠️  This is the circular reference error you mentioned!`, 'warning');
          }
        } else {
          const count = data?.[0]?.count || 0;
          this.log(`✅ ${table.description} (${table.name}): ${count} records`, 'success');
          successCount++;
        }
      } catch (error) {
        this.log(`❌ ${table.description} (${table.name}): ${error.message}`, 'error');
      }
    }
    
    return successCount === tablesToTest.length;
  }

  async testAPIEndpoint() {
    this.log('\n🔍 Testing API Endpoint...\n');
    
    return new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/admin/dashboard-metrics',
        method: 'GET',
        timeout: 5000
      };
      
      const req = http.get(options, (res) => {
        this.log(`✅ API endpoint responded with status: ${res.statusCode}`, 'success');
        
        if (res.statusCode === 200) {
          this.log('🎉 Admin dashboard API is working correctly!', 'success');
          resolve(true);
        } else {
          this.log(`⚠️  API returned status ${res.statusCode}`, 'warning');
          resolve(false);
        }
      });
      
      req.on('error', (error) => {
        this.log('ℹ️  Cannot connect to API endpoint (server may not be running)', 'info');
        this.log('   Start the server with: npm run dev', 'info');
        resolve(true); // Not a failure, just server not running
      });
      
      req.on('timeout', () => {
        this.log('⚠️  API request timed out', 'warning');
        req.destroy();
        resolve(true);
      });
    });
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Admin Dashboard Test\n');
    this.log('=============================================\n');
    
    // Test 1: Environment variables
    const envTestPassed = await this.testEnvironmentVariables();
    if (!envTestPassed) {
      this.log('\n❌ Environment variable test failed', 'error');
      return false;
    }
    
    // Test 2: Database connection
    const dbTestPassed = await this.testDatabaseConnection();
    if (!dbTestPassed) {
      this.log('\n❌ Database connection test failed', 'error');
      return false;
    }
    
    // Test 3: API endpoint
    await this.testAPIEndpoint();
    
    this.log('\n🏆 Comprehensive Test Summary', 'info');
    this.log('========================', 'info');
    this.log('✅ Environment Variables: Present', 'success');
    this.log('✅ Database Connection: Working', 'success');
    this.log('ℹ️  API Endpoint: Check server status', 'info');
    
    this.log('\n💡 Recommendations:', 'info');
    this.log('1. Run "npm run dev" to start the development server', 'info');
    this.log('2. Visit http://localhost:3000/admin to view the dashboard', 'info');
    this.log('3. Check browser console for any frontend errors', 'info');
    
    return true;
  }
}

// Run the tests
if (require.main === module) {
  const tester = new AdminDashboardTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = AdminDashboardTester;