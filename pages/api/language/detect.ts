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

    // Améliorer le prompt pour une détection plus précise
    const prompt = `You are a language detection expert. Detect if the following text is primarily in French or English. Respond ONLY with "FR" for French or "EN" for English.\n\nText: "${text.replace(/\n/g, ' ').substring(0, 500)}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return res.status(response.status).json({ error: 'Gemini API error', message: errorText });
    }

    const data = await response.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const normalized = raw.trim().toUpperCase().includes('EN') ? 'en' : 'fr';

    return res.status(200).json({ success: true, language: normalized, raw });
  } catch (error) {
    console.error('Language detection error:', error);
    return res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
  }
}
