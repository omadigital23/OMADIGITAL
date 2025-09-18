import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

import { requireAdminApi } from '../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST to clear all data.' });
  }

  try {
    // Initialize Supabase client with service role key for admin privileges
    const supabaseAdmin = createClient(
      NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // List of all tables to clear
    const tablesToClear = [
      'quotes',
      'conversations',
      'messages',
      'knowledge_base',
      'user_intents',
      'bot_responses',
      'blog_articles',
      'blog_article_stats',
      'blog_comments',
      'blog_categories',
      'blog_tags',
      'blog_article_views',
      'blog_subscribers',
      'blog_seo_data',
      'performance_alerts',
      'pagespeed_results',
      'performance_budget_checks',
      'performance_trends',
      'real_user_metrics',
      'analytics_events',
      'web_vitals',
      'ab_test_results'
    ];

    // Clear each table
    const errors: string[] = [];
    
    for (const table of tablesToClear) {
      try {
        // For Supabase, we need to use a WHERE clause
        // We'll use a condition that matches all records by checking that id is not null
        const { error } = await supabaseAdmin
          .from(table)
          .delete()
          .not('id', 'is', null);
        
        if (error) {
          // Only log the error but don't fail completely if one table fails
          console.warn(`Warning: Error clearing table ${table}: ${error.message}`);
        }
      } catch (error) {
        // Only log the error but don't fail completely if one table fails
        console.warn(`Warning: Exception clearing table ${table}: ${(error as Error).message}`);
      }
    }
    
    // Even if there were warnings, we consider the operation successful
    // as long as we didn't encounter critical errors
    res.status(200).json({ success: true, message: 'Database clearing operation completed' });
  } catch (error) {
    console.error('Clear all data error:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
});