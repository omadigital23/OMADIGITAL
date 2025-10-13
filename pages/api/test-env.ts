import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return environment variables for testing
  res.status(200).json({
    HUGGINGFACE_API_KEY: process.env['HUGGINGFACE_API_KEY'] ? 'SET' : 'NOT_SET',
    SUPABASE_URL: process.env['NEXT_PUBLIC_SUPABASE_URL'] ? 'SET' : 'NOT_SET',
    SUPABASE_ANON_KEY: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ? 'SET' : 'NOT_SET',
    hasEnvFile: typeof process.env['HUGGINGFACE_API_KEY'] !== 'undefined'
  });
}