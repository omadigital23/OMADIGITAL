/**
 * API TTS avec Google Text-to-Speech
 */

import { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory rate limiting for TTS
const rateLimitStore = new Map<string, number[]>();

interface TTSRequest {
  text: string;
  language: 'fr' | 'en';
  sessionId: string;
  voice?: string;
  speed?: number;
  volume?: number;
}

// Configuration des voix par langue
const VOICE_CONFIG = {
  fr: {
    languageCode: 'fr-FR',
    name: 'fr-FR-Standard-A', // Voix féminine française
    ssmlGender: 'FEMALE'
  },
  en: {
    languageCode: 'en-US',
    name: 'en-US-Standard-A', // Voix féminine américaine
    ssmlGender: 'FEMALE'
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, language, sessionId, voice, speed = 1.0, volume = 0.8 }: TTSRequest = req.body;

    // Rate limiting check
    const clientIP = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown') as string;
    const rateLimitKey = `tts_${clientIP}`;
    
    // Simple in-memory rate limiting (replace with Redis in production)
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10;
    
    const requests = rateLimitStore.get(rateLimitKey) || [];
    const validRequests = requests.filter((time: number) => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: 60
      });
    }
    
    validRequests.push(now);
    rateLimitStore.set(rateLimitKey, validRequests);

    // Validation des entrées
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    if (!language || !['fr', 'en'].includes(language)) {
      return res.status(400).json({ error: 'Language must be "fr" or "en"' });
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'SessionId is required' });
    }

    // Limiter la longueur du texte
    if (text.length > 1000) {
      return res.status(400).json({ error: 'Text too long (max 1000 characters)' });
    }

    // Nettoyer le texte pour TTS
    const cleanText = text
      .replace(/[🎯🚀💡🔥✅❌⚡🎨🎁💎🏆📊📈🎪💬📱🛠️⭐]/g, '') // Supprimer emojis
      .replace(/\*\*(.*?)\*\*/g, '$1') // Supprimer markdown
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText || cleanText.length < 2) {
      return res.status(400).json({ error: 'Text too short after cleaning' });
    }

    console.log('TTS Request:', {
      sessionId,
      language,
      textLength: cleanText.length,
      voice: voice || VOICE_CONFIG[language].name
    });

    // Vérifier la clé API Google
    const googleApiKey = process.env['GOOGLE_AI_API_KEY'];
    if (!googleApiKey) {
      console.error('Google AI API key not configured');
      return res.status(503).json({ 
        error: 'TTS service temporarily unavailable',
        code: 'SERVICE_NOT_CONFIGURED'
      });
    }

    // Configuration de la requête Google TTS
    const voiceConfig = {
      languageCode: VOICE_CONFIG[language].languageCode,
      name: voice || VOICE_CONFIG[language].name,
      ssmlGender: VOICE_CONFIG[language].ssmlGender
    };

    const audioConfig = {
      audioEncoding: 'MP3',
      speakingRate: Math.max(0.25, Math.min(4.0, speed)),
      volumeGainDb: Math.max(-96.0, Math.min(16.0, (volume - 0.5) * 20)), // Convertir 0-1 vers -10 à +10 dB
      pitch: 0.0
    };

    const requestBody = {
      input: { text: cleanText },
      voice: voiceConfig,
      audioConfig
    };

    // Appel à l'API Google Text-to-Speech
    const ttsResponse = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!ttsResponse.ok) {
      const errorData = await ttsResponse.text();
      console.error('Google TTS API error:', {
        status: ttsResponse.status,
        statusText: ttsResponse.statusText,
        error: errorData
      });

      if (ttsResponse.status === 403) {
        return res.status(503).json({ error: 'TTS service quota exceeded' });
      } else if (ttsResponse.status === 400) {
        return res.status(400).json({ error: 'Invalid TTS request' });
      } else {
        return res.status(503).json({ error: 'TTS service temporarily unavailable' });
      }
    }

    const ttsData = await ttsResponse.json();

    if (!ttsData.audioContent) {
      console.error('No audio content in TTS response');
      return res.status(503).json({ error: 'TTS generation failed' });
    }

    // Convertir l'audio base64 en buffer
    const audioBuffer = Buffer.from(ttsData.audioContent, 'base64');

    // Définir les headers pour l'audio
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length.toString());
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1 heure

    // Log pour analytics
    console.log('TTS Success:', {
      sessionId,
      language,
      textLength: cleanText.length,
      audioSize: audioBuffer.length,
      voice: voiceConfig.name
    });

    // Envoyer l'audio
    res.status(200).end(audioBuffer);

  } catch (error: any) {
    console.error('TTS API Error:', error);

    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }

    if (error.message?.includes('rate limit')) {
      return res.status(429).json({ 
        error: 'Too many TTS requests. Please wait a moment.',
        retryAfter: 60
      });
    }

    // Erreur générique
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}