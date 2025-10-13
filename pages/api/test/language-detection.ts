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

    // Test local language detection
    const detectedLanguage = detectLanguageLocally(text);
    
    return res.status(200).json({ 
      success: true, 
      language: detectedLanguage,
      text: text.substring(0, 100) + (text.length > 100 ? '...' : '')
    });
  } catch (error) {
    console.error('Language detection test error:', error);
    return res.status(500).json({ error: 'Internal server error', message: (error as Error).message });
  }
}

// Local language detection function for testing
function detectLanguageLocally(text: string): 'fr' | 'en' {
  if (!text) return 'fr';
  
  // English keywords
  const englishKeywords = [
    'the', 'and', 'you', 'that', 'for', 'are', 'with', 'his', 'they',
    'hello', 'thank', 'please', 'welcome', 'good', 'help', 'how', 'what',
    'digital', 'transformation', 'business', 'solution', 'service', 'automation'
  ];
  
  // French keywords
  const frenchKeywords = [
    'le', 'de', 'et', 'que', 'pour', 'avec', 'son', 'une', 'sur',
    'bonjour', 'merci', 'bienvenue', 'aide', 'comment', 'quoi', 'très',
    'transformation', 'numérique', 'entreprise', 'solution', 'service', 'automatisation'
  ];
  
  const lowerText = text.toLowerCase();
  
  const englishMatches = englishKeywords.filter(word => 
    lowerText.includes(word)).length;
  const frenchMatches = frenchKeywords.filter(word => 
    lowerText.includes(word)).length;
  
  // If more English words detected, consider as English
  if (englishMatches > frenchMatches && englishMatches > 1) {
    return 'en';
  }
  
  // Default to French (Senegalese context)
  return 'fr';
}