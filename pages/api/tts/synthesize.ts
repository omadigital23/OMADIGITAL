/**
 * API Route for Text-to-Speech with Google Cloud TTS API
 * 
 * @description Uses Google Cloud Text-to-Speech API with API Key
 * @security API Key used server-side only (never exposed to client)
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { googleCloudSpeechService } from '../../../src/lib/google-cloud-speech-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, language } = req.body;

    // Validate input
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (language && language !== 'fr' && language !== 'en') {
      return res.status(400).json({ error: 'Language must be either "fr" or "en"' });
    }

    // Validate that Google Cloud TTS service is available
    if (!googleCloudSpeechService.isAvailable()) {
      return res.status(503).json({ 
        error: 'TTS service not available',
        details: 'Google Cloud API Key not configured'
      });
    }

    // Synthesize text using Google Cloud TTS API
    const result = await googleCloudSpeechService.synthesizeText(text.trim(), language || 'fr', false);
    const audioContent = result.audioContent;

    if (!audioContent) {
      return res.status(500).json({ error: 'Failed to synthesize text' });
    }

    // Return the audio content as base64 (client will create blob URL)
    return res.status(200).json({ audioContent });

  } catch (error) {
    console.error('TTS API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}