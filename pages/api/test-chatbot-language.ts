import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body || {} as { text: string };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Test language detection
    const detectResponse = await fetch('http://localhost:3001/api/language/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!detectResponse.ok) {
      const errorText = await detectResponse.text().catch(() => 'Unknown error');
      return res.status(detectResponse.status).json({ 
        error: 'Language detection failed', 
        message: errorText 
      });
    }

    const detectionResult = await detectResponse.json();
    
    // Test chat response with detected language
    const chatResponse = await fetch('http://localhost:3001/api/chat/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        sessionId: 'test-session',
        inputMethod: 'text',
        detectedLanguage: detectionResult.language
      })
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text().catch(() => 'Unknown error');
      return res.status(chatResponse.status).json({ 
        error: 'Chat response failed', 
        message: errorText 
      });
    }

    const chatResult = await chatResponse.json();

    return res.status(200).json({
      success: true,
      detection: detectionResult,
      response: chatResult
    });
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
  }
}