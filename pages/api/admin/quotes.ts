import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

// Initialize Supabase client
const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

import { requireAdminApi } from '../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '50', status } = req.query;
    
    // Build the query
    let query = supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: quotes, error } = await query;

    if (error) {
      console.error('Error fetching quotes:', error);
      return res.status(500).json({ error: 'Failed to fetch quotes' });
    }

    // Get status counts for filtering
    const { data: statusCounts, error: statusError } = await supabase
      .from('quotes')
      .select('status')
      .then(result => {
        if (result.error) return result;
        
        // Count by status
        const counts: Record<string, number> = {
          'nouveau': 0,
          'en cours': 0,
          'traité': 0,
          'archivé': 0
        };
        
        result.data?.forEach(quote => {
          counts[quote.status as string] = (counts[quote.status as string] || 0) + 1;
        });
        
        return { data: counts, error: null };
      });

    if (statusError) {
      console.error('Error fetching status counts:', statusError);
    }

    res.status(200).json({
      quotes: quotes || [],
      totalCount: quotes?.length || 0,
      statusCounts: statusCounts || {}
    });
  } catch (error) {
    console.error('Quotes API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});