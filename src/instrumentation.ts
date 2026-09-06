/**
 * Runs once when the server starts. In production, fail loudly if the contact
 * form's required env vars are missing rather than discovering it on first
 * submit. In dev the form degrades gracefully (the action returns a friendly
 * error), so we only warn.
 */
export async function register() {
  const required = ["RESEND_API_KEY", "CONTACT_TO_EMAIL"] as const;
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length === 0) return;

  const message = `Missing required environment variable(s): ${missing.join(", ")}`;
  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }
  console.warn(`[startup] ${message} — the contact form will not send email.`);
}
