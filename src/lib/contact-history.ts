import { Redis } from "@upstash/redis";
import { redisConfig } from "./rate-limit";

/**
 * Remembers who has written in before, so a repeat sender is visible in the
 * notification email instead of looking like a first-time enquiry.
 *
 * Shares the rate limiter's Redis (Upstash in production, see
 * src/lib/rate-limit.ts) and its dev-only in-memory fallback. Unlike the rate
 * limiter this is purely informational — if the store is unavailable we report
 * "no history" and carry on, because losing a counter must never cost a
 * message.
 */

const PREFIX = "contact:seen";
/** Long enough to catch a sender working through a list over months. */
const TTL_SECONDS = 60 * 60 * 24 * 180;

export type ContactHistory = {
  /** Submissions from this address before the current one. */
  priorFromEmail: number;
  priorFromIp: number;
  /** ISO date of the first submission from this address, if there was one. */
  emailFirstSeen: string | null;
  ipFirstSeen: string | null;
};

const EMPTY: ContactHistory = {
  priorFromEmail: 0,
  priorFromIp: 0,
  emailFirstSeen: null,
  ipFirstSeen: null,
};

let client: Redis | null | undefined;

function redis(): Redis | null {
  if (client !== undefined) return client;
  const cfg = redisConfig();
  client = cfg ? new Redis(cfg) : null;
  return client;
}

/** Dev-only fallback, mirroring rate-limit.ts. Per-process, resets on restart. */
const memory = new Map<string, { count: number; firstSeen: string }>();

function memoryRecord(key: string, nowIso: string): { prior: number; firstSeen: string } {
  const existing = memory.get(key);
  if (!existing) {
    memory.set(key, { count: 1, firstSeen: nowIso });
    return { prior: 0, firstSeen: nowIso };
  }
  existing.count += 1;
  return { prior: existing.count - 1, firstSeen: existing.firstSeen };
}

/**
 * Count this submission and return what came before it.
 *
 * `normalizedEmail` should come from `normalizeEmail` in contact-signals.ts —
 * counting raw addresses would let dotted Gmail aliases each look brand new,
 * which is exactly the trick this is meant to see through.
 */
export async function recordContact(
  normalizedEmail: string,
  ip: string,
): Promise<ContactHistory> {
  const nowIso = new Date().toISOString();
  const emailKey = `${PREFIX}:email:${normalizedEmail}`;
  const ipKey = `${PREFIX}:ip:${ip}`;

  const rd = redis();
  if (!rd) {
    const e = memoryRecord(emailKey, nowIso);
    const i = memoryRecord(ipKey, nowIso);
    return {
      priorFromEmail: e.prior,
      priorFromIp: i.prior,
      emailFirstSeen: e.prior > 0 ? e.firstSeen : null,
      ipFirstSeen: i.prior > 0 ? i.firstSeen : null,
    };
  }

  try {
    // `set(..., { nx: true })` before `get` means the get always returns a
    // value: the original first-seen for a repeat, or now for a newcomer.
    const pipeline = rd.pipeline();
    pipeline.incr(emailKey);
    pipeline.expire(emailKey, TTL_SECONDS);
    pipeline.set(`${emailKey}:first`, nowIso, { nx: true, ex: TTL_SECONDS });
    pipeline.get(`${emailKey}:first`);
    pipeline.incr(ipKey);
    pipeline.expire(ipKey, TTL_SECONDS);
    pipeline.set(`${ipKey}:first`, nowIso, { nx: true, ex: TTL_SECONDS });
    pipeline.get(`${ipKey}:first`);
    const results = await pipeline.exec();

    const emailCount = Number(results[0] ?? 1);
    const emailFirst = (results[3] as string | null) ?? null;
    const ipCount = Number(results[4] ?? 1);
    const ipFirst = (results[7] as string | null) ?? null;

    const priorFromEmail = Math.max(0, emailCount - 1);
    const priorFromIp = Math.max(0, ipCount - 1);

    return {
      priorFromEmail,
      priorFromIp,
      emailFirstSeen: priorFromEmail > 0 ? emailFirst : null,
      ipFirstSeen: priorFromIp > 0 ? ipFirst : null,
    };
  } catch (err) {
    console.error("[contact] history unavailable, treating sender as new", err);
    return EMPTY;
  }
}

/**
 * Senders to drop outright, from `CONTACT_BLOCKLIST` — a comma-separated list
 * of any of:
 *
 *   - a full address, matched after normalization: `spammer@gmail.com`
 *   - a whole domain: `@badagency.com`
 *   - an exact IP: `136.0.117.206`
 *   - an IP prefix, written with a trailing dot: `136.0.`
 *
 * Kept in an env var rather than a database so it can be edited in the Vercel
 * dashboard without a deploy or a migration.
 */
export function isBlocked(normalizedEmail: string, ip: string): boolean {
  const raw = process.env.CONTACT_BLOCKLIST;
  if (!raw) return false;

  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)
    .some((entry) => {
      if (entry.startsWith("@")) return normalizedEmail.endsWith(entry);
      if (entry.includes("@")) return normalizedEmail === entry;
      if (entry.endsWith(".")) return ip.startsWith(entry);
      return ip === entry;
    });
}
