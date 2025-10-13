import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Only import the specific environment variables we need
const NEXT_PUBLIC_SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL'] || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] || '';

// Validate required environment variables
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

// Initialize Supabase client with service role key to bypass RLS
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id } = req.query;
    
    let query = supabase
      .from('chatbot_interactions')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (session_id && typeof session_id === 'string') {
      query = query.eq('session_id', session_id);
    }
    
    const { data, error } = await query['limit'](1000);
    
    if (error) {
      console.error('Error fetching chatbot interactions:', error);
      return res.status(500).json({ error: 'Failed to fetch chatbot interactions' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Chatbot interactions API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}