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

    const apiKey = process.env['GOOGLE_AI_API_KEY'];
    if (!apiKey) {
      return res.status(500).json({ error: 'GOOGLE_AI_API_KEY not configured' });
    }

    // Test the prompt directly with detailed logging
    const prompt = `You are a language detection expert. Detect if the following text is primarily in French or English. Respond ONLY with "FR" for French or "EN" for English.\n\nText: "${text.replace(/\n/g, ' ').substring(0, 500)}"`;

    console.log('Sending prompt to Gemini:', prompt);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0, 
          maxOutputTokens: 10,
          topK: 1,
          topP: 0.8
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE'
          }
        ]
      })
    });

    console.log('Gemini API response status:', response.status);
    console.log('Gemini API response headers:', [...response.headers.entries()]);

    const rawData = await response.json();
    console.log('Gemini API raw response:', JSON.stringify(rawData, null, 2));

    const rawResponse = rawData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Raw response text:', JSON.stringify(rawResponse));
    
    const normalized = rawResponse.trim().toUpperCase().includes('EN') ? 'en' : 'fr';
    console.log('Normalized language:', normalized);

    return res.status(200).json({ 
      success: true, 
      language: normalized, 
      rawResponse,
      rawData
    });
  } catch (error) {
    console.error('Language detection error:', error);
    return res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
  }
}