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
    // Fetch performance metrics from analytics_events table
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'web_vitals')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching performance metrics:', error);
      return res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }

    // Transform the data for the frontend
    const metrics = data.map(event => {
      const props = event.event_properties || {};
      return {
        timestamp: event.timestamp,
        fcp: props.fcp || 0,
        lcp: props.lcp || 0,
        fid: props.fid || 0,
        cls: props.cls || 0,
        ttfb: props.ttfb || 0
      };
    });

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error in performance metrics API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminAuth(handler);