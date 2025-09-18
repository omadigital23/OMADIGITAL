// Script to test Supabase connections for CTA form, chatbot, and admin page
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from user input
const SUPABASE_URL = 'https://pcedyohixahtfogfdlig.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzcyMzksImV4cCI6MjA3Mjk1MzIzOX0.OT-zQbg0Q8BzupmUzQH9xNL8aRCKNO73onKlsaLaE30';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

console.log('🔍 Testing Supabase connections...');
console.log('=' .repeat(50));

async function testConnections() {
  try {
    // Test 1: Anonymous client connection (for CTA form and chatbot)
    console.log('\n📋 Test 1: Anonymous client connection (CTA form, chatbot)');
    const anonClient = createClient(SUPABASE_URL, ANON_KEY);
    
    // Test basic connection
    const { data: anonData, error: anonError } = await anonClient
      .from('quotes')
      .select('id')
      .limit(1);
    
    if (anonError) {
      console.log('❌ Anonymous client connection failed:', anonError.message);
      return false;
    }
    
    console.log('✅ Anonymous client connection successful');
    
    // Test 2: Service role client connection (for admin)
    console.log('\n📋 Test 2: Service role client connection (admin)');
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    
    // Test basic connection
    const { data: serviceData, error: serviceError } = await serviceClient
      .from('quotes')
      .select('id')
      .limit(1);
    
    if (serviceError) {
      console.log('❌ Service role client connection failed:', serviceError.message);
      return false;
    }
    
    console.log('✅ Service role client connection successful');
    
    // Test 3: CTA form functionality (quotes table)
    console.log('\n📋 Test 3: CTA form functionality (quotes table)');
    
    // Insert a test quote
    const testQuote = {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+221701193811',
      company: 'Test Company',
      service: 'Automatisation WhatsApp',
      message: 'Test message for CTA form',
      budget: '500.000 - 1.000.000 CFA',
      status: 'nouveau'
    };
    
    const { data: insertData, error: insertError } = await anonClient
      .from('quotes')
      .insert([testQuote]);
    
    if (insertError) {
      console.log('❌ CTA form submission failed:', insertError.message);
      return false;
    }
    
    console.log('✅ CTA form submission successful');
    
    // Retrieve the inserted quote to verify
    const { data: retrievedQuote, error: retrieveError } = await serviceClient
      .from('quotes')
      .select('*')
      .eq('email', 'test@example.com')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (retrieveError) {
      console.log('❌ Failed to retrieve test quote:', retrieveError.message);
      return false;
    }
    
    console.log('✅ Test quote retrieval successful');
    console.log('📋 Test quote ID:', retrievedQuote.id);
    
    // Clean up: Delete the test quote
    const { error: deleteError } = await serviceClient
      .from('quotes')
      .delete()
      .eq('id', retrievedQuote.id);
    
    if (deleteError) {
      console.log('⚠️ Failed to clean up test quote:', deleteError.message);
    } else {
      console.log('✅ Test quote cleaned up successfully');
    }
    
    // Test 4: Chatbot functionality (chatbot_interactions table)
    console.log('\n📋 Test 4: Chatbot functionality (chatbot_interactions table)');
    
    // Check if chatbot_interactions table exists
    const { data: chatData, error: chatError } = await serviceClient
      .from('chatbot_interactions')
      .select('message_id')
      .limit(1);
    
    if (chatError && chatError.code !== '42P01') { // 42P01 = undefined_table
      console.log('❌ Chatbot interactions table access failed:', chatError.message);
      return false;
    } else if (chatError) {
      console.log('⚠️ Chatbot interactions table does not exist (may be expected in fresh setup)');
    } else {
      console.log('✅ Chatbot interactions table accessible');
    }
    
    // Test 5: Admin functionality (user_roles table)
    console.log('\n📋 Test 5: Admin functionality (user_roles table)');
    
    // Check if user_roles table exists
    const { data: adminData, error: adminError } = await serviceClient
      .from('user_roles')
      .select('id')
      .limit(1);
    
    if (adminError && adminError.code !== '42P01') { // 42P01 = undefined_table
      console.log('❌ User roles table access failed:', adminError.message);
      return false;
    } else if (adminError) {
      console.log('⚠️ User roles table does not exist (may be expected in fresh setup)');
    } else {
      console.log('✅ User roles table accessible');
    }
    
    // Test 6: Blog functionality (blog_subscribers table)
    console.log('\n📋 Test 6: Blog functionality (blog_subscribers table)');
    
    // Check if blog_subscribers table exists and has correct schema
    const { data: blogData, error: blogError } = await serviceClient
      .from('blog_subscribers')
      .select('id, email, status, confirm_token, unsubscribe_token, confirmed')
      .limit(1);
    
    if (blogError && blogError.code !== '42P01') { // 42P01 = undefined_table
      console.log('❌ Blog subscribers table access failed:', blogError.message);
      return false;
    } else if (blogError) {
      console.log('⚠️ Blog subscribers table does not exist (may be expected in fresh setup)');
    } else {
      console.log('✅ Blog subscribers table accessible');
      console.log('📋 Blog subscribers table schema verified');
    }
    
    console.log('\n🎉 All Supabase connection tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the tests
testConnections()
  .then(success => {
    if (success) {
      console.log('\n✅ All Supabase connections are working correctly!');
    } else {
      console.log('\n❌ Some Supabase connection tests failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });