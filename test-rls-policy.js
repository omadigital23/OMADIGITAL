// Test script to verify RLS policy for quotes table
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Test with anonymous key (simulating browser environment)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing RLS Policy for Quotes Table...');
console.log('Supabase URL:', supabaseUrl);

// Create Supabase client with anonymous key
const anonSupabase = createClient(supabaseUrl, supabaseAnonKey);

// Test data
const testData = {
  name: 'RLS Test User',
  email: 'rls-test@example.com',
  phone: '+221701193811',
  company: 'RLS Test Company',
  service: 'Website Development',
  message: 'This is a test to verify RLS policy.',
  budget: '1000-5000 FCFA',
  status: 'nouveau'
};

async function testRLSPolicy() {
  console.log('\n--- Testing Insert with Anonymous Key ---');
  
  try {
    // Try to insert with anonymous key
    const { data, error } = await anonSupabase
      .from('quotes')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ Error with anonymous insert:', error);
      
      // Check if it's specifically an RLS error
      if (error.code === '42501') {
        console.log('❌ RLS policy is preventing anonymous inserts');
        console.log('This suggests the policy may not be configured correctly');
      }
    } else {
      console.log('✅ Anonymous insert successful!');
      console.log('Data:', data);
      
      // Clean up using service role key
      const adminSupabase = createClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      await adminSupabase
        .from('quotes')
        .delete()
        .eq('email', testData.email);
        
      console.log('✅ Test record cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  console.log('\n--- Testing Insert with Service Role Key ---');
  
  try {
    // Try to insert with service role key (should always work)
    const adminSupabase = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data, error } = await adminSupabase
      .from('quotes')
      .insert([{
        ...testData,
        email: 'admin-test@example.com'
      }])
      .select();

    if (error) {
      console.error('❌ Error with service role insert:', error);
    } else {
      console.log('✅ Service role insert successful!');
      console.log('Data:', data);
      
      // Clean up
      await adminSupabase
        .from('quotes')
        .delete()
        .eq('email', 'admin-test@example.com');
        
      console.log('✅ Test record cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testRLSPolicy();