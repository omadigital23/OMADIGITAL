import type { NextApiRequest, NextApiResponse } from 'next';
import { ultraIntelligentRAG } from '../../src/lib/ultra-intelligent-rag';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }

    console.log('Testing Google AI with message:', message);
    
    // Test the ultra-intelligent RAG system
    const result = await ultraIntelligentRAG.processMessage(
      message.trim(),
      `test-session-${Date.now()}`,
      'text'
    );
    
    console.log('Google AI response:', result);
    
    return res.status(200).json({
      success: true,
      response: result.response,
      language: result.language,
      source: result.source,
      confidence: result.confidence
    });

  } catch (error) {
    console.error('Test chat API error:', error);
    return res.status(500).json({ 
      error: 'Test failed',
      message: (error as Error).message 
    });
  }
}