import { NextRequest, NextResponse } from 'next/server';
import { getGroqClient, CHAT_MODEL, SYSTEM_PROMPT } from '@/lib/groq';

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; reset: number }>();

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const limit = rateLimit.get(ip);
    if (limit && limit.reset > now && limit.count >= 20) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    if (!limit || limit.reset <= now) {
      rateLimit.set(ip, { count: 1, reset: now + 60000 });
    } else {
      limit.count++;
    }

    const { messages } = await req.json();

    const groq = getGroqClient();
    if (!groq) {
      return NextResponse.json(
        { message: "Je suis temporairement indisponible. Contactez-nous sur WhatsApp au +212701193811." },
        { status: 200 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10),
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu répondre. Veuillez réessayer.";

    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { message: "Erreur serveur. Contactez-nous sur WhatsApp au +212701193811." },
      { status: 500 }
    );
  }
}
