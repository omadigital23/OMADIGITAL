// Test script for CTA form submission to Supabase
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

// Create Supabase client
// Using service role key to bypass RLS for testing
const supabase = createClient(supabaseUrl, supabaseKey);

// Test data for form submission
const testData = {
  name: 'Test User',
  email: 'test@example.com',
  phone: '+221701193811',
  company: 'Test Company',
  service: 'Website Development',
  message: 'This is a test message from the CTA form.',
  budget: '1000-5000 FCFA',
  status: 'nouveau'
};

async function testFormSubmission() {
  console.log('\n--- Testing CTA Form Submission ---');
  
  try {
    // Insert test data into quotes table
    const { data, error } = await supabase
      .from('quotes')
      .insert([testData])
      .select();

    if (error) {
      console.error('❌ Error submitting form:', error);
      // Let's also try to get more information about the table
      const { data: tableData, error: tableError } = await supabase
        .from('quotes')
        .select('*');
      
      if (tableError) {
        console.error('❌ Error querying quotes table:', tableError);
      } else {
        console.log('Quotes table data:', tableData);
      }
      return;
    }

    console.log('✅ Form submitted successfully!');
    
    // Wait a moment for the insert to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Retrieve the inserted record to verify
    const { data: retrievedData, error: retrieveError } = await supabase
      .from('quotes')
      .select('*')
      .eq('email', testData.email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (retrieveError) {
      console.error('❌ Error retrieving data:', retrieveError);
      return;
    }

    if (retrievedData && retrievedData.length > 0) {
      console.log('✅ Retrieved submitted record:');
      console.log(JSON.stringify(retrievedData[0], null, 2));
    } else {
      console.log('❌ No record found with the test email');
      return;
    }
    
    // Clean up - delete the test record
    if (retrievedData && retrievedData.length > 0) {
      const { error: deleteError } = await supabase
        .from('quotes')
        .delete()
        .eq('id', retrievedData[0].id);
        
      if (deleteError) {
        console.error('⚠️ Error cleaning up test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testFormSubmission();