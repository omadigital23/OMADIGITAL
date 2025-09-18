// Script to test newsletter functionality
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase from the verify script
const projectId = 'pcedyohixahtfogfdlig';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewsletterFunctionality() {
  try {
    console.log('🔍 Testing newsletter functionality...');
    console.log('=' .repeat(50));
    
    // Test 1: Check if blog_subscribers table exists and has the correct schema
    console.log('\n📋 Test 1: Checking blog_subscribers table schema...');
    
    // Try to get table info
    const { data: tableInfo, error: tableError } = await supabase
      .from('blog_subscribers')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('❌ Error accessing blog_subscribers table:', tableError.message);
      return false;
    }
    
    console.log('✅ blog_subscribers table exists and is accessible');
    
    // Test 2: Insert a test subscriber
    console.log('\n📋 Test 2: Inserting test subscriber...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testSubscriber = {
      email: testEmail,
      status: 'pending',
      source: 'test',
      confirmation_token: 'test-token-' + Date.now(),
      unsubscribe_token: 'unsubscribe-token-' + Date.now(),
      subscribed_at: new Date().toISOString(),
      confirmed_at: null
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('blog_subscribers')
      .insert(testSubscriber);
    
    if (insertError) {
      console.log('❌ Error inserting test subscriber:', insertError.message);
      return false;
    }
    
    console.log('✅ Test subscriber inserted successfully');
    
    // Test 3: Retrieve the test subscriber
    console.log('\n📋 Test 3: Retrieving test subscriber...');
    
    const { data: retrievedSubscriber, error: retrieveError } = await supabase
      .from('blog_subscribers')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (retrieveError) {
      console.log('❌ Error retrieving test subscriber:', retrieveError.message);
      return false;
    }
    
    console.log('✅ Test subscriber retrieved successfully');
    console.log('📋 Subscriber data:', {
      id: retrievedSubscriber.id,
      email: retrievedSubscriber.email,
      status: retrievedSubscriber.status,
      confirmation_token: retrievedSubscriber.confirmation_token,
      confirmed_at: retrievedSubscriber.confirmed_at
    });
    
    // Test 4: Update subscriber as confirmed
    console.log('\n📋 Test 4: Confirming test subscriber...');
    
    const { error: updateError } = await supabase
      .from('blog_subscribers')
      .update({
        status: 'active',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', retrievedSubscriber.id);
    
    if (updateError) {
      console.log('❌ Error confirming test subscriber:', updateError.message);
      return false;
    }
    
    console.log('✅ Test subscriber confirmed successfully');
    
    // Test 5: Verify confirmation
    console.log('\n📋 Test 5: Verifying confirmation...');
    
    const { data: confirmedSubscriber, error: confirmError } = await supabase
      .from('blog_subscribers')
      .select('status, confirmed_at')
      .eq('id', retrievedSubscriber.id)
      .single();
    
    if (confirmError) {
      console.log('❌ Error verifying confirmation:', confirmError.message);
      return false;
    }
    
    if (confirmedSubscriber.status === 'active' && confirmedSubscriber.confirmed_at) {
      console.log('✅ Test subscriber confirmation verified successfully');
    } else {
      console.log('❌ Test subscriber confirmation verification failed');
      console.log('📋 Subscriber status:', confirmedSubscriber.status);
      console.log('📋 Subscriber confirmed_at:', confirmedSubscriber.confirmed_at);
      return false;
    }
    
    // Test 6: Unsubscribe the test subscriber
    console.log('\n📋 Test 6: Unsubscribing test subscriber...');
    
    const { error: unsubscribeError } = await supabase
      .from('blog_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString()
      })
      .eq('id', retrievedSubscriber.id);
    
    if (unsubscribeError) {
      console.log('❌ Error unsubscribing test subscriber:', unsubscribeError.message);
      return false;
    }
    
    console.log('✅ Test subscriber unsubscribed successfully');
    
    // Test 7: Verify unsubscription
    console.log('\n📋 Test 7: Verifying unsubscription...');
    
    const { data: unsubscribedSubscriber, error: unsubscribeVerifyError } = await supabase
      .from('blog_subscribers')
      .select('status, unsubscribed_at')
      .eq('id', retrievedSubscriber.id)
      .single();
    
    if (unsubscribeVerifyError) {
      console.log('❌ Error verifying unsubscription:', unsubscribeVerifyError.message);
      return false;
    }
    
    if (unsubscribedSubscriber.status === 'unsubscribed' && unsubscribedSubscriber.unsubscribed_at) {
      console.log('✅ Test subscriber unsubscription verified successfully');
    } else {
      console.log('❌ Test subscriber unsubscription verification failed');
      console.log('📋 Subscriber status:', unsubscribedSubscriber.status);
      console.log('📋 Subscriber unsubscribed_at:', unsubscribedSubscriber.unsubscribed_at);
      return false;
    }
    
    // Clean up: Delete the test subscriber
    console.log('\n🧹 Cleaning up test subscriber...');
    
    const { error: deleteError } = await supabase
      .from('blog_subscribers')
      .delete()
      .eq('id', retrievedSubscriber.id);
    
    if (deleteError) {
      console.log('❌ Error deleting test subscriber:', deleteError.message);
    } else {
      console.log('✅ Test subscriber deleted successfully');
    }
    
    console.log('\n🎉 All newsletter functionality tests passed!');
    return true;
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testNewsletterFunctionality()
  .then(success => {
    if (success) {
      console.log('\n✅ Newsletter functionality is working correctly!');
    } else {
      console.log('\n❌ Newsletter functionality tests failed.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });