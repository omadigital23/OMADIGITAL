import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if Hugging Face API key is configured
  const isConfigured = !!process.env.HUGGINGFACE_API_KEY;
  
  // Return configuration status
  res.status(200).json({
    configured: isConfigured,
    message: isConfigured 
      ? 'Hugging Face API key is configured' 
      : 'Hugging Face API key is missing. Please add HUGGINGFACE_API_KEY to your .env.local file'
  });
}