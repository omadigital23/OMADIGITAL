import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../src/lib/env-server';

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Use environment variable for Make.com webhook URL
const MAKE_WEBHOOK_URL = process.env['MAKE_WEBHOOK_URL'] || 'https://hook.us2.make.com/upafrqdjez0uoj8w8y5iloeqqkhd0xrf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test d'envoi vers Make.com
    const testPayload = {
      event: 'test',
      table: 'newsletter_test',
      data: {
        email: 'test@example.com',
        status: 'active',
        source: 'api_test',
        timestamp: new Date().toISOString()
      },
      message: 'Test depuis Next.js API'
    };

    console.log('🚀 Envoi test vers Make.com...');

    const makeResponse = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await makeResponse.text();
    
    console.log('📡 Réponse Make.com:', {
      status: makeResponse.status,
      body: responseText
    });

    // Logger dans Supabase
    await supabase.from('webhook_logs').insert({
      webhook_type: 'make_test',
      payload: testPayload,
      response_status: makeResponse.status,
      response_body: responseText
    });

    return res.status(200).json({
      success: true,
      make_response: {
        status: makeResponse.status,
        body: responseText
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur test webhook:', error);
    
    // Logger l'erreur
    await supabase.from('webhook_logs').insert({
      webhook_type: 'make_test',
      payload: { error: true },
      response_status: 500,
      error_message: error instanceof Error ? error.message : 'Unknown error'
    });

    return res.status(500).json({
      error: 'Failed to test webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}