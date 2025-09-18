import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import {
  sanitizeSessionId,
  sanitizeUUID,
  sanitizeString,
  sanitizeNumber,
  sanitizeBoolean,
  sanitizeReadCompletion,
  sanitizeEngagementScore
} from '../../../src/utils/input-sanitization';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      sessionId,
      articleId,
      articleSlug,
      startReadingTime,
      endReadingTime,
      scrollProgress,
      readCompletion,
      engagementScore,
      isCompleted
    } = req.body;

    // Sanitize inputs
    const sanitizedSessionId = sanitizeSessionId(sessionId);
    const sanitizedArticleId = articleId ? sanitizeUUID(articleId) : null;
    const sanitizedArticleSlug = sanitizeString(articleSlug, 200);
    const sanitizedStartReadingTime = startReadingTime || new Date().toISOString();
    const sanitizedEndReadingTime = endReadingTime || null;
    const sanitizedScrollProgress = scrollProgress !== undefined ? sanitizeNumber(scrollProgress, 0, 100) : null;
    const sanitizedReadCompletion = readCompletion !== undefined ? sanitizeReadCompletion(readCompletion) : null;
    const sanitizedEngagementScore = engagementScore !== undefined ? sanitizeEngagementScore(engagementScore) : null;
    const sanitizedIsCompleted = sanitizeBoolean(isCompleted) || (sanitizedReadCompletion !== null && sanitizedReadCompletion >= 0.8);

    // Validate required fields
    if (!sanitizedSessionId || !sanitizedArticleSlug) {
      return res.status(400).json({ error: 'Missing required fields: sessionId and articleSlug' });
    }

    // Insert article reading tracking
    const { data, error } = await supabase
      .from('article_read_tracking')
      .insert({
        session_id: sanitizedSessionId,
        article_id: sanitizedArticleId,
        article_slug: sanitizedArticleSlug,
        start_reading_time: sanitizedStartReadingTime,
        end_reading_time: sanitizedEndReadingTime,
        scroll_progress: sanitizedScrollProgress,
        read_completion: sanitizedReadCompletion,
        engagement_score: sanitizedEngagementScore,
        is_completed: sanitizedIsCompleted
      });

    if (error) {
      console.error('Error tracking article reading:', error);
      return res.status(500).json({ error: 'Failed to track article reading' });
    }

    res.status(200).json({ success: true, message: 'Article reading tracked successfully' });
  } catch (error) {
    console.error('Error tracking article reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}