"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";

export type ContactValues = { name: string; email: string; message: string };

export type ContactResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string>;
      // Echoed back so the client can repopulate the fields — React 19 resets
      // an uncontrolled form after an action, so these become the defaultValues.
      values?: ContactValues;
    };

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(80, "Keep it under 80 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "A little more detail, please (at least 10 characters).")
    .max(2000, "That's over 2000 characters — trim it a little."),
});

// Timing gate: submissions faster than this after the form rendered are almost
// certainly bots.
const MIN_ELAPSED_MS = 3000;

// Best-effort per-IP rate limit. NOTE: this Map lives in a single warm
// serverless instance, so it resets on cold starts and is not shared across
// instances — it deters casual abuse, not a determined attacker. The upgrade
// path is a durable store like Upstash (Redis) keyed the same way.
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 3;
const hitsByIp = new Map<string, number[]>();

function clientIp(forwardedFor: string | null): string {
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

export async function submitContact(
  _prev: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  // Honeypot + timing. Bots shouldn't learn what tripped them, so we return the
  // same success shape as a real send and simply send nothing.
  const honeypot = String(formData.get("company") ?? "").trim();
  const renderedAt = Number(formData.get("t") ?? 0);
  const elapsed = Date.now() - renderedAt;
  if (honeypot !== "" || !renderedAt || elapsed < MIN_ELAPSED_MS) {
    return { ok: true };
  }

  // Raw values, echoed back on any failure so the user never loses their text.
  const values: ContactValues = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors, values };
  }

  const ip = clientIp((await headers()).get("x-forwarded-for"));
  const now = Date.now();
  const recent = (hitsByIp.get(ip) ?? []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    return { ok: false, error: "Too many messages from here. Please try again later.", values };
  }
  // Count every genuine (non-bot, valid) submission, whether or not the send
  // then succeeds, so a broken email backend can't be hammered.
  recent.push(now);
  hitsByIp.set(ip, recent);

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set");
    return { ok: false, error: "Contact is temporarily unavailable — please email me directly.", values };
  }

  const { name, email, message } = parsed.data;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Portfolio <contact@jadebonifacio.dev>",
      to,
      replyTo: email,
      subject: `Portfolio contact from ${name}`,
      text: [
        `Name:    ${name}`,
        `Email:   ${email}`,
        `Sent:    ${new Date(renderedAt).toISOString()}`,
        `IP:      ${ip}`,
        "",
        message,
      ].join("\n"),
    });
    if (error) {
      // Log the real Resend error server-side; never surface it to the client.
      console.error("[contact] Resend returned an error", error);
      return { ok: false, error: "Something went wrong sending your message. Please try again.", values };
    }
  } catch (err) {
    console.error("[contact] send failed", err);
    return { ok: false, error: "Something went wrong sending your message. Please try again.", values };
  }

  return { ok: true };
}
