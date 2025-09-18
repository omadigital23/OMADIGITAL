/**
 * Final verification script to check if all essential components are working
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration with new credentials
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

async function verifySetup() {
  console.log('🔍 Final Setup Verification');
  console.log('=' .repeat(50));
  
  try {
    // Create Supabase client with new credentials
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created successfully');
    console.log(`📍 URL: ${supabaseUrl}`);

    // Test 1: Check if we can access the knowledge base
    console.log('\n📋 Test 1: Checking knowledge base access...');
    
    const { data: kbData, error: kbError } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact' });
    
    if (kbError) {
      console.log('❌ Knowledge base access failed:', kbError.message);
      return false;
    } else {
      console.log(`✅ Knowledge base accessible - ${kbData.length} entries found`);
    }

    // Test 2: Check if we can access user roles
    console.log('\n👤 Test 2: Checking user roles access...');
    
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact' });
    
    if (rolesError) {
      console.log('❌ User roles access failed:', rolesError.message);
      return false;
    } else {
      console.log(`✅ User roles accessible - ${rolesData.length} entries found`);
    }

    // Test 3: Check if we can access conversations table
    console.log('\n💬 Test 3: Checking conversations table access...');
    
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*', { count: 'exact' });
    
    if (convError) {
      console.log('❌ Conversations table access failed:', convError.message);
      return false;
    } else {
      console.log(`✅ Conversations table accessible - ${convData.length} entries found`);
    }

    // Test 4: Check if we can access messages table
    console.log('\n✉️  Test 4: Checking messages table access...');
    
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('*', { count: 'exact' });
    
    if (msgError) {
      console.log('❌ Messages table access failed:', msgError.message);
      return false;
    } else {
      console.log(`✅ Messages table accessible - ${msgData.length} entries found`);
    }

    // Test 5: Check if we can access quotes table
    console.log('\n📝 Test 5: Checking quotes table access...');
    
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('*', { count: 'exact' });
    
    if (quotesError) {
      console.log('❌ Quotes table access failed:', quotesError.message);
      return false;
    } else {
      console.log(`✅ Quotes table accessible - ${quotesData.length} entries found`);
    }

    // Test 6: Verify admin user exists
    console.log('\n🔐 Test 6: Verifying admin user exists...');
    
    const { data: adminData, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'admin')
      .limit(1);
    
    if (adminError) {
      console.log('❌ Admin user verification failed:', adminError.message);
      return false;
    } else if (adminData.length > 0) {
      console.log(`✅ Admin user verified - User ID: ${adminData[0].user_id}`);
    } else {
      console.log('❌ No admin user found');
      return false;
    }

    console.log('\n🎉 All tests passed! Setup is complete.');
    console.log('\n📝 Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Access the admin panel at http://localhost:3000/admin');
    console.log('3. Test the chatbot functionality on the homepage');
    
    return true;
    
  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the verification if called directly
if (require.main === module) {
  verifySetup()
    .then(success => {
      if (success) {
        console.log('\n🏆 Setup verification successful!');
      } else {
        console.log('\n💥 Setup verification failed.');
      }
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { verifySetup };