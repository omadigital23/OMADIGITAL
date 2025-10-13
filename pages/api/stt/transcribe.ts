/**
 * API Route for Speech-to-Text with Google Cloud Speech API
 * 
 * @description Uses Google Cloud Speech-to-Text API with API Key
 * @security API Key used server-side only (never exposed to client)
 * @language Language detected by Google Cloud Speech API
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { googleCloudSpeechService } from '../../../src/lib/google-cloud-speech-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { audioData, language } = req.body;

    // Validate input
    if (!audioData || typeof audioData !== 'string') {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    if (language && language !== 'fr' && language !== 'en') {
      return res.status(400).json({ error: 'Language must be either "fr" or "en"' });
    }

    // Validate that Google Cloud Speech service is available
    if (!googleCloudSpeechService.isAvailable()) {
      return res.status(503).json({ 
        error: 'STT service not available',
        details: 'Google Cloud API Key not configured'
      });
    }

    // Convert base64 audio data to ArrayBuffer
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0)).buffer;

    // Transcribe audio using Google Cloud Speech API
    // Language is detected by Google Cloud, not locally
    const result = await googleCloudSpeechService.transcribeAudio(audioBuffer, language || 'fr');

    // Return the transcription result
    return res.status(200).json({
      text: result.text,
      confidence: result.confidence,
      language: result.language
    });

  } catch (error) {
    console.error('STT API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}