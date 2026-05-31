import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { consumeRateLimit } from '@/lib/rate-limit';

describe('rate limit fallback', () => {
  it('allows requests until the limit is reached', async () => {
    const bucket = `test-${randomUUID()}`;
    const key = randomUUID();

    const first = await consumeRateLimit(bucket, key, 2, 60_000);
    const second = await consumeRateLimit(bucket, key, 2, 60_000);
    const third = await consumeRateLimit(bucket, key, 2, 60_000);

    expect(first.ok).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.ok).toBe(true);
    expect(second.remaining).toBe(0);
    expect(third.ok).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('keeps buckets isolated', async () => {
    const key = randomUUID();
    const firstBucket = await consumeRateLimit(`test-${randomUUID()}`, key, 1, 60_000);
    const secondBucket = await consumeRateLimit(`test-${randomUUID()}`, key, 1, 60_000);

    expect(firstBucket.ok).toBe(true);
    expect(secondBucket.ok).toBe(true);
  });
});
