import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, buildLeadNotificationEmail } from '@/lib/email';
import { BUSINESS } from '@/lib/constants';
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
import {
  getEmailDomain,
  getRequestLogContext,
  logEmailNotification,
  logServerEvent,
  recordApiFailure,
} from '@/lib/server-observability';

const CONTACT_RATE_LIMIT = {
  limit: 5,
  windowMs: 10 * 60 * 1000,
};

export async function POST(req: NextRequest) {
  const start = Date.now();
  const requestContext = getRequestLogContext(req.headers, '/api/contact');

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
      'contact',
      ip,
      CONTACT_RATE_LIMIT.limit,
      CONTACT_RATE_LIMIT.windowMs
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
    const name = normalizeText(body?.name);
    const email = normalizeText(body?.email).toLowerCase();
    const phone = normalizeText(body?.phone);
    const business = normalizeText(body?.business);
    const message = normalizeText(body?.message);
    const service = normalizeText(body?.service);
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

    if (
      name.length < 2 ||
      name.length > 80 ||
      !isValidEmail(email) ||
      phone.length === 0 ||
      !isValidPhone(phone) ||
      business.length > 120 ||
      message.length > 2000 ||
      !isValidContactService(service)
    ) {
      logServerEvent('warn', 'api_request_rejected', {
        ...requestContext,
        status: 400,
        reason: 'invalid_form_submission',
        ms: Date.now() - start,
      });
      return NextResponse.json({ error: 'Invalid form submission' }, { status: 400 });
    }

    const lead = { name, email, phone, business, message, service };
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      recordApiFailure({
        route: '/api/contact',
        status: 500,
        source: 'missing_supabase_config',
        requestId: requestContext.requestId as string | undefined,
      });
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
      recordApiFailure({
        route: '/api/contact',
        status: 500,
        source: 'database_insert',
        requestId: requestContext.requestId as string | undefined,
        error,
      });
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const supportEmail =
      process.env.SMTP_SUPPORT_EMAIL?.trim() ||
      BUSINESS.email ||
      process.env.SMTP_FROM_EMAIL?.trim();
    const notifications: Array<Promise<{ channel: string; ok: boolean }>> = [];

    if (supportEmail && supportEmail.trim().length > 0) {
      const { subject, html } = buildLeadNotificationEmail(lead);
      const emailStartedAt = Date.now();
      notifications.push(
        sendEmail({ to: supportEmail, subject, html, replyTo: email }).then((ok) => {
          logEmailNotification({
            form: 'contact',
            ok,
            requestId: requestContext.requestId as string | undefined,
            recipientDomain: getEmailDomain(supportEmail),
            ms: Date.now() - emailStartedAt,
            reason: ok ? undefined : 'smtp_delivery_failed',
          });

          return {
            channel: 'email',
            ok,
          };
        })
      );
    } else {
      logEmailNotification({
        form: 'contact',
        ok: false,
        requestId: requestContext.requestId as string | undefined,
        reason: 'missing_support_email',
      });
    }

    const waMessage = buildLeadWhatsAppMessage(lead);
    notifications.push(
      sendWhatsAppNotification(waMessage).then((ok) => ({
        channel: 'whatsapp',
        ok,
      }))
    );

    const results = await Promise.allSettled(notifications);
    for (const result of results) {
      if (result.status === 'rejected') {
        logServerEvent('error', 'contact_notification_failed', {
          ...requestContext,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
        });
      } else if (!result.value.ok) {
        logServerEvent('error', 'contact_notification_not_delivered', {
          ...requestContext,
          channel: result.value.channel,
        });
      }
    }

    logServerEvent('info', 'api_request_completed', {
      ...requestContext,
      status: 200,
      outcome: 'lead_saved',
      notificationCount: notifications.length,
      ms: Date.now() - start,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    recordApiFailure({
      route: '/api/contact',
      status: 500,
      source: 'unhandled_exception',
      requestId: requestContext.requestId as string | undefined,
      error,
    });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
