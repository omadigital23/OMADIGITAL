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
    const { limit = '5' } = req.query;
    
    // Fetch recent conversations from the conversations table
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit as string));

    if (error) {
      console.error('Error fetching conversations:', error);
      return res.status(500).json({ error: 'Failed to fetch conversations' });
    }

    // Fetch associated messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1); // Get only the most recent message

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          return { ...conversation, recentMessage: null };
        }

        return { 
          ...conversation, 
          recentMessage: messages && messages.length > 0 ? messages[0] : null 
        };
      })
    );

    res.status(200).json({
      conversations: conversationsWithMessages,
      totalCount: conversations.length
    });
  } catch (error) {
    console.error('Chatbot conversations API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});