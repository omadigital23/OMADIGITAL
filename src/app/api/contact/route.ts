import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, buildLeadNotificationEmail } from '@/lib/email';
import { sendWhatsAppNotification, buildLeadWhatsAppMessage } from '@/lib/whatsapp';
import { consumeRateLimit } from '@/lib/rate-limit';
import {
  getClientIp,
  isAllowedOrigin,
  isBotTrapFilled,
  isValidContactService,
  isValidEmail,
  isValidPhone,
  normalizeText,
} from '@/lib/security';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const CONTACT_RATE_LIMIT = {
  limit: 5,
  windowMs: 10 * 60 * 1000,
};

export async function POST(req: NextRequest) {
  try {
    if (!isAllowedOrigin(req.headers)) {
      return NextResponse.json({ error: 'Forbidden origin' }, { status: 403 });
    }

    const ip = getClientIp(req.headers);
    const rateLimit = consumeRateLimit(
      'contact',
      ip,
      CONTACT_RATE_LIMIT.limit,
      CONTACT_RATE_LIMIT.windowMs
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
    const name = normalizeText(body?.name);
    const email = normalizeText(body?.email).toLowerCase();
    const phone = normalizeText(body?.phone);
    const business = normalizeText(body?.business);
    const message = normalizeText(body?.message);
    const service = normalizeText(body?.service);
    const companyWebsite = normalizeText(body?.companyWebsite);

    if (isBotTrapFilled(companyWebsite)) {
      return NextResponse.json({ success: true });
    }

    if (
      name.length < 2 ||
      name.length > 80 ||
      !isValidEmail(email) ||
      !isValidPhone(phone) ||
      business.length > 120 ||
      message.length > 2000 ||
      !isValidContactService(service)
    ) {
      return NextResponse.json({ error: 'Invalid form submission' }, { status: 400 });
    }

    const lead = { name, email, phone, business, message, service };
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      console.error('Contact API error: missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const { error } = await supabase.from('leads').insert({
      name,
      email,
      phone,
      business_type: business || null,
      message: message || null,
      service: service || null,
      source: 'website',
    });

    if (error) {
      console.error('Contact API database error:', error);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const supportEmail = process.env.SMTP_SUPPORT_EMAIL || process.env.SMTP_FROM_EMAIL;
    const notifications: Promise<unknown>[] = [];

    if (supportEmail && supportEmail.trim().length > 0) {
      const { subject, html } = buildLeadNotificationEmail(lead);
      notifications.push(sendEmail({ to: supportEmail, subject, html }));
    }

    const waMessage = buildLeadWhatsAppMessage(lead);
    notifications.push(sendWhatsAppNotification(waMessage));

    const results = await Promise.allSettled(notifications);
    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('Contact API notification error:', result.reason);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
