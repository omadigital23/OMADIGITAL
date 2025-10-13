const { createClient } = require('@supabase/supabase-js');

// Use the same credentials from your .env.local file
const supabaseUrl = 'https://kuxlimvekrblnggfkahw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1eGxpbXZla3JibG5nZ2ZrYWh3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg0OTIzOCwiZXhwIjoyMDc0NDI1MjM4fQ._U-Ju-PWd_ass6nwHIEZ21DSvMBTLuURP_UouvomY2c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectInsert() {
  try {
    console.log('Testing direct Supabase insert...');
    
    // Generate tokens
    const confirmationToken = Buffer.from(`test@example.com-${Date.now()}-${Math.random()}`).toString('base64');
    const unsubscribeToken = Buffer.from(`test@example.com-${Date.now()}-${Math.random()}`).toString('base64');
    
    // Prepare subscriber data
    const subscriberData = {
      email: 'test-direct@example.com',
      status: 'pending',
      source: 'direct_test',
      confirmation_token: confirmationToken,
      unsubscribe_token: unsubscribeToken,
      subscribed_at: new Date().toISOString(),
      confirmed_at: null
    };
    
    console.log('Inserting data:', subscriberData);
    
    // Insert data directly
    const { data, error } = await supabase
      .from('blog_subscribers')
      .insert(subscriberData);
    
    if (error) {
      console.error('Error inserting data:', error);
      return;
    }
    
    console.log('Successfully inserted data:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testDirectInsert();