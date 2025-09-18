// Simple test script to verify database connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration - Use the same environment variables as the app
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);
console.log('Supabase Service Role Key exists:', !!supabaseServiceRoleKey);

// Try using the anon key first
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🧪 Testing Database Connection with Anon Key...');
  
  try {
    // Test a simple query to see if we can connect
    const { data, error } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed with Anon Key:', error.message);
      console.error('Error details:', error);
      
      // Try with service role key if anon key fails
      console.log('\nTrying with Service Role Key...');
      const supabaseService = createClient(supabaseUrl, supabaseServiceRoleKey);
      const { data: serviceData, error: serviceError } = await supabaseService
        .from('conversations')
        .select('id')
        .limit(1);
      
      if (serviceError) {
        console.error('❌ Database connection failed with Service Role Key:', serviceError.message);
        console.error('Error details:', serviceError);
        return;
      }
      
      console.log('✅ Database connection successful with Service Role Key!');
      console.log('Sample data:', serviceData);
      return;
    }
    
    console.log('✅ Database connection successful with Anon Key!');
    console.log('Sample data:', data);
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testConnection();