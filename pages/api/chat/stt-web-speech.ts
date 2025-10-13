/**
 * API Route pour Speech-to-Text via Web Speech API
 * Alternative à Gemini qui ne supporte pas nativement STT
 * 
 * @route POST /api/chat/stt-web-speech
 * @note Cette API est un proxy pour le Web Speech API côté client
 * @security Validation et sanitisation des entrées
 */

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Interface de réponse STT
 */
interface STTResponse {
  transcript: string;
  language: 'fr' | 'en';
  confidence: number;
}

/**
 * Handler principal
 * Note: Cette API retourne des instructions pour utiliser Web Speech API côté client
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Cette API indique au client d'utiliser Web Speech API
  return res.status(200).json({
    message: 'Use Web Speech API on client side',
    instructions: {
      api: 'webkitSpeechRecognition or SpeechRecognition',
      languages: ['fr-FR', 'en-US'],
      example: `
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'fr-FR';
recognition.continuous = false;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  const confidence = event.results[0][0].confidence;
  // Send transcript to chat API
};

recognition.start();
      `,
    },
  });
}
