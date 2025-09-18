import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cleanText = text
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

    if (!cleanText) {
      return res.status(400).json({ error: 'No valid text to synthesize' });
    }

    // Return success with instruction to use browser TTS
    return res.status(200).json({
      success: true,
      useBrowserTTS: true,
      text: cleanText,
      message: 'Using browser TTS for better compatibility'
    });

  } catch (error) {
    console.error('TTS API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error: ' + (error as Error).message 
    });
  }
}