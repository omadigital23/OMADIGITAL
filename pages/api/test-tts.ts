import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    // Test simple sans Gemini
    const response = {
      response: `Test TTS: ${message}`,
      language: 'fr' as const,
      source: 'test',
      confidence: 1.0,
      suggestions: ['Test 1', 'Test 2'],
      cta: null
    };

    console.log('Test TTS API response:', response);
    res.status(200).json(response);

  } catch (error) {
    console.error('Test TTS error:', error);
    res.status(500).json({ error: 'Test failed' });
  }
}