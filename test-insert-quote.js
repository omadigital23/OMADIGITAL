// Script to test inserting a quote
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const projectId = 'osewplkvprtrlsrvegpl';
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zZXdwbGt2cHJ0cmxzcnZlZ3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI1MDg0NywiZXhwIjoyMDcxODI2ODQ3fQ.TSp2sDDbcB8so74xwwwlJjBT9oRt4_htiCM02wZFV_8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsertQuote() {
  try {
    console.log('Testing quote insertion...');
    
    // Insert a test quote
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+221XXXXXXXX',
        service: 'Test Service',
        message: 'Test message for verification',
        status: 'nouveau'
      })
      .select();
    
    if (error) {
      console.error('Error inserting quote:', error.message);
      return;
    }
    
    console.log('✅ Quote inserted successfully!');
    console.log('Inserted data:', data);
    
    // Clean up test record
    if (data && data[0]) {
      const { error: deleteError } = await supabase
        .from('quotes')
        .delete()
        .eq('id', data[0].id);
      
      if (deleteError) {
        console.warn('Warning: Could not clean up test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
testInsertQuote();