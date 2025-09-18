/**
 * Comprehensive Health Check API for Production Monitoring
 * Provides detailed system health metrics and status
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check Supabase connection
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id')
      .limit(1);

    const supabaseStatus = error ? 'error' : 'ok';
    const supabaseError = error ? error.message : null;

    // Check Google AI API
    let googleAIStatus = 'unknown';
    let googleAIError = null;
    
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: 'Health check' }]
              }]
            })
          }
        );
        
        googleAIStatus = response.ok ? 'ok' : 'error';
        if (!response.ok) {
          googleAIError = `Status: ${response.status}`;
        }
      } catch (error) {
        googleAIStatus = 'error';
        googleAIError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Check Hugging Face API
    let huggingFaceStatus = 'unknown';
    let huggingFaceError = null;
    
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
          method: 'HEAD',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`
          }
        });
        
        huggingFaceStatus = response.ok ? 'ok' : 'error';
        if (!response.ok) {
          huggingFaceError = `Status: ${response.status}`;
        }
      } catch (error) {
        huggingFaceStatus = 'error';
        huggingFaceError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Check Google TTS API
    let googleTTSStatus = 'unknown';
    let googleTTSError = null;
    
    if (process.env.GOOGLE_AI_API_KEY) {
      try {
        const response = await fetch(
          `https://texttospeech.googleapis.com/v1/voices?key=${process.env.GOOGLE_AI_API_KEY}`,
          {
            method: 'GET'
          }
        );
        
        googleTTSStatus = response.ok ? 'ok' : 'error';
        if (!response.ok) {
          googleTTSError = `Status: ${response.status}`;
        }
      } catch (error) {
        googleTTSStatus = 'error';
        googleTTSError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        supabase: {
          status: supabaseStatus,
          error: supabaseError
        },
        googleAI: {
          status: googleAIStatus,
          error: googleAIError
        },
        huggingFace: {
          status: huggingFaceStatus,
          error: huggingFaceError
        },
        googleTTS: {
          status: googleTTSStatus,
          error: googleTTSError
        }
      }
    };

    const overallStatus = Object.values(healthStatus.services).every(
      service => service.status === 'ok' || service.status === 'unknown'
    ) ? 200 : 503;

    res.status(overallStatus).json(healthStatus);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
