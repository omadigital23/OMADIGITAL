// Public (browser-safe) environment variables with validation
// In production, required variables must be present.
// In development/test, provide safe fallbacks to avoid hard crashes during local work.

const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';

function requireEnv(name: string, value: string | undefined, devFallback?: string): string {
  if (!value || value.trim() === '') {
    if (IS_PROD) {
      throw new Error(`Missing required environment variable: ${name}`);
    } else {
      const fallback = devFallback ?? '';
      if (fallback === '') {
        // Still warn, but prevent crash in dev
        // eslint-disable-next-line no-console
        console.warn(`[env-public] ${name} is missing. Using empty string fallback (development only).`);
        return '';
      }
      // eslint-disable-next-line no-console
      console.warn(`[env-public] ${name} is missing. Using development fallback value.`);
      return fallback;
    }
  }
  return value;
}

export { NODE_ENV };

export const NEXT_PUBLIC_SUPABASE_URL = requireEnv(
  'NEXT_PUBLIC_SUPABASE_URL',
  process.env['NEXT_PUBLIC_SUPABASE_URL']
);

export const NEXT_PUBLIC_SUPABASE_ANON_KEY = requireEnv(
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
);

// 🔐 SECURITY: Google AI API Key moved to server-only for proxy-only TTS
// Removed NEXT_PUBLIC_GOOGLE_AI_API_KEY to prevent client-side exposure
// TTS now exclusively uses /api/tts/google proxy endpoint