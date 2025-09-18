import type { NextApiRequest, NextApiResponse } from 'next';
import { VOICE_CONFIGS, AUDIO_CONFIG } from '../../../src/lib/google-tts';
import { rateLimit } from '../../../src/lib/rate-limiter';

function sanitizeText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ', ')
    .replace(/[\r\n\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting: 10 requêtes par minute pour TTS
  try {
    await new Promise<void>((resolve, reject) => {
      const rateLimitMiddleware = rateLimit(10, 60000);
      rateLimitMiddleware(req, res, (error?: any) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (rateLimitError) {
    console.log('Rate limit applied, response already sent');
    return;
  }

  try {
    const { text, language = 'fr', useSSML = true } = req.body || {} as { text: string, language?: 'fr' | 'en', useSSML?: boolean };

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GOOGLE_AI_API_KEY not configured on server' });
    }

    const cleanText = sanitizeText(text);
    if (!cleanText) {
      return res.status(400).json({ error: 'No valid text to synthesize' });
    }

    const voiceKey = language === 'fr' ? 'fr-professional-female' : 'en-professional-female';
    const voice = VOICE_CONFIGS[voiceKey as keyof typeof VOICE_CONFIGS];

    const finalText = cleanText
      .replace(/\./g, '.<break time="0.5s"/>')
      .replace(/,/g, ',<break time="0.3s"/>');

    const requestBody = {
      input: useSSML ? { ssml: `<speak>${finalText}</speak>` } : { text: cleanText },
      voice: voice,
      audioConfig: AUDIO_CONFIG
    };

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return res.status(response.status).json({ error: 'Google TTS API error', message: errorText });
    }

    const data = await response.json();
    if (!data.audioContent) {
      return res.status(500).json({ error: 'No audio content returned by Google TTS' });
    }

    return res.status(200).json({
      success: true,
      audioContent: data.audioContent,
      contentType: 'audio/mp3'
    });
  } catch (error) {
    console.error('Server TTS error:', error);
    return res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
  }
}
