/**
 * Best-effort, in-memory, per-IP fixed-window rate limiter.
 *
 * The proxy route spends a single shared API key, so we cap how fast any one
 * client can drain it. This is intentionally simple: state lives in module
 * memory, which means it is per-instance and resets on cold start. For
 * multi-instance deployments, front it with a shared limiter — see README.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 10_000;

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  /** Epoch ms at which the current window resets. */
  resetAt: number;
}

function prune(now: number): void {
  if (buckets.size < MAX_TRACKED_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Record one hit for `key` and report whether it is within `limitPerMin`.
 * `now` is injected so callers (and tests) control the clock.
 */
export function rateLimit(
  key: string,
  limitPerMin: number,
  now: number,
): RateLimitResult {
  prune(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + WINDOW_MS;
    buckets.set(key, { count: 1, resetAt });
    return {
      ok: true,
      limit: limitPerMin,
      remaining: Math.max(0, limitPerMin - 1),
      resetAt,
    };
  }

  existing.count += 1;
  return {
    ok: existing.count <= limitPerMin,
    limit: limitPerMin,
    remaining: Math.max(0, limitPerMin - existing.count),
    resetAt: existing.resetAt,
  };
}

/** Test/maintenance helper — clears all tracked windows. */
export function resetRateLimit(): void {
  buckets.clear();
}
