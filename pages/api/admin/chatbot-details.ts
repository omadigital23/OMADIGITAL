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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Fetch conversation details
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (conversationError) {
      console.error('Error fetching conversation:', conversationError);
      return res.status(500).json({ error: 'Failed to fetch conversation' });
    }

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Fetch associated messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Fetch chatbot interactions for this conversation
    const { data: interactions, error: interactionsError } = await supabase
      .from('chatbot_interactions')
      .select('*')
      .eq('session_id', conversation.id)
      .order('timestamp', { ascending: true });

    if (interactionsError) {
      console.error('Error fetching interactions:', interactionsError);
    }

    // Fetch user intents for this conversation
    const messageIds = messages.map(msg => msg.id);
    let intents = [];
    if (messageIds.length > 0) {
      const { data: userIntents, error: intentsError } = await supabase
        .from('user_intents')
        .select('*')
        .in('message_id', messageIds);

      if (!intentsError) {
        intents = userIntents || [];
      } else {
        console.error('Error fetching user intents:', intentsError);
      }
    }

    // Fetch bot responses for this conversation
    let botResponses = [];
    if (messageIds.length > 0) {
      const { data: responses, error: responsesError } = await supabase
        .from('bot_responses')
        .select('*')
        .in('message_id', messageIds);

      if (!responsesError) {
        botResponses = responses || [];
      } else {
        console.error('Error fetching bot responses:', responsesError);
      }
    }

    res.status(200).json({
      conversation,
      messages: messages || [],
      interactions: interactions || [],
      intents: intents || [],
      bot_responses: botResponses || []
    });
  } catch (error) {
    console.error('Chatbot details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});