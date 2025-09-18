/**
 * Script to check the actual table structure in Supabase
 */

// Import required modules
const { createClient } = require('@supabase/supabase-js');

// Configuration
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 Checking Knowledge Base Table Structure...\n');
  
  try {
    // Try to get table info using Supabase's internal method
    console.log('Attempting to retrieve table structure...');
    
    // First, try a simple select with just the id column
    const { data: simpleData, error: simpleError } = await supabase
      .from('knowledge_base')
      .select('id')
      .limit(1);
    
    if (simpleError) {
      console.error('❌ Simple query failed:', simpleError.message);
      // Try to see what columns are actually available
      console.log('Trying to get any available columns...');
      
      // Try selecting all columns (this might work even if specific ones don't)
      const { data: allData, error: allError } = await supabase
        .from('knowledge_base')
        .select('*')
        .limit(1);
      
      if (allError) {
        console.error('❌ All columns query failed:', allError.message);
        return false;
      } else {
        console.log('✅ All columns query succeeded');
        if (allData && allData.length > 0) {
          console.log('Available columns:');
          const firstRow = allData[0];
          Object.keys(firstRow).forEach(key => {
            console.log(`- ${key}: ${typeof firstRow[key]}`);
          });
        } else {
          console.log('Table is empty');
        }
        return true;
      }
    } else {
      console.log('✅ Simple query succeeded');
      console.log('Table exists and is accessible');
      
      // Now try to get the actual structure
      const { data: fullData, error: fullError } = await supabase
        .from('knowledge_base')
        .select('*')
        .limit(1);
      
      if (fullError) {
        console.error('❌ Full query failed:', fullError.message);
        return false;
      } else {
        console.log('✅ Full query succeeded');
        if (fullData && fullData.length > 0) {
          console.log('Available columns:');
          const firstRow = fullData[0];
          Object.keys(firstRow).forEach(key => {
            console.log(`- ${key}: ${typeof firstRow[key]}`);
          });
        } else {
          console.log('Table is empty');
        }
        return true;
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
    return false;
  }
}

// Run the check
checkTableStructure().then(success => {
  if (!success) {
    console.log('\n⚠️  There may be an issue with the table structure or schema cache.');
    console.log('Try refreshing the Supabase schema cache or restarting the services.');
    process.exit(1);
  } else {
    console.log('\n🎉 Table structure check completed successfully!');
  }
});