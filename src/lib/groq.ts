// ============================================================
// OMA Digital - Groq AI Client (lazy-initialized)
// ============================================================

import Groq from 'groq-sdk';

export const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'qwen/qwen3-32b';
export const WHISPER_MODEL = process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3-turbo';

let groqClient: Groq | null = null;

export function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  return groqClient;
}
