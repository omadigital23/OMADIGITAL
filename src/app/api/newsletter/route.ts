import { NextRequest, NextResponse } from 'next/server';
import { consumeRateLimit } from '@/lib/rate-limit';
import {
  getClientIp,
  isAllowedOrigin,
  isBotTrapFilled,
  isValidEmail,
  normalizeText,
} from '@/lib/security';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const NEWSLETTER_RATE_LIMIT = {
  limit: 5,
  windowMs: 60 * 60 * 1000,
};

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req.headers)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const ip = getClientIp(req.headers);
    const rateLimit = consumeRateLimit(
      'newsletter',
      ip,
      NEWSLETTER_RATE_LIMIT.limit,
      NEWSLETTER_RATE_LIMIT.windowMs
    );

    if (!rateLimit.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const body = await req.json();
    const email = normalizeText(body?.email).toLowerCase();
    const companyWebsite = normalizeText(body?.companyWebsite);

    if (isBotTrapFilled(companyWebsite)) {
      return NextResponse.json({ success: true });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      console.error('Newsletter API error: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const { error } = await supabase.from('newsletter').upsert(
      {
        email,
        subscribed: true,
      },
      { onConflict: 'email' }
    );

    if (error) {
      console.error('Newsletter API database error:', error);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
