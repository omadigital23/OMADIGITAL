type LogLevel = 'info' | 'warn' | 'error';

type LogValue = string | number | boolean | null | undefined;

type LogFields = Record<string, LogValue>;

type HeaderBag = {
  get(name: string): string | null;
};

type ApiFailureInput = {
  route: string;
  status: number;
  source: string;
  requestId?: string;
  error?: unknown;
};

type FailureBucket = {
  count: number;
  resetAt: number;
  alertEmitted: boolean;
};

const API_FAILURE_WINDOW_MS = 5 * 60 * 1000;
const API_FAILURE_ALERT_THRESHOLD = 3;
const failureBuckets = new Map<string, FailureBucket>();

function getErrorMessage(error: unknown): string | undefined {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error';
}

function sanitizeFields(fields: LogFields): LogFields {
  return Object.fromEntries(
    Object.entries(fields)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === 'string' && value.length > 500 ? `${value.slice(0, 500)}...` : value,
      ])
  );
}

export function getRequestLogContext(headers: HeaderBag, route: string): LogFields {
  return {
    route,
    requestId: headers.get('x-vercel-id') || headers.get('x-request-id') || undefined,
  };
}

export function getEmailDomain(email: string | undefined): string | undefined {
  const domain = email?.split('@')[1]?.trim().toLowerCase();
  return domain || undefined;
}

export function logServerEvent(level: LogLevel, event: string, fields: LogFields = {}) {
  const payload = JSON.stringify({
    level,
    event,
    timestamp: new Date().toISOString(),
    ...sanitizeFields(fields),
  });

  if (level === 'error') {
    console.error(payload);
    return;
  }

  if (level === 'warn') {
    console.warn(payload);
    return;
  }

  console.log(payload);
}

export function recordApiFailure(input: ApiFailureInput) {
  const now = Date.now();
  const bucketKey = `${input.route}:${input.status}:${input.source}`;
  const current = failureBuckets.get(bucketKey);
  const bucket =
    current && current.resetAt > now
      ? current
      : {
          count: 0,
          resetAt: now + API_FAILURE_WINDOW_MS,
          alertEmitted: false,
        };

  bucket.count += 1;
  failureBuckets.set(bucketKey, bucket);

  logServerEvent('error', 'api_failure', {
    route: input.route,
    status: input.status,
    source: input.source,
    requestId: input.requestId,
    error: getErrorMessage(input.error),
    failuresInWindow: bucket.count,
  });

  if (bucket.count >= API_FAILURE_ALERT_THRESHOLD && !bucket.alertEmitted) {
    bucket.alertEmitted = true;
    logServerEvent('error', 'api_failure_burst_alert', {
      route: input.route,
      status: input.status,
      source: input.source,
      requestId: input.requestId,
      failuresInWindow: bucket.count,
      windowSeconds: Math.round(API_FAILURE_WINDOW_MS / 1000),
    });
  }
}

export function logEmailNotification({
  form,
  ok,
  requestId,
  recipientDomain,
  ms,
  reason,
}: {
  form: 'contact' | 'newsletter';
  ok: boolean;
  requestId?: string;
  recipientDomain?: string;
  ms?: number;
  reason?: string;
}) {
  logServerEvent(ok ? 'info' : 'error', 'form_email_notification', {
    form,
    channel: 'email',
    ok,
    requestId,
    recipientDomain,
    ms,
    reason,
  });
}
