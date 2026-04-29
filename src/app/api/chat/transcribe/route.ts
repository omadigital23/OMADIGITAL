import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, WHISPER_MODEL } from '@/lib/groq';
import { buildTranscriptionPrompt } from '@/lib/chatbot';
import { consumeRateLimit } from '@/lib/rate-limit';
import { getClientIp, isAllowedOrigin, normalizeText } from '@/lib/security';
import {
  getRequestLogContext,
  logServerEvent,
  recordApiFailure,
} from '@/lib/server-observability';

const TRANSCRIPTION_RATE_LIMIT = {
  limit: 10,
  windowMs: 5 * 60 * 1000,
};

const MAX_AUDIO_FILE_SIZE = 8 * 1024 * 1024;
const SUPPORTED_AUDIO_EXTENSIONS = new Set([
  '.flac',
  '.m4a',
  '.mp3',
  '.mp4',
  '.mpeg',
  '.mpga',
  '.ogg',
  '.wav',
  '.webm',
  '.mov',
]);
const SUPPORTED_NON_AUDIO_MIME_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
]);

function isAcceptedAudioUpload(file: File) {
  if (file.type.startsWith('audio/')) {
    return true;
  }

  if (SUPPORTED_NON_AUDIO_MIME_TYPES.has(file.type.toLowerCase())) {
    return true;
  }

  const lowerName = file.name.toLowerCase();
  return Array.from(SUPPORTED_AUDIO_EXTENSIONS).some((extension) => lowerName.endsWith(extension));
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  const requestContext = getRequestLogContext(req.headers, '/api/chat/transcribe');

  try {
    if (!isAllowedOrigin(req.headers)) {
      logServerEvent('warn', 'api_request_blocked', {
        ...requestContext,
        status: 403,
        reason: 'forbidden_origin',
        ms: Date.now() - start,
      });
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
      logServerEvent('warn', 'api_request_rate_limited', {
        ...requestContext,
        status: 429,
        retryAfterSeconds: rateLimit.retryAfterSeconds,
        ms: Date.now() - start,
      });
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
    if (!(file instanceof File)) {
      logServerEvent('warn', 'api_request_rejected', {
        ...requestContext,
        status: 400,
        reason: 'missing_audio_file',
        ms: Date.now() - start,
      });
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
    }

    if (!isAcceptedAudioUpload(file)) {
      logServerEvent('warn', 'api_request_rejected', {
        ...requestContext,
        status: 400,
        reason: 'invalid_audio_file',
        fileType: file.type || 'unknown',
        ms: Date.now() - start,
      });
      return NextResponse.json({ error: 'Invalid audio file' }, { status: 400 });
    }

    if (file.size === 0) {
      logServerEvent('warn', 'api_request_rejected', {
        ...requestContext,
        status: 400,
        reason: 'empty_audio_file',
        ms: Date.now() - start,
      });
      return NextResponse.json({ error: 'Empty audio file' }, { status: 400 });
    }

    if (file.size > MAX_AUDIO_FILE_SIZE) {
      logServerEvent('warn', 'api_request_rejected', {
        ...requestContext,
        status: 413,
        reason: 'audio_file_too_large',
        fileSize: file.size,
        ms: Date.now() - start,
      });
      return NextResponse.json({ error: 'Audio file too large' }, { status: 413 });
    }

    const groq = getGroqClient();
    if (!groq) {
      logServerEvent('error', 'api_dependency_unavailable', {
        ...requestContext,
        status: 503,
        dependency: 'groq',
        ms: Date.now() - start,
      });
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: WHISPER_MODEL,
      prompt: buildTranscriptionPrompt(),
      response_format: 'json',
      temperature: 0,
    });

    const text = normalizeText(transcription.text);

    if (!text) {
      logServerEvent('warn', 'api_request_rejected', {
        ...requestContext,
        status: 422,
        reason: 'no_speech_detected',
        ms: Date.now() - start,
      });
      return NextResponse.json({ error: 'No speech detected' }, { status: 422 });
    }

    logServerEvent('info', 'api_request_completed', {
      ...requestContext,
      status: 200,
      outcome: 'transcribed',
      fileSize: file.size,
      ms: Date.now() - start,
    });

    return NextResponse.json({ text });
  } catch (error) {
    recordApiFailure({
      route: '/api/chat/transcribe',
      status: 500,
      source: 'unhandled_exception',
      requestId: requestContext.requestId as string | undefined,
      error,
    });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
