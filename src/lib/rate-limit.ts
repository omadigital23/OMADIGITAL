// Simple IP-based rate limiter backed by Redis (Upstash), with in-memory fallback
import { getRedis } from './redis';

export type RateLimitConfig = {
  windowSec: number; // e.g., 900 for 15 minutes
  maxRequests: number; // e.g., 5 attempts
  prefix?: string; // key namespace
};

export async function isRateLimited(ip: string, route: string, cfg: RateLimitConfig) {
  const redis = getRedis();
  const key = `${cfg.prefix || 'rl'}:${route}:${ip}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, cfg.windowSec);
  }
  const remaining = Math.max(0, cfg.maxRequests - current);
  return {
    limited: current > cfg.maxRequests,
    remaining,
    resetInSec: cfg.windowSec, // rough estimate; could fetch TTL for precision if needed
  };
}
