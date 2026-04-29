import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, buildNewsletterNotificationEmail } from '@/lib/email';
import { BUSINESS } from '@/lib/constants';
import { consumeRateLimit } from '@/lib/rate-limit';
import {
  getClientIp,
  isAllowedOrigin,
  isBotTrapFilled,
  isValidEmail,
  normalizeText,
} from '@/lib/security';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  getEmailDomain,
  getRequestLogContext,
  logEmailNotification,
  logServerEvent,
  recordApiFailure,
} from '@/lib/server-observability';

const NEWSLETTER_RATE_LIMIT = {
  limit: 5,
  windowMs: 60 * 60 * 1000,
};

export async function POST(req: NextRequest) {
  const start = Date.now();
  const requestContext = getRequestLogContext(req.headers, '/api/newsletter');

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
      'newsletter',
      ip,
      NEWSLETTER_RATE_LIMIT.limit,
      NEWSLETTER_RATE_LIMIT.windowMs
    );

    if (!rateLimit.ok) {
      logServerEvent('warn', 'api_request_rate_limited', {
        ...requestContext,
        status: 429,
        retryAfterSeconds: rateLimit.retryAfterSeconds,
        ms: Date.now() - start,
      });
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
      logServerEvent('info', 'api_request_completed', {
        ...requestContext,
        status: 200,
        outcome: 'honeypot',
        ms: Date.now() - start,
      });
      return NextResponse.json({ success: true });
    }

    if (!isValidEmail(email)) {
      logServerEvent('warn', 'api_request_rejected', {
        ...requestContext,
        status: 400,
        reason: 'invalid_email',
        ms: Date.now() - start,
      });
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (!supabase) {
      recordApiFailure({
        route: '/api/newsletter',
        status: 500,
        source: 'missing_supabase_config',
        requestId: requestContext.requestId as string | undefined,
      });
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
      recordApiFailure({
        route: '/api/newsletter',
        status: 500,
        source: 'database_upsert',
        requestId: requestContext.requestId as string | undefined,
        error,
      });
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    // Send email notification to admin
    const supportEmail =
      process.env.SMTP_SUPPORT_EMAIL?.trim() ||
      BUSINESS.email ||
      process.env.SMTP_FROM_EMAIL?.trim();
    if (supportEmail && supportEmail.trim().length > 0) {
      const { subject, html } = buildNewsletterNotificationEmail(email);
      const emailStartedAt = Date.now();
      const emailSent = await sendEmail({ to: supportEmail, subject, html, replyTo: email });
      logEmailNotification({
        form: 'newsletter',
        ok: emailSent,
        requestId: requestContext.requestId as string | undefined,
        recipientDomain: getEmailDomain(supportEmail),
        ms: Date.now() - emailStartedAt,
        reason: emailSent ? undefined : 'smtp_delivery_failed',
      });

      if (!emailSent) {
        logServerEvent('error', 'newsletter_notification_not_delivered', {
          ...requestContext,
          channel: 'email',
        });
      }
    } else {
      logEmailNotification({
        form: 'newsletter',
        ok: false,
        requestId: requestContext.requestId as string | undefined,
        reason: 'missing_support_email',
      });
    }

    logServerEvent('info', 'api_request_completed', {
      ...requestContext,
      status: 200,
      outcome: 'subscriber_saved',
      ms: Date.now() - start,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    recordApiFailure({
      route: '/api/newsletter',
      status: 500,
      source: 'unhandled_exception',
      requestId: requestContext.requestId as string | undefined,
      error,
    });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

