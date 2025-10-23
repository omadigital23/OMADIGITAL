import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { withAdminApiAuth } from '../../../src/utils/adminAuth';

const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
  process.env['SUPABASE_SERVICE_ROLE_KEY'] || ''
);

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Subscriber ID is required' });
  }

  try {
    const { data, error } = await supabase
      .from('blog_subscribers')
      .update({ 
        status: 'active',
        confirmation_token: null
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to activate subscriber' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withAdminApiAuth(handler);
