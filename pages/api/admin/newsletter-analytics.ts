import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create Supabase client with service role key
    const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all newsletter subscribers
    const { data: subscribers, error } = await supabase
      .from('blog_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching newsletter subscribers:', error);
      return res.status(500).json({ error: 'Failed to fetch newsletter data' });
    }

    // Calculate metrics
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalSubscribers = subscribers?.length || 0;
    const activeSubscribers = subscribers?.filter(s => s.status === 'active').length || 0;
    const pendingSubscribers = subscribers?.filter(s => s.status === 'pending').length || 0;
    const newThisWeek = subscribers?.filter(s => 
      new Date(s.created_at) >= oneWeekAgo
    ).length || 0;

    const conversionRate = totalSubscribers > 0 
      ? (activeSubscribers / totalSubscribers) * 100 
      : 0;

    // Return dashboard data
    return res.status(200).json({
      success: true,
      data: {
        dashboard: {
          total_subscribers: totalSubscribers,
          active_subscribers: activeSubscribers,
          pending_subscribers: pendingSubscribers,
          new_this_week: newThisWeek,
          conversion_rate: conversionRate
        },
        subscribers: subscribers || []
      }
    });
  } catch (error) {
    console.error('Newsletter analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
