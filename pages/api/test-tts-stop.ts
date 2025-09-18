import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // This is a simple test endpoint to verify the TTS stop functionality
  // In a real implementation, this would test the actual TTS stopping mechanism
  res.status(200).json({ 
    message: 'TTS Stop functionality test endpoint',
    status: 'success',
    description: 'This endpoint is used to test the TTS stop functionality in the SmartChatbotNext component'
  });
}