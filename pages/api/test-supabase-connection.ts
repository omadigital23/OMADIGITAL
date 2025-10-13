import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../src/lib/env-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Initialize Supabase client
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Test connection by fetching table info
    const { data, error } = await supabase
      .from('blog_subscribers')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Supabase connection failed',
        details: error.message 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Supabase connection successful',
      data: data ? `Found ${data.length} records` : 'No data'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}