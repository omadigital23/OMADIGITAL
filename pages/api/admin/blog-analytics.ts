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
    const { period, start, end } = req.query;
    
    // Calculate date range based on parameters
    const endDate = end ? new Date(end as string) : new Date();
    let startDate = start ? new Date(start as string) : new Date();
    
    if (!start && !end) {
      // Calculate date range based on period only if start/end not provided
      switch (period) {
        case '1d':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }
    }

    // Fetch blog page views
    const { data: blogViews, error: blogViewsError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'blog_page_view')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (blogViewsError) {
      console.error('Error fetching blog views:', blogViewsError);
    }

    // Fetch blog article views
    const { data: articleViews, error: articleViewsError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'blog_article_view')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (articleViewsError) {
      console.error('Error fetching article views:', articleViewsError);
    }

    // Fetch blog scroll depth data
    const { data: scrollDepth, error: scrollDepthError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'blog_scroll_depth')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (scrollDepthError) {
      console.error('Error fetching scroll depth data:', scrollDepthError);
    }

    // Fetch blog performance data
    const { data: blogPerformance, error: performanceError } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'blog_page_performance')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (performanceError) {
      console.error('Error fetching blog performance data:', performanceError);
    }

    // Process and aggregate the data
    const processedData = processBlogAnalyticsData(
      blogViews || [],
      articleViews || [],
      scrollDepth || [],
      blogPerformance || [],
      startDate,
      endDate
    );

    res.status(200).json(processedData);
  } catch (error) {
    console.error('Blog Analytics API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process and aggregate blog analytics data
function processBlogAnalyticsData(
  blogViews: any[],
  articleViews: any[],
  scrollDepth: any[],
  blogPerformance: any[],
  startDate: Date,
  endDate: Date
) {
  // Calculate blog statistics
  const totalBlogPageViews = blogViews.length;
  const totalArticleViews = articleViews.length;
  
  // Group article views by article ID
  const articleViewCounts: Record<string, number> = {};
  articleViews.forEach(view => {
    const articleId = view.event_properties?.article_id;
    if (articleId) {
      articleViewCounts[articleId] = (articleViewCounts[articleId] || 0) + 1;
    }
  });
  
  // Find most popular articles
  const popularArticles = Object.entries(articleViewCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([id, views]) => ({ id: parseInt(id), views }));
  
  // Calculate scroll depth statistics
  const scrollDepthStats: Record<string, number> = {
    '25%': 0,
    '50%': 0,
    '75%': 0,
    '100%': 0
  };
  
  scrollDepth.forEach(entry => {
    const depth = entry.event_properties?.depth;
    if (depth && scrollDepthStats[depth] !== undefined) {
      scrollDepthStats[depth]++;
    }
  });
  
  // Calculate average load time
  const avgLoadTime = blogPerformance.length > 0 
    ? blogPerformance.reduce((sum, entry) => sum + (entry.event_properties?.load_time || 0), 0) / blogPerformance.length
    : 0;

  // Return data in the format expected by AdminBlogAnalytics component
  return {
    period: `${startDate.toISOString()}-${endDate.toISOString()}`,
    blog: {
      totalPageViews: totalBlogPageViews,
      totalArticleViews: totalArticleViews,
      popularArticles,
      avgLoadTime: parseFloat(avgLoadTime.toFixed(2))
    },
    engagement: {
      scrollDepth: scrollDepthStats
    },
    generated: new Date().toISOString()
  };
}