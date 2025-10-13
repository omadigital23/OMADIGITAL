/**
 * Comprehensive Health Check API for Production Monitoring
 * Provides detailed system health metrics and status
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL'] || '',
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || ''
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
    
    if (process.env['GOOGLE_AI_API_KEY']) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${process.env['GOOGLE_AI_API_KEY']}`,
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

    // Check Vertex AI STT API
    let vertexAISTTStatus = 'unknown';
    let vertexAISTTError = null;
    
    if (process.env['GOOGLE_AI_API_KEY']) {
      try {
        const response = await fetch(
          `https://speech.googleapis.com/v1/speech:recognize?key=${process.env['GOOGLE_AI_API_KEY']}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              config: {
                encoding: 'LINEAR16',
                sampleRateHertz: 16000,
                languageCode: 'fr-FR'
              },
              audio: {
                content: '' // Empty audio for testing
              }
            })
          }
        );
        
        // We expect a 400 error for empty audio, which means the API is accessible
        vertexAISTTStatus = response.status === 400 ? 'ok' : 'error';
        if (response.status !== 400) {
          vertexAISTTError = `Status: ${response.status}`;
        }
      } catch (error) {
        vertexAISTTStatus = 'error';
        vertexAISTTError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    // Check Google TTS API
    let googleTTSStatus = 'unknown';
    let googleTTSError = null;
    
    if (process.env['GOOGLE_AI_API_KEY']) {
      try {
        const response = await fetch(
          `https://texttospeech.googleapis.com/v1/voices?key=${process.env['GOOGLE_AI_API_KEY']}`,
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
        vertexAISTT: {
          status: vertexAISTTStatus,
          error: vertexAISTTError
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