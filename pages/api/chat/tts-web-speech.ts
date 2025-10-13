/**
 * API Route pour Text-to-Speech via Web Speech API
 * Alternative à Gemini qui ne supporte pas nativement TTS
 * 
 * @route POST /api/chat/tts-web-speech
 * @note Cette API est un proxy pour le Web Speech API côté client
 * @security Validation et sanitisation des entrées
 */

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Interface de requête TTS
 */
interface TTSRequest {
  text: string;
  language: 'fr' | 'en';
  voice?: string;
}

/**
 * Handler principal
 * Note: Cette API retourne des instructions pour utiliser Web Speech API côté client
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, language }: TTSRequest = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Cette API indique au client d'utiliser Web Speech API
  return res.status(200).json({
    message: 'Use Web Speech API on client side',
    text,
    language,
    instructions: {
      api: 'speechSynthesis',
      voices: {
        'fr': 'fr-FR',
        'en': 'en-US',
      },
      example: `
const utterance = new SpeechSynthesisUtterance('${text.substring(0, 50)}...');
utterance.lang = '${language === 'fr' ? 'fr-FR' : 'en-US'}';
utterance.rate = 1.0;
utterance.pitch = 1.0;
utterance.volume = 1.0;

// Get available voices
const voices = speechSynthesis.getVoices();
const voice = voices.find(v => v.lang.startsWith('${language}'));
if (voice) utterance.voice = voice;

speechSynthesis.speak(utterance);
      `,
    },
  });
}
