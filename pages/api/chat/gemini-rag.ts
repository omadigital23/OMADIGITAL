/**
 * 🤖 API GEMINI + RAG OPTIMISÉE POUR OMA DIGITAL
 * Réponses courtes, précises et basées sur la base de connaissances Supabase
 */

import { NextApiRequest, NextApiResponse } from 'next';

/**
 * ChatRequest interface
 */
interface ChatRequest {
  message: string;
  language?: 'fr' | 'en';
  sessionId?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(410).json({
    error: 'Deprecated endpoint',
    message: 'This route has been disabled. Use Vertex-only endpoints instead.',
    code: 'DEPRECATED_GEMINI_RAG'
  });
}