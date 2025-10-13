// Test script to simulate browser environment for CTA form submission
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Simulate browser environment variables (public only)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing CTA Form Submission with Browser-like Environment...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseKey);

// Create Supabase client (simulating browser environment)
const supabase = createClient(supabaseUrl, supabaseKey);

// Test data matching what would be sent from the CTA form
const formData = {
  name: 'Browser Test User',
  email: 'browser-test@example.com',
  phone: '+221701193811',
  company: 'Browser Test Company',
  service: 'Website Development',
  message: 'This is a test message from the browser CTA form.',
  budget: '1000-5000 FCFA',
  status: 'nouveau',
  created_at: new Date().toISOString()
};

async function testBrowserFormSubmission() {
  console.log('\n--- Testing Browser-like CTA Form Submission ---');
  
  try {
    // Insert test data into quotes table (simulating browser submission)
    const { data, error } = await supabase
      .from('quotes')
      .insert([formData])
      .select();

    if (error) {
      console.error('❌ Error submitting form from browser environment:', error);
      
      // Check if it's an RLS error
      if (error.message && error.message.includes('row-level security')) {
        console.log('⚠️ This is expected in a real browser environment without proper RLS configuration.');
        console.log('⚠️ In production, ensure the RLS policy allows anonymous inserts.');
      }
      
      return;
    }

    console.log('✅ Form submitted successfully from browser environment!');
    console.log('Response:', data);
    
    // Clean up - delete the test record using service role key
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { error: deleteError } = await adminSupabase
      .from('quotes')
      .delete()
      .eq('email', formData.email);
      
    if (deleteError) {
      console.error('⚠️ Error cleaning up test record:', deleteError);
    } else {
      console.log('✅ Test record cleaned up successfully');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testBrowserFormSubmission();