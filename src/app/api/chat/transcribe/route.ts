import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, WHISPER_MODEL } from '@/lib/groq';
import { buildTranscriptionPrompt, resolveChatLocale } from '@/lib/chatbot';
import { consumeRateLimit } from '@/lib/rate-limit';
import { getClientIp, isAllowedOrigin, normalizeText } from '@/lib/security';

const TRANSCRIPTION_RATE_LIMIT = {
  limit: 10,
  windowMs: 5 * 60 * 1000,
};

const MAX_AUDIO_FILE_SIZE = 8 * 1024 * 1024;
const SUPPORTED_LANGUAGES = new Set(['fr', 'en']);

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req.headers)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const ip = getClientIp(req.headers);
    const rateLimit = consumeRateLimit(
      'chat-transcribe',
      ip,
      TRANSCRIPTION_RATE_LIMIT.limit,
      TRANSCRIPTION_RATE_LIMIT.windowMs
    );

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const requestedLanguage = normalizeText(formData.get('language'));
    const locale = resolveChatLocale(requestedLanguage);
    const language = SUPPORTED_LANGUAGES.has(locale) ? locale : undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
    }

    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Invalid audio file' }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'Empty audio file' }, { status: 400 });
    }

    if (file.size > MAX_AUDIO_FILE_SIZE) {
      return NextResponse.json({ error: 'Audio file too large' }, { status: 413 });
    }

    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: WHISPER_MODEL,
      language,
      prompt: buildTranscriptionPrompt(locale),
      response_format: 'json',
      temperature: 0,
    });

    const text = normalizeText(transcription.text);

    if (!text) {
      return NextResponse.json({ error: 'No speech detected' }, { status: 422 });
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Chat transcription API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
