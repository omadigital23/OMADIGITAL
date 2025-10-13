const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Use the same credentials from your .env.local file
const supabaseUrl = 'https://kuxlimvekrblnggfkahw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eGxpbXZla3JibG5nZ2ZrYWh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg0OTIzOCwiZXhwIjoyMDc0NDI1MjM4fQ._U-Ju-PWd_ass6nwHIEZ21DSvMBTLuURP_UouvomY2c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSqlFix() {
  try {
    console.log('Reading SQL fix file...');
    const sql = fs.readFileSync('fix-supabase-triggers.sql', 'utf8');
    
    console.log('Executing SQL fix...');
    // Note: Supabase JS client doesn't support raw SQL execution
    // We'll need to execute this in the Supabase dashboard manually
    console.log('Please execute the following SQL in your Supabase dashboard:');
    console.log('=== SQL TO EXECUTE ===');
    console.log(sql);
    console.log('=== END SQL ===');
    
    // Let's test if we can insert data now
    console.log('Testing direct insert after fix...');
    const testData = {
      email: 'test-after-fix@example.com',
      status: 'pending',
      source: 'fix_test',
      subscribed_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('blog_subscribers')
      .insert(testData);
    
    if (error) {
      console.error('Error inserting test data:', error);
    } else {
      console.log('Successfully inserted test data:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

executeSqlFix();