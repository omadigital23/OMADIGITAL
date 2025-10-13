import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { withAdminAuth } from '../../../src/utils/adminAuth';

// Initialize Supabase client
const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
  process.env['SUPABASE_SERVICE_ROLE_KEY'] || ''
);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch chatbot messages from messages table
    const { data, error, count } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Limit to 100 records to prevent overload

    if (error) {
      console.error('Error fetching chatbot messages:', error);
      return res.status(500).json({ error: 'Failed to fetch chatbot messages' });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
      count: count || 0
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminAuth(handler);