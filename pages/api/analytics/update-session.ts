import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { sanitizeSessionId } from '../../../src/utils/input-sanitization';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, endTime } = req.body;

    // Sanitize inputs
    const sanitizedSessionId = sanitizeSessionId(sessionId);
    const sanitizedEndTime = endTime || new Date().toISOString();

    // Validate required fields
    if (!sanitizedSessionId || !sanitizedEndTime) {
      return res.status(400).json({ error: 'Missing required fields: sessionId and endTime' });
    }

    // Update session end time
    const { data, error } = await supabase
      .from('visitor_sessions')
      .update({
        end_time: sanitizedEndTime,
        is_bounce: false // If session has end time, it's not a bounce
      })
      .eq('session_id', sanitizedSessionId);

    if (error) {
      console.error('Error updating session:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }

    res.status(200).json({ success: true, message: 'Session updated successfully' });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}