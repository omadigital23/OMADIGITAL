const { createClient } = require('@supabase/supabase-js');

// Use the same credentials from your .env.local file
const supabaseUrl = 'https://kuxlimvekrblnggfkahw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eGxpbXZla3JibG5nZ2ZrYWh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg0OTIzOCwiZXhwIjoyMDc0NDI1MjM4fQ._U-Ju-PWd_ass6nwHIEZ21DSvMBTLuURP_UouvomY2c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test fetching data from the blog_subscribers table
    const { data, error } = await supabase
      .from('blog_subscribers')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error connecting to Supabase:', error);
      return;
    }
    
    console.log('Successfully connected to Supabase!');
    console.log('Table exists and is accessible');
    console.log('Sample data:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testConnection();