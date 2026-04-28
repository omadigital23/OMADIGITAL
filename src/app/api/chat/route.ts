import { NextRequest, NextResponse } from 'next/server';
import { CHAT_MODEL, getGroqClient } from '@/lib/groq';
import {
  appendDeterministicContactCta,
  buildChatFallback,
  buildChatSuggestions,
  buildSystemPrompt,
  detectChatIntent,
  extractLeadInsights,
  getDefaultChatSuggestions,
  resolveChatLocale,
  sanitizeAssistantReply,
  type ChatMessage,
} from '@/lib/chatbot';
import { persistQualifiedChatLead } from '@/lib/chat-leads';
import { consumeRateLimit } from '@/lib/rate-limit';
import { getClientIp, isAllowedOrigin, normalizeText } from '@/lib/security';

const CHAT_RATE_LIMIT = {
  limit: 20,
  windowMs: 60 * 1000,
};

function isChatMessage(value: unknown): value is ChatMessage {
  return (
    !!value &&
    typeof value === 'object' &&
    ((value as { role?: unknown }).role === 'user' ||
      (value as { role?: unknown }).role === 'assistant') &&
    typeof (value as { content?: unknown }).content === 'string'
  );
}

function buildSafeMessages(messages: unknown[]): ChatMessage[] {
  return messages
    .filter(isChatMessage)
    .map((message) => ({
      role: message.role,
      content: normalizeText(message.content).slice(0, 2000),
    }))
    .filter((message) => message.content.length > 0)
    .slice(-12);
}

export async function POST(req: NextRequest) {
  let locale: 'fr' | 'en' = 'fr';

  try {
    if (!isAllowedOrigin(req.headers)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const ip = getClientIp(req.headers);
    const rateLimit = consumeRateLimit(
      'chat',
      ip,
      CHAT_RATE_LIMIT.limit,
      CHAT_RATE_LIMIT.windowMs
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

    const body = await req.json();
    locale = resolveChatLocale(body?.locale);
    const messages = Array.isArray(body?.messages) ? body.messages : [];
    const safeMessages = buildSafeMessages(messages);

    if (safeMessages.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const leadInsights = extractLeadInsights(safeMessages);
    const userIntent = detectChatIntent(leadInsights.latestUserMessage || '');
    const suggestions = buildChatSuggestions(locale, leadInsights);

    let reply = buildChatFallback(locale);
    let degraded = true;

    const groq = getGroqClient();
    if (groq) {
      try {
        const completion = await groq.chat.completions.create({
          model: CHAT_MODEL,
          messages: [
            { role: 'system', content: buildSystemPrompt(locale, leadInsights) },
            ...safeMessages,
          ],
          reasoning_format: 'hidden',
          max_tokens: 256,
          temperature: 0.4,
        });

        const content = completion.choices[0]?.message?.content;

        if (typeof content === 'string' && content.trim().length > 0) {
          reply = content;
          degraded = false;
        }
      } catch (error) {
        console.error('Groq chat completion error:', error);
      }
    }

    const normalizedReply = appendDeterministicContactCta(
      sanitizeAssistantReply(reply),
      locale,
      userIntent,
      leadInsights.stage
    );

    const leadCaptured = await persistQualifiedChatLead(leadInsights, locale);

    return NextResponse.json({
      message: normalizedReply,
      suggestions,
      leadCaptured,
      leadStage: leadInsights.stage,
      degraded,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    return NextResponse.json({
      message: buildChatFallback(locale),
      suggestions: getDefaultChatSuggestions(locale),
      leadCaptured: false,
      leadStage: 'discovery',
      degraded: true,
    });
  }
}
