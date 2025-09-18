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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST to clear database.' });
  }

  try {
    // For security, we should add authentication check here
    // This is a simplified version - in production, you should verify admin credentials
    
    // Clear all data from the kv_store table
    const { error } = await supabase
      .from('kv_store_8066848d')
      .delete()
      .neq('key', ''); // This deletes all records by matching any non-empty key
    
    if (error) {
      console.error('Error clearing database:', error);
      return res.status(500).json({ error: 'Failed to clear database', details: error.message });
    }

    res.status(200).json({ success: true, message: 'Database cleared successfully' });
  } catch (error) {
    console.error('Clear database error:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
});