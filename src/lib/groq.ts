// ============================================================
// OMA Digital - Groq AI Client (lazy-initialized)
// ============================================================

import Groq from 'groq-sdk';

const DEFAULT_CHAT_MODELS = [
  'qwen/qwen3-32b',
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
] as const;

function parseChatModels(): string[] {
  const configuredModels = process.env.GROQ_CHAT_MODEL
    ?.split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  return Array.from(new Set([
    ...(configuredModels && configuredModels.length > 0 ? configuredModels : DEFAULT_CHAT_MODELS),
    ...DEFAULT_CHAT_MODELS,
  ]));
}

export const CHAT_MODELS = parseChatModels();
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
