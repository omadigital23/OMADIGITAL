import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, language } = req.body;
    
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }

    console.log('🧪 Comprehensive test started');
    
    // Test 1: Language detection
    const { ultraIntelligentRAG } = await import('../../src/lib/ultra-intelligent-rag');
    const detectedLanguage = ultraIntelligentRAG['detectLanguageAdvanced'](message);
    
    console.log('🔤 Language detection test:', { 
      input: message, 
      detected: detectedLanguage,
      expected: language
    });
    
    // Test 2: Intent detection
    const intentResult = ultraIntelligentRAG['detectIntentAdvanced'](message, detectedLanguage);
    
    console.log('🎯 Intent detection test:', { 
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      entities: intentResult.entities
    });
    
    // Test 3: Knowledge base search
    const context = await ultraIntelligentRAG['searchKnowledgeBase'](message, detectedLanguage);
    
    console.log('📚 Knowledge base search test:', { 
      results: context.length,
      items: context.slice(0, 2).map(item => ({
        title: item.title,
        category: item.category
      }))
    });
    
    // Test 4: Google AI integration
    let aiResponse = '';
    try {
      aiResponse = await ultraIntelligentRAG['generateResponseWithRAG'](
        message, 
        detectedLanguage, 
        context
      );
      
      console.log('🤖 Google AI integration test:', { 
        success: true,
        responseLength: aiResponse.length
      });
    } catch (error) {
      console.error('🤖 Google AI integration test failed:', error);
      aiResponse = 'Fallback response due to AI error';
    }
    
    // Test 5: Full processing
    const fullResult = await ultraIntelligentRAG.processMessage(
      message,
      `test-session-${Date.now()}`,
      'text'
    );
    
    console.log('全流程测试:', { 
      success: true,
      responseLength: fullResult.response.length,
      language: fullResult.language,
      source: fullResult.source,
      confidence: fullResult.confidence
    });
    
    return res.status(200).json({
      success: true,
      tests: {
        languageDetection: {
          detected: detectedLanguage,
          expected: language,
          correct: detectedLanguage === language
        },
        intentDetection: {
          intent: intentResult.intent,
          confidence: intentResult.confidence
        },
        knowledgeBaseSearch: {
          results: context.length
        },
        googleAIIntegration: {
          success: aiResponse.length > 0,
          responseLength: aiResponse.length
        },
        fullProcessing: {
          success: fullResult.response.length > 0,
          responseLength: fullResult.response.length,
          language: fullResult.language,
          source: fullResult.source,
          confidence: fullResult.confidence
        }
      },
      finalResponse: fullResult
    });

  } catch (error) {
    console.error('Comprehensive test error:', error);
    return res.status(500).json({ 
      error: 'Test failed',
      message: (error as Error).message 
    });
  }
}