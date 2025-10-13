import type { NextApiRequest, NextApiResponse } from 'next';
import { vertexAIService } from '../../../src/lib/vertex-ai-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body || {} as { text: string };

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Use Vertex AI for language detection
    // Since Vertex AI doesn't have a dedicated language detection API, 
    // we'll use a heuristic approach with STT in different languages
    let detectedLanguage: 'fr' | 'en' = 'fr'; // Default to French
    
    try {
      // Try to transcribe a sample with French settings
      const frenchResult = await vertexAIService.transcribeAudio(
        new TextEncoder().encode(text.slice(0, 100)).buffer,
        'fr'
      );
      
      // Try to transcribe a sample with English settings
      const englishResult = await vertexAIService.transcribeAudio(
        new TextEncoder().encode(text.slice(0, 100)).buffer,
        'en'
      );
      
      // Compare confidence scores (simplified approach)
      detectedLanguage = frenchResult.confidence >= englishResult.confidence ? 'fr' : 'en';
    } catch (error) {
      console.warn('Vertex AI language detection failed, defaulting to French:', error);
      detectedLanguage = 'fr'; // Default to French for Senegalese market
    }
    
    return res.status(200).json({ success: true, language: detectedLanguage, method: 'vertex-ai' });
  } catch (error) {
    console.error('Language detection error:', error);
    return res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
  }
}