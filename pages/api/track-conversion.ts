import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/lib/supabase-cache-fix';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, sessionId, data } = req.body;

  try {
    await supabase.from('conversions').insert({
      type,
      session_id: sessionId,
      data,
      created_at: new Date().toISOString()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    res.status(500).json({ error: 'Failed to track conversion' });
  }
}