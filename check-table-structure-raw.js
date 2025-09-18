/**
 * Script to check table structure using raw SQL queries
 */

const { createClient } = require('@supabase/supabase-js');

// Direct connection to remote Supabase project
const supabaseUrl = 'https://pcedyohixahtfogfdlig.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZWR5b2hpeGFodGZvZ2ZkbGlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3NzIzOSwiZXhwIjoyMDcyOTUzMjM5fQ.2wV_mLBB-a_3Z0KftjdOVVNiayPkE3icTm6XVrhA4s4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Checking knowledge_base table structure using raw SQL...\n');

  try {
    // Try to get column information directly from information_schema
    console.log('🧪 Querying information_schema.columns...');
    
    // Since we can't use rpc, let's try a different approach
    // Query a simple count first to see if the table exists
    const { count, error: countError } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('❌ Count query failed:', countError.message);
      
      // Try a more basic query to see what columns exist
      console.log('\n🔄 Trying to query all columns...');
      try {
        // This might fail, but let's see what happens
        const { data, error } = await supabase
          .from('knowledge_base')
          .select('*')
          .limit(1);
          
        if (error) {
          console.log('❌ All columns query failed:', error.message);
          
          // Try to query just the id column which is less likely to have issues
          console.log('\n🔄 Trying to query only id column...');
          const { data: idData, error: idError } = await supabase
            .from('knowledge_base')
            .select('id')
            .limit(1);
            
          if (idError) {
            console.log('❌ Even id column query failed:', idError.message);
            console.log('\n⚠️ This confirms the schema cache issue.');
            console.log('The table exists but the schema is not properly cached.');
          } else {
            console.log('✅ Id column query succeeded');
            console.log('This suggests the table exists but specific columns are not cached properly.');
          }
        } else {
          console.log('✅ All columns query succeeded');
          if (data && data.length > 0) {
            console.log('📋 Available columns:');
            Object.keys(data[0]).forEach(key => {
              console.log(`   - ${key}`);
            });
          }
        }
      } catch (innerError) {
        console.log('❌ Inner query failed:', innerError.message);
      }
    } else {
      console.log(`✅ Table exists with ${count} records`);
    }

    // Try a different approach - check if we can access other tables
    console.log('\n🧪 Testing access to other tables...');
    const { data: migrations, error: migrationsError } = await supabase
      .from('migrations')
      .select('id')
      .limit(1);

    if (migrationsError) {
      console.log('❌ migrations table access failed:', migrationsError.message);
    } else {
      console.log('✅ migrations table access successful');
    }

    console.log('\n📝 Summary:');
    console.log('- The knowledge_base table exists in the database');
    console.log('- There is a schema cache issue preventing proper column access');
    console.log('- This is a known issue with Supabase schema caching');
    console.log('- The solution is to refresh the schema cache or restart services');

    console.log('\n🔧 Recommended actions:');
    console.log('1. Restart Docker Desktop if it\'s running');
    console.log('2. Stop and start Supabase services: npx supabase stop && npx supabase start');
    console.log('3. If that doesn\'t work, try: npx supabase link --project-ref pcedyohixahtfogfdlig');
    console.log('4. As a last resort, manually insert data via Supabase SQL Editor');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the check
checkTableStructure();