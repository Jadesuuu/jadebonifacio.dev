import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Per-key rate limiter for the contact form.
 *
 * Production (Vercel): backed by Upstash Redis so the count is shared across
 * every serverless instance and survives cold starts. The Vercel Marketplace
 * Upstash/KV integration injects KV_REST_API_URL + KV_REST_API_TOKEN; a
 * hand-configured Upstash database uses UPSTASH_REDIS_REST_URL + _TOKEN. Both
 * are accepted.
 *
 * Local dev without Redis: falls back to an in-memory sliding window so the
 * form still works. That fallback is per-process and is NOT safe in production
 * (a fresh instance has an empty map) — instrumentation.ts refuses to start in
 * production without Redis for exactly that reason.
 */

export const CONTACT_RATE_MAX = 3;
export const CONTACT_RATE_WINDOW_MS = 60 * 60 * 1000;

export type RateLimitResult = { allowed: boolean; remaining: number };

export function redisConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

let limiter: Ratelimit | null | undefined;

function redisLimiter(): Ratelimit | null {
  if (limiter !== undefined) return limiter;
  const cfg = redisConfig();
  limiter = cfg
    ? new Ratelimit({
        redis: new Redis(cfg),
        limiter: Ratelimit.slidingWindow(CONTACT_RATE_MAX, `${CONTACT_RATE_WINDOW_MS} ms`),
        prefix: "contact:ratelimit",
      })
    : null;
  return limiter;
}

// Dev-only fallback. Same semantics as the old in-action Map.
const memoryHits = new Map<string, number[]>();

function memoryLimit(key: string): RateLimitResult {
  const now = Date.now();
  const recent = (memoryHits.get(key) ?? []).filter((ts) => now - ts < CONTACT_RATE_WINDOW_MS);
  if (recent.length >= CONTACT_RATE_MAX) return { allowed: false, remaining: 0 };
  recent.push(now);
  memoryHits.set(key, recent);
  return { allowed: true, remaining: CONTACT_RATE_MAX - recent.length };
}

/**
 * Consume one hit for `key`. Counts the attempt whether or not the caller's
 * downstream work succeeds — the point is to bound attempts, not successes.
 *
 * If Redis is configured but unreachable, we fail open (allow) and log: a
 * Redis blip should not take the contact form down. The honeypot and timing
 * gate in the action still run regardless.
 */
export async function consumeContactLimit(key: string): Promise<RateLimitResult> {
  const rl = redisLimiter();
  if (!rl) return memoryLimit(key);
  try {
    const { success, remaining } = await rl.limit(key);
    return { allowed: success, remaining };
  } catch (err) {
    console.error("[contact] rate limiter unavailable, allowing request", err);
    return { allowed: true, remaining: 0 };
  }
}
