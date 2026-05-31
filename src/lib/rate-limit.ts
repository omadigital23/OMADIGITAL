import 'server-only';

import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { logServerEvent } from '@/lib/server-observability';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

type SupabaseRateLimitRow = {
  ok: boolean;
  remaining: number;
  reset_at: string;
  retry_after_seconds: number;
};

const buckets = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries(now: number) {
  if (buckets.size < 5000) {
    return;
  }

  for (const [key, entry] of buckets.entries()) {
    if (entry.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function consumeMemoryRateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);

  const bucketKey = `${bucket}:${key}`;
  const current = buckets.get(bucketKey);

  if (!current || current.resetAt <= now) {
    const next: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };

    buckets.set(bucketKey, next);

    return {
      ok: true,
      remaining: Math.max(limit - 1, 0),
      resetAt: next.resetAt,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
    };
  }

  current.count += 1;

  return {
    ok: true,
    remaining: Math.max(limit - current.count, 0),
    resetAt: current.resetAt,
    retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
  };
}

function shouldUseSupabaseRateLimit() {
  return process.env.NODE_ENV !== 'test' && process.env.RATE_LIMIT_BACKEND !== 'memory';
}

function normalizeSupabaseRateLimitRow(row: SupabaseRateLimitRow): RateLimitResult {
  const resetAt = Date.parse(row.reset_at);

  return {
    ok: Boolean(row.ok),
    remaining: Number(row.remaining) || 0,
    resetAt: Number.isFinite(resetAt) ? resetAt : Date.now(),
    retryAfterSeconds: Math.max(Number(row.retry_after_seconds) || 1, 1),
  };
}

export async function consumeRateLimit(
  bucket: string,
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (!shouldUseSupabaseRateLimit()) {
    return consumeMemoryRateLimit(bucket, key, limit, windowMs);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return consumeMemoryRateLimit(bucket, key, limit, windowMs);
  }

  const { data, error } = await supabase
    .rpc('consume_rate_limit', {
      p_bucket: bucket,
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    })
    .single();

  if (error || !data) {
    logServerEvent('warn', 'rate_limit_supabase_fallback', {
      bucket,
      reason: error?.message || 'empty_response',
    });
    return consumeMemoryRateLimit(bucket, key, limit, windowMs);
  }

  return normalizeSupabaseRateLimitRow(data as SupabaseRateLimitRow);
}
