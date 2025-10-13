import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Simple health check - verify the API is accessible
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'OMADIGITAL Chat API',
      version: '1.0.0'
    });
  } catch (error) {
    console.error('Chat API status check failed:', error);
    res.status(500).json({ 
      status: 'error', 
      error: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
}