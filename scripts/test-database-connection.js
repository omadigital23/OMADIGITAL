#!/usr/bin/env node

/**
 * Test Database Connection Script
 * Tests if the admin dashboard can connect to the Supabase database
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: './.env.local' });

async function testDatabaseConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n');
  
  // Check if environment variables are set
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
    return false;
  }
  
  console.log('✅ Environment variables found');
  console.log('   Supabase URL:', supabaseUrl);
  
  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Check if we can connect to the database by querying a simple table
    console.log('\n🧪 Test 1: Checking database connectivity...');
    
    // Try to get a simple row from admin_users (avoiding count which causes issues)
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .limit(1);
    
    if (adminError) {
      console.error('❌ Error querying admin_users table:', adminError.message);
      if (adminError.message.includes('infinite recursion')) {
        console.log('   This is the circular reference error you mentioned!');
      }
      return false;
    }
    
    console.log('✅ Successfully connected to admin_users table');
    console.log('   Admin users sample:', adminData?.length || 0, 'rows');
    
    // Test 2: Check if we can query chatbot_interactions
    console.log('\n🧪 Test 2: Checking chatbot_interactions table...');
    
    const { data: interactionsData, error: interactionsError } = await supabase
      .from('chatbot_interactions')
      .select('*')
      .limit(1);
    
    if (interactionsError) {
      console.error('❌ Error querying chatbot_interactions table:', interactionsError.message);
      return false;
    }
    
    console.log('✅ Successfully connected to chatbot_interactions table');
    console.log('   Chatbot interactions sample:', interactionsData?.length || 0, 'rows');
    
    // Test 3: Check if we can query quotes
    console.log('\n🧪 Test 3: Checking quotes table...');
    
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(1);
    
    if (quotesError) {
      console.error('❌ Error querying quotes table:', quotesError.message);
      return false;
    }
    
    console.log('✅ Successfully connected to quotes table');
    console.log('   Quotes sample:', quotesData?.length || 0, 'rows');
    
    // Test 4: Check if we can query knowledge_base
    console.log('\n🧪 Test 4: Checking knowledge_base table...');
    
    const { data: kbData, error: kbError } = await supabase
      .from('knowledge_base')
      .select('*')
      .limit(1);
    
    if (kbError) {
      console.error('❌ Error querying knowledge_base table:', kbError.message);
      return false;
    }
    
    console.log('✅ Successfully connected to knowledge_base table');
    console.log('   Knowledge base entries sample:', kbData?.length || 0, 'rows');
    
    console.log('\n🎉 All database connection tests passed!');
    console.log('   Your admin dashboard should be able to fetch data from the database.');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error during database connection test:', error.message);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testDatabaseConnection().then(success => {
    if (!success) {
      process.exit(1);
    }
  });
}

module.exports = testDatabaseConnection;