import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

import { requireAdminApi } from '../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add basic admin authentication check (you can enhance this based on your auth system)
  const authHeader = req.headers.authorization;
  if (!authHeader && req.method !== 'GET') {
    return res.status(401).json({ error: 'Authentication required' });
  }

  switch (req.method) {
    case 'GET':
      try {
        console.log('📖 Fetching blog articles...');
        const { limit = '50', status } = req.query;
        
        // Build the query
        let query = supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(parseInt(limit as string));

        // Filter by status if provided
        if (status && status !== 'all') {
          query = query.eq('status', status);
        }

        const { data: articles, error } = await query;

        if (error) {
          console.error('Error fetching articles:', error);
          return res.status(500).json({ error: 'Failed to fetch articles' });
        }

        // Get status counts for filtering
        const { data: statusCounts, error: statusError } = await supabase
          .from('blog_posts')
          .select('status')
          .then(result => {
            if (result.error) return result;
            
            // Count by status
            const counts: Record<string, number> = {
              'draft': 0,
              'published': 0,
              'archived': 0
            };
            
            result.data?.forEach(article => {
              counts[article.status as string] = (counts[article.status as string] || 0) + 1;
            });
            
            return { data: counts, error: null };
          });

        if (statusError) {
          console.error('Error fetching status counts:', statusError);
        }

        res.status(200).json({
          articles: articles || [],
          totalCount: articles?.length || 0,
          statusCounts: statusCounts || {}
        });
      } catch (error) {
        console.error('Blog articles API error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'POST':
      try {
        const { title, content, language = 'fr' } = req.body;

        // Validate input
        if (!title) {
          return res.status(400).json({ error: 'Title is required' });
        }

        // Insert new article
        const { data, error } = await supabase
          .from('blog_posts')
          .insert({
            title,
            content,
            language,
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating article:', error);
          return res.status(500).json({ error: 'Failed to create article' });
        }

        res.status(200).json({ 
          success: true, 
          message: 'Article created successfully',
          article: data
        });
      } catch (error) {
        console.error('Blog article creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
});