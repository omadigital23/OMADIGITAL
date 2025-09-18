import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { requireAdminApi } from '../../../src/utils/adminApiGuard';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch analytics events
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching analytics events:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics events' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error in analytics events API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminAuth(handler);