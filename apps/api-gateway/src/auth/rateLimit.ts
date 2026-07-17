// In-memory fixed-window rate limiter, keyed by API-key id. Protects the backend from a
// key hammering it (runaway agent loop or abuse). Users/admin are unaffected.
// NOTE: per-process + resets on restart. TODO: swap for Redis before a multi-instance
// deploy (tracked in DESIGN_DECISIONS §13.5).

interface Bucket {
  count: number;
  windowStart: number; // ms epoch
}

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function consumeKeyRateLimit(keyId: string, limitPerHour: number): RateLimitResult {
  const now = Date.now();
  let bucket = buckets.get(keyId);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    bucket = { count: 0, windowStart: now };
    buckets.set(keyId, bucket);
  }

  if (bucket.count >= limitPerHour) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.ceil((bucket.windowStart + WINDOW_MS - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limitPerHour - bucket.count, retryAfterSec: 0 };
}
