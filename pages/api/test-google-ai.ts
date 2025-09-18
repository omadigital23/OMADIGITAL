import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const googleAIKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!googleAIKey) {
      return res.status(500).json({ error: 'Google AI API key not found' });
    }

    console.log('Testing Google AI API with key:', googleAIKey.substring(0, 10) + '...');

    // Test the Google AI API directly
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleAIKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "What are the services offered by OMA Digital? Respond in one sentence."
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      return res.status(200).json({
        success: true,
        response: generatedText,
        rawResponse: data
      });
    } else {
      const errorText = await response.text();
      console.error('Google AI API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Google AI API error',
        status: response.status,
        message: errorText
      });
    }

  } catch (error) {
    console.error('Test Google AI API error:', error);
    return res.status(500).json({ 
      error: 'Test failed',
      message: (error as Error).message 
    });
  }
}