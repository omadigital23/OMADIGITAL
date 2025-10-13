// API endpoint to test CTA form submission
import { createClient } from '@supabase/supabase-js';

// Use the same configuration as in the CTASection component
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { formData } = req.body;

  try {
    console.log('Attempting to insert form data:', formData);
    
    // Insert test data into quotes table
    const { data, error } = await supabase
      .from('quotes')
      .insert([formData])
      .select();

    if (error) {
      console.error('Error submitting form:', error);
      return res.status(500).json({ 
        error: 'Failed to submit form',
        details: error.message,
        code: error.code
      });
    }

    console.log('Form submitted successfully:', data);
    return res.status(200).json({ 
      success: true, 
      message: 'Form submitted successfully',
      data 
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      error: 'Unexpected error occurred',
      details: error.message 
    });
  }
}