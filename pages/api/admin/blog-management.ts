import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '../../../src/utils/adminApiGuard';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Blog management API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { action, id, status, category, search, limit = '10', offset = '0' } = req.query;

  switch (action) {
    case 'list':
      return await getArticles(res, { status, category, search, limit: parseInt(limit as string), offset: parseInt(offset as string) });
    
    case 'get':
      if (!id) {
        return res.status(400).json({ error: 'Article ID required' });
      }
      return await getArticle(res, parseInt(id as string));
    
    case 'analytics':
      return await getBlogAnalytics(res);
    
    default:
      return res.status(400).json({ error: 'Invalid action parameter' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;

  switch (action) {
    case 'create':
      return await createArticle(req, res);
    
    case 'duplicate':
      return await duplicateArticle(req, res);
    
    default:
      return res.status(400).json({ error: 'Invalid action parameter' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const { action, id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Article ID required' });
  }

  switch (action) {
    case 'update':
      return await updateArticle(req, res, parseInt(id as string));
    
    case 'publish':
      return await publishArticle(res, parseInt(id as string));
    
    case 'unpublish':
      return await unpublishArticle(res, parseInt(id as string));
    
    case 'feature':
      return await toggleFeatured(res, parseInt(id as string), true);
    
    case 'unfeature':
      return await toggleFeatured(res, parseInt(id as string), false);
    
    default:
      return res.status(400).json({ error: 'Invalid action parameter' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Article ID required' });
  }

  return await deleteArticle(res, parseInt(id as string));
}

async function getArticles(res: NextApiResponse, filters: any) {
  try {
    let query = supabase
      .from('blog_articles')
      .select(`
        *,
        author:profiles(name, avatar_url, role),
        blog_article_stats(views, likes, comments, shares)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%, excerpt.ilike.%${filters.search}%, tags.cs.{${filters.search}}`);
    }

    // Apply pagination
    query = query.range(filters.offset, filters.offset + filters.limit - 1);

    const { data: articles, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('blog_articles')
      .select('*', { count: 'exact', head: true });

    res.status(200).json({
      articles: articles || [],
      pagination: {
        total: totalCount || 0,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: (filters.offset + filters.limit) < (totalCount || 0)
      }
    });
  } catch (error) {
    console.error('Error getting articles:', error);
    throw error;
  }
}

async function getArticle(res: NextApiResponse, id: number) {
  try {
    const { data: article, error } = await supabase
      .from('blog_articles')
      .select(`
        *,
        author:profiles(name, avatar_url, role),
        blog_article_stats(views, likes, comments, shares)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Article not found' });
      }
      throw error;
    }

    res.status(200).json({ article });
  } catch (error) {
    console.error('Error getting article:', error);
    throw error;
  }
}

async function createArticle(req: NextApiRequest, res: NextApiResponse) {
  try {
    const articleData = req.body;

    // Validate required fields
    if (!articleData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Generate slug from title
    const slug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const { data: article, error } = await supabase
      .from('blog_articles')
      .insert({
        title: articleData.title,
        excerpt: articleData.excerpt || '',
        content: articleData.content || '',
        slug: slug,
        category: articleData.category || 'Intelligence Artificielle',
        tags: articleData.tags || '{}',
        difficulty: articleData.difficulty || 'Débutant',
        estimated_roi: articleData.estimatedROI || '100%',
        image_url: articleData.image || '',
        status: articleData.status || 'draft',
        featured: articleData.featured || false,
        trending: articleData.trending || false,
        read_time: articleData.readTime || 5,
        publish_date: articleData.publishDate || null,
        author_id: 'admin',
        seo_title: articleData.seoTitle || '',
        seo_description: articleData.seoDescription || '',
        seo_keywords: articleData.seoKeywords || '{}',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Initialize stats
    const { error: statsError } = await supabase
      .from('blog_article_stats')
      .insert({
        article_id: article.id,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        read_completions: 0,
        avg_read_time: 0,
        bounce_rate: 0.0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (statsError) {
      throw statsError;
    }

    res.status(201).json({ article, message: 'Article created successfully' });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function updateArticle(req: NextApiRequest, res: NextApiResponse, id: number) {
  try {
    const articleData = req.body;

    // Generate slug if title changed
    let slug;
    if (articleData.title) {
      slug = articleData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only add fields that are provided
    if (articleData.title) updateData.title = articleData.title;
    if (articleData.excerpt !== undefined) updateData.excerpt = articleData.excerpt;
    if (articleData.content !== undefined) updateData.content = articleData.content;
    if (slug) updateData.slug = slug;
    if (articleData.category) updateData.category = articleData.category;
    if (articleData.tags) updateData.tags = articleData.tags;
    if (articleData.difficulty) updateData.difficulty = articleData.difficulty;
    if (articleData.estimatedROI) updateData.estimated_roi = articleData.estimatedROI;
    if (articleData.image !== undefined) updateData.image_url = articleData.image;
    if (articleData.status) updateData.status = articleData.status;
    if (articleData.featured !== undefined) updateData.featured = articleData.featured;
    if (articleData.trending !== undefined) updateData.trending = articleData.trending;
    if (articleData.readTime) updateData.read_time = articleData.readTime;
    if (articleData.publishDate !== undefined) updateData.publish_date = articleData.publishDate;
    if (articleData.seoTitle !== undefined) updateData.seo_title = articleData.seoTitle;
    if (articleData.seoDescription !== undefined) updateData.seo_description = articleData.seoDescription;
    if (articleData.seoKeywords) updateData.seo_keywords = articleData.seoKeywords;

    const { data: article, error } = await supabase
      .from('blog_articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Article not found' });
      }
      throw error;
    }

    res.status(200).json({ article, message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function deleteArticle(res: NextApiResponse, id: number) {
  try {
    // Delete stats first
    await supabase
      .from('blog_article_stats')
      .delete()
      .eq('article_id', id);

    // Delete article
    const { error } = await supabase
      .from('blog_articles')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    throw error;
  }
}

async function publishArticle(res: NextApiResponse, id: number) {
  try {
    const { data: article, error } = await supabase
      .from('blog_articles')
      .update({
        status: 'published',
        publish_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({ article, message: 'Article published successfully' });
  } catch (error) {
    console.error('Error publishing article:', error);
    throw error;
  }
}

async function unpublishArticle(res: NextApiResponse, id: number) {
  try {
    const { data: article, error } = await supabase
      .from('blog_articles')
      .update({
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({ article, message: 'Article unpublished successfully' });
  } catch (error) {
    console.error('Error unpublishing article:', error);
    throw error;
  }
}

async function toggleFeatured(res: NextApiResponse, id: number, featured: boolean) {
  try {
    const { data: article, error } = await supabase
      .from('blog_articles')
      .update({
        featured: featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({ 
      article, 
      message: `Article ${featured ? 'featured' : 'unfeatured'} successfully` 
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    throw error;
  }
}

async function duplicateArticle(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Article ID required' });
    }

    // Get original article
    const { data: original, error: fetchError } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Create duplicate
    const { data: duplicate, error: createError } = await supabase
      .from('blog_articles')
      .insert({
        ...original,
        id: undefined,
        title: `${original.title} (Copie)`,
        slug: `${original.slug}-copy`,
        status: 'draft',
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    // Initialize stats for duplicate
    await supabase
      .from('blog_article_stats')
      .insert({
        article_id: duplicate.id,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0
      });

    res.status(201).json({ article: duplicate, message: 'Article duplicated successfully' });
  } catch (error) {
    console.error('Error duplicating article:', error);
    throw error;
  }
}

async function getBlogAnalytics(res: NextApiResponse) {
  try {
    // Get total articles count by status
    const { data: statusCounts } = await supabase
      .from('blog_articles')
      .select('status')
      .then(({ data }) => ({
        data: data?.reduce((acc: any, article: any) => {
          acc[article.status] = (acc[article.status] || 0) + 1;
          return acc;
        }, {})
      }));

    // Get total views, likes, comments, shares
    const { data: totalStats } = await supabase
      .from('blog_article_stats')
      .select('views, likes, comments, shares');

    const aggregatedStats = totalStats?.reduce(
      (acc, stat) => ({
        views: acc.views + (stat.views || 0),
        likes: acc.likes + (stat.likes || 0),
        comments: acc.comments + (stat.comments || 0),
        shares: acc.shares + (stat.shares || 0)
      }),
      { views: 0, likes: 0, comments: 0, shares: 0 }
    );

    // Get top performing articles
    const { data: topArticles } = await supabase
      .from('blog_articles')
      .select(`
        id, title, category, status,
        blog_article_stats(views, likes, comments, shares)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);

    // Get category distribution
    const { data: categoryData } = await supabase
      .from('blog_articles')
      .select('category')
      .eq('status', 'published');

    const categoryDistribution = categoryData?.reduce((acc: any, article: any) => {
      acc[article.category] = (acc[article.category] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      overview: {
        totalArticles: Object.values(statusCounts || {}).reduce((sum: number, count: any) => sum + count, 0),
        published: statusCounts?.published || 0,
        drafts: statusCounts?.draft || 0,
        scheduled: statusCounts?.scheduled || 0,
        ...aggregatedStats
      },
      topArticles: topArticles || [],
      categoryDistribution: categoryDistribution || {},
      statusDistribution: statusCounts || {}
    });
  } catch (error) {
    console.error('Error getting blog analytics:', error);
    throw error;
  }
}