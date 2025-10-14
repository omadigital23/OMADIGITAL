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

    console.log('🎤 STT API: Received request', {
      hasAudioData: !!audioData,
      audioDataLength: audioData?.length || 0,
      language
    });

    // Validate input
    if (!audioData || typeof audioData !== 'string') {
      console.error('❌ STT API: Invalid audio data');
      return res.status(400).json({ error: 'Audio data is required' });
    }

    if (language && language !== 'fr' && language !== 'en') {
      console.error('❌ STT API: Invalid language:', language);
      return res.status(400).json({ error: 'Language must be either "fr" or "en"' });
    }

    // Validate that Google Cloud Speech service is available
    if (!googleCloudSpeechService.isAvailable()) {
      console.error('❌ STT API: Service not available');
      return res.status(503).json({ 
        error: 'STT service not available',
        details: 'Google Cloud API Key not configured'
      });
    }

    console.log('🎤 STT API: Converting audio data to ArrayBuffer...');

    // Convert base64 audio data to ArrayBuffer
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0)).buffer;

    console.log('🎤 STT API: Audio buffer size:', audioBuffer.byteLength, 'bytes');

    // Transcribe audio using Google Cloud Speech API
    // Language is detected by Google Cloud, not locally
    console.log('🎤 STT API: Calling Google Cloud Speech API...');
    const result = await googleCloudSpeechService.transcribeAudio(audioBuffer, language || 'fr');

    console.log('✅ STT API: Success', {
      textLength: result.text?.length || 0,
      confidence: result.confidence,
      language: result.language
    });

    // Return the transcription result
    return res.status(200).json({
      text: result.text,
      confidence: result.confidence,
      language: result.language
    });

  } catch (error) {
    console.error('❌ STT API error:', error);
    
    const errorDetails = {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack,
      fullError: error
    };
    
    console.error('Error details:', JSON.stringify(errorDetails, null, 2));
    
    // Provide user-friendly error messages
    let userMessage = 'Erreur de reconnaissance vocale';
    
    if ((error as Error).message?.includes('API key not valid')) {
      userMessage = 'Clé API Google Cloud invalide';
    } else if ((error as Error).message?.includes('empty')) {
      userMessage = 'Enregistrement audio vide';
    } else if ((error as Error).message?.includes('encode')) {
      userMessage = 'Erreur d\'encodage audio';
    } else if ((error as Error).message?.includes('not configured')) {
      userMessage = 'Service STT non configuré';
    }
    
    // ALWAYS return debug info in development to help diagnose
    return res.status(500).json({ 
      error: 'Internal server error',
      message: userMessage,
      debug: errorDetails // Always include in dev for now
    });
  }
}