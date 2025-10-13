import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, detectedLanguage } = req.body;
    
    // Step 1: Test language detection
    const { detectLanguage } = await import('../../../src/components/SmartChatbot/utils/languageDetection');
    const frontendDetectedLanguage = await detectLanguage(message);
    
    // Step 2: Test API call with detected language
    const apiResponse = await fetch('http://localhost:3000/api/chat/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        sessionId: 'audit-test-' + Date.now(),
        detectedLanguage: frontendDetectedLanguage,
        inputMethod: 'text'
      })
    });
    
    const apiData = await apiResponse.json();
    
    // Step 3: Compare languages
    const languageComparison = {
      inputMessage: message,
      frontendDetected: frontendDetectedLanguage,
      apiReceived: detectedLanguage,
      apiResponseLanguage: apiData.language,
      languagesMatch: frontendDetectedLanguage === apiData.language,
      issues: [] as string[]
    };
    
    if (frontendDetectedLanguage !== apiData.language) {
      languageComparison.issues.push('Frontend detected language does not match API response language');
    }
    
    if (detectedLanguage && detectedLanguage !== apiData.language) {
      languageComparison.issues.push('Provided detected language does not match API response language');
    }
    
    res.status(200).json({
      success: true,
      languageComparison,
      apiResponse: apiData
    });
    
  } catch (error) {
    console.error('Language flow test error:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}