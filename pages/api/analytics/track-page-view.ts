import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import {
  sanitizeSessionId,
  sanitizeUrl,
  sanitizeString,
  sanitizeNumber,
  sanitizeBoolean,
  sanitizeEngagementScore,
  sanitizeScrollDepth
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
      pageUrl,
      pageTitle,
      referrer,
      entryTime,
      exitTime,
      scrollDepth,
      engagementScore,
      isExit
    } = req.body;

    // Sanitize inputs
    const sanitizedSessionId = sanitizeSessionId(sessionId);
    const sanitizedPageUrl = sanitizeUrl(pageUrl);
    const sanitizedPageTitle = pageTitle ? sanitizeString(pageTitle, 200) : null;
    const sanitizedReferrer = referrer ? sanitizeUrl(referrer) : null;
    const sanitizedEntryTime = entryTime || new Date().toISOString();
    const sanitizedExitTime = exitTime || null;
    const sanitizedScrollDepth = scrollDepth !== undefined ? sanitizeScrollDepth(scrollDepth) : null;
    const sanitizedEngagementScore = engagementScore !== undefined ? sanitizeEngagementScore(engagementScore) : null;
    const sanitizedIsExit = sanitizeBoolean(isExit);

    // Validate required fields
    if (!sanitizedSessionId || !sanitizedPageUrl) {
      return res.status(400).json({ error: 'Missing required fields: sessionId and pageUrl' });
    }

    // Insert page view
    const { data, error } = await supabase
      .from('page_views')
      .insert({
        session_id: sanitizedSessionId,
        page_url: sanitizedPageUrl,
        page_title: sanitizedPageTitle,
        referrer: sanitizedReferrer,
        entry_time: sanitizedEntryTime,
        exit_time: sanitizedExitTime,
        scroll_depth: sanitizedScrollDepth,
        engagement_score: sanitizedEngagementScore,
        is_exit: sanitizedIsExit
      });

    if (error) {
      console.error('Error tracking page view:', error);
      return res.status(500).json({ error: 'Failed to track page view' });
    }

    // Update session page view count
    const { error: updateError } = await supabase
      .from('visitor_sessions')
      .update({ page_views: supabase.rpc('increment', [1]) })
      .eq('session_id', sanitizedSessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
    }

    res.status(200).json({ success: true, message: 'Page view tracked successfully' });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}