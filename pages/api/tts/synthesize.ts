/**
 * API Route for Text-to-Speech with Vertex AI
 * 
 * @description Uses Vertex AI Text-to-Speech API with service account
 * @security Service account credentials used server-side only
 * @compliance 100% Vertex AI - No Google AI Studio
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleAuth } from 'google-auth-library';

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

    console.log('🎵 Vertex AI TTS: Synthesizing text', {
      textLength: text.trim().length,
      language: language || 'fr'
    });

    // Get Vertex AI credentials
    const serviceAccountType = process.env['GOOGLE_SERVICE_ACCOUNT_TYPE'];
    const serviceAccountProjectId = process.env['GOOGLE_SERVICE_ACCOUNT_PROJECT_ID'];
    const serviceAccountPrivateKey = process.env['GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'];
    const serviceAccountClientEmail = process.env['GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL'];

    if (!serviceAccountType || !serviceAccountProjectId || !serviceAccountPrivateKey || !serviceAccountClientEmail) {
      return res.status(503).json({ 
        error: 'TTS service not available',
        details: 'Vertex AI credentials not configured'
      });
    }

    // Reconstruct credentials
    const credentials = {
      type: serviceAccountType,
      project_id: serviceAccountProjectId,
      private_key: serviceAccountPrivateKey.replace(/\\n/g, '\n'),
      client_email: serviceAccountClientEmail,
      client_id: process.env['GOOGLE_SERVICE_ACCOUNT_CLIENT_ID'] || '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env['GOOGLE_SERVICE_ACCOUNT_CLIENT_CERT_URL'] || ''
    };

    // Get access token
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    
    if (!tokenResponse.token) {
      throw new Error('Failed to get access token');
    }

    // Configure voice
    const voiceConfig = language === 'fr' 
      ? { languageCode: 'fr-FR', name: 'fr-FR-Wavenet-C', ssmlGender: 'FEMALE' }
      : { languageCode: 'en-US', name: 'en-US-Wavenet-C', ssmlGender: 'FEMALE' };

    const requestBody = {
      input: { text: text.trim() },
      voice: voiceConfig,
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,
        pitch: 0.0,
        volumeGainDb: 2.0
      }
    };

    // Call Vertex AI TTS API
    const response = await fetch(
      'https://texttospeech.googleapis.com/v1/text:synthesize',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenResponse.token}`
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex AI TTS API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    if (!audioContent) {
      return res.status(500).json({ error: 'Failed to synthesize text' });
    }

    console.log('✅ Vertex AI TTS: Synthesis successful');

    // Return the audio content as base64 (client will create blob URL)
    return res.status(200).json({ audioContent });

  } catch (error) {
    console.error('❌ Vertex AI TTS error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
}