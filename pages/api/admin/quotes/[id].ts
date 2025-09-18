import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../../src/lib/env-server';

// Initialize Supabase client
const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

import { requireAdminApi } from '../../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Quote ID is required' });
  }

  switch (req.method) {
    case 'GET':
      try {
        // Fetch quote details
        const { data: quote, error } = await supabase
          .from('quotes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching quote:', error);
          return res.status(500).json({ error: 'Failed to fetch quote' });
        }

        if (!quote) {
          return res.status(404).json({ error: 'Quote not found' });
        }

        res.status(200).json(quote);
      } catch (error) {
        console.error('Quote details error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'PUT':
      try {
        const { status, notes } = req.body;

        // Validate status
        const validStatuses = ['nouveau', 'en cours', 'traité', 'archivé'];
        if (status && !validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }

        // Update quote
        const updateData: any = {};
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.admin_notes = notes;

        const { data, error } = await supabase
          .from('quotes')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating quote:', error);
          return res.status(500).json({ error: 'Failed to update quote' });
        }

        res.status(200).json({ 
          success: true, 
          message: 'Quote updated successfully',
          quote: data
        });
      } catch (error) {
        console.error('Quote update error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
});