import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

import { requireAdminApi } from '../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Métriques simples depuis Supabase
    const [conversations, quotes] = await Promise.all([
      supabase.from('chatbot_interactions').select('*', { count: 'exact' }),
      supabase.from('quotes').select('*', { count: 'exact' })
    ]);

    const metrics = {
      totalUsers: conversations['count'] || 0,
      activeChats: Math.floor(Math.random() * 10), // Simulation
      conversionRate: quotes['count'] && conversations['count'] 
        ? Math.round((quotes['count'] / conversations['count']) * 100) 
        : 0,
      responseTime: Math.floor(Math.random() * 500) + 200 // Simulation
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});