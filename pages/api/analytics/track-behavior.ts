import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import {
  sanitizeSessionId,
  sanitizeString,
  sanitizeUrl,
  sanitizeNumber,
  sanitizeEventType,
  sanitizeElementId,
  sanitizeElementClass,
  sanitizeElementText,
  sanitizeObject
} from '../../../src/utils/input-sanitization';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      sessionId,
      eventType,
      elementId,
      elementClass,
      elementText,
      pageUrl,
      xPosition,
      yPosition,
      metadata
    } = req.body;

    // Sanitize inputs
    const sanitizedSessionId = sanitizeSessionId(sessionId);
    const sanitizedEventType = sanitizeEventType(eventType);
    const sanitizedElementId = elementId ? sanitizeElementId(elementId) : null;
    const sanitizedElementClass = elementClass ? sanitizeElementClass(elementClass) : null;
    const sanitizedElementText = elementText ? sanitizeElementText(elementText) : null;
    const sanitizedPageUrl = sanitizeUrl(pageUrl);
    const sanitizedXPosition = xPosition !== undefined ? sanitizeNumber(xPosition, 0, 10000) : null;
    const sanitizedYPosition = yPosition !== undefined ? sanitizeNumber(yPosition, 0, 10000) : null;
    const sanitizedMetadata = metadata ? sanitizeObject(metadata, 1000) : null;

    // Validate required fields
    if (!sanitizedSessionId || !sanitizedEventType || !sanitizedPageUrl) {
      return res.status(400).json({ error: 'Missing required fields: sessionId, eventType, and pageUrl' });
    }

    // Validate event type
    const validEventTypes = [
      'click', 'scroll', 'form_submit', 'download', 'video_play', 'video_complete',
      'social_share', 'search', 'filter', 'sort', 'pagination', 'unknown'
    ];
    
    if (!validEventTypes.includes(sanitizedEventType)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }

    // Insert user behavior event
    const { data, error } = await supabase
      .from('user_behavior_events')
      .insert({
        session_id: sanitizedSessionId,
        event_type: sanitizedEventType,
        element_id: sanitizedElementId,
        element_class: sanitizedElementClass,
        element_text: sanitizedElementText,
        page_url: sanitizedPageUrl,
        x_position: sanitizedXPosition,
        y_position: sanitizedYPosition,
        metadata: sanitizedMetadata,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error tracking behavior event:', error);
      return res.status(500).json({ error: 'Failed to track behavior event' });
    }

    // Update session interaction count for clicks and scrolls
    if (sanitizedEventType === 'click' || sanitizedEventType === 'scroll') {
      const { error: updateError } = await supabase
        .from('visitor_sessions')
        .update({ 
          clicks: sanitizedEventType === 'click' ? supabase.rpc('increment', [1]) : undefined,
          scrolls: sanitizedEventType === 'scroll' ? supabase.rpc('increment', [1]) : undefined
        })
        .eq('session_id', sanitizedSessionId);

      if (updateError) {
        console.error('Error updating session:', updateError);
      }
    }

    res.status(200).json({ success: true, message: 'Behavior event tracked successfully' });
  } catch (error) {
    console.error('Error tracking behavior event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}