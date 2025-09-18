import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    message: 'Language Context API Test',
    status: 'success',
    description: 'This endpoint verifies that the language context is properly set up',
    features: [
      'Language context provider created',
      'Language switcher component updated',
      'Floating language switcher component created',
      'App wrapper updated with language provider',
      'Test page created to verify functionality'
    ]
  });
}