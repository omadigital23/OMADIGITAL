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

    // Get all quote submissions from quotes table
    const { data: quotes, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      return res.status(500).json({ error: 'Failed to fetch quote submissions' });
    }

    // Calculate metrics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalQuotes = quotes?.length || 0;
    const todayQuotes = quotes?.filter(q => 
      new Date(q.created_at) >= today
    ).length || 0;
    const thisWeekQuotes = quotes?.filter(q => 
      new Date(q.created_at) >= oneWeekAgo
    ).length || 0;

    // Group by status
    const byStatus = quotes?.reduce((acc: any, quote) => {
      const status = quote.status || 'nouveau';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {}) || {};

    // Group by service
    const byService = quotes?.reduce((acc: any, quote) => {
      const service = quote.service || 'Non spécifié';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {}) || {};

    // Return data
    return res.status(200).json({
      success: true,
      data: {
        dashboard: {
          total_quotes: totalQuotes,
          today_quotes: todayQuotes,
          this_week_quotes: thisWeekQuotes,
          by_status: byStatus,
          by_service: byService
        },
        quotes: quotes || []
      }
    });
  } catch (error) {
    console.error('Quote submissions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
