import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Test the language detection API
    const detectionResponse = await fetch(`${req.headers.origin}/api/language/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!detectionResponse.ok) {
      const errorText = await detectionResponse.text();
      return res.status(detectionResponse.status).json({ 
        error: 'Language detection failed', 
        details: errorText 
      });
    }

    const detectionResult = await detectionResponse.json();

    // Test the chat API with the detected language
    const chatResponse = await fetch(`${req.headers.origin}/api/chat/gemini`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        sessionId: 'test-session',
        detectedLanguage: detectionResult['language']
      })
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      return res.status(chatResponse.status).json({ 
        error: 'Chat API failed', 
        details: errorText 
      });
    }

    const chatResult = await chatResponse.json();

    return res.status(200).json({
      success: true,
      detectedLanguage: detectionResult['language'],
      chatResponse: chatResult
    });
  } catch (error) {
    console.error('Test error:', error);
    return res.status(500).json({ 
      error: 'Test failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}