/**
 * API Route for Speech-to-Text with Vertex AI
 * 
 * @description Uses Vertex AI Speech-to-Text API with service account
 * @security Service account credentials used server-side only
 * @compliance 100% Vertex AI - No Google AI Studio
 * @language Language detected by Vertex AI
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleAuth } from 'google-auth-library';

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

    // Get Vertex AI credentials
    const serviceAccountType = process.env['GOOGLE_SERVICE_ACCOUNT_TYPE'];
    const serviceAccountProjectId = process.env['GOOGLE_SERVICE_ACCOUNT_PROJECT_ID'];
    const serviceAccountPrivateKey = process.env['GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY'];
    const serviceAccountClientEmail = process.env['GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL'];

    if (!serviceAccountType || !serviceAccountProjectId || !serviceAccountPrivateKey || !serviceAccountClientEmail) {
      console.error('❌ STT API: Vertex AI credentials not configured');
      return res.status(503).json({ 
        error: 'STT service not available',
        details: 'Vertex AI credentials not configured'
      });
    }

    console.log('🎤 Vertex AI STT: Converting audio data to ArrayBuffer...');

    // Convert base64 audio data to ArrayBuffer
    const audioBuffer = Uint8Array.from(atob(audioData), c => c.charCodeAt(0)).buffer;

    console.log('🎤 Vertex AI STT: Audio buffer size:', audioBuffer.byteLength, 'bytes');

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

    // Prepare audio for Vertex AI STT
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    const requestBody = {
      config: {
        encoding: 'WEBM_OPUS',
        sampleRateHertz: 16000,
        languageCode: language === 'en' ? 'en-US' : 'fr-FR',
        alternativeLanguageCodes: language === 'en' ? ['fr-FR'] : ['en-US'],
        enableAutomaticPunctuation: true,
        model: 'latest_long'
      },
      audio: {
        content: audioBase64
      }
    };

    console.log('🎤 Vertex AI STT: Calling API...');

    // Call Vertex AI Speech-to-Text API
    const response = await fetch(
      'https://speech.googleapis.com/v1/speech:recognize',
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
      throw new Error(`Vertex AI STT API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.warn('⚠️ Vertex AI STT: No speech detected');
      return res.status(200).json({
        text: '',
        confidence: 0,
        language: language || 'fr'
      });
    }

    const transcript = data.results[0].alternatives[0].transcript;
    const confidence = data.results[0].alternatives[0].confidence || 0.9;
    const detectedLanguage = data.results[0].languageCode?.startsWith('en') ? 'en' : 'fr';

    console.log('✅ Vertex AI STT: Success', {
      textLength: transcript?.length || 0,
      confidence,
      language: detectedLanguage
    });

    // Return the transcription result
    return res.status(200).json({
      text: transcript,
      confidence,
      language: detectedLanguage
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