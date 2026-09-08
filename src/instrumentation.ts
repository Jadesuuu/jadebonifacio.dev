import { redisConfig } from "@/lib/rate-limit";

/**
 * Runs once when the server starts. In production, fail loudly if the contact
 * form's required env vars are missing rather than discovering it on first
 * submit. In dev the form degrades gracefully (the action returns a friendly
 * error, the rate limiter falls back to memory), so we only warn.
 */
export async function register() {
  const required = ["RESEND_API_KEY", "CONTACT_TO_EMAIL"] as const;
  const missing: string[] = required.filter((key) => !process.env[key]);
  // The rate limiter needs a shared store in production; an in-memory map is
  // per-instance and lets anyone bypass the limit by retrying (see PR history).
  if (!redisConfig()) missing.push("UPSTASH_REDIS_REST_URL/TOKEN (or KV_REST_API_URL/TOKEN)");
  if (missing.length === 0) return;

  const message = `Missing required environment variable(s): ${missing.join(", ")}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.warn(`[startup] ${message} — the contact form will not send email and/or rate limiting is in-memory only.`);
}
