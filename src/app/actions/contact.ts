"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";
import { isBlocked, recordContact, type ContactHistory } from "@/lib/contact-history";
import { assessContact, normalizeEmail, verdictLabel, type Assessment } from "@/lib/contact-signals";
import { consumeContactLimit } from "@/lib/rate-limit";

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

// Nobody fills in three fields this fast. Compared against `dwell` (a
// difference of two readings of the visitor's own clock) so a wrong system
// clock cannot trip it; see readDwellMs.
const MIN_DWELL_MS = 3000;

// Per-IP rate limit (3/hour). Backed by Upstash Redis in production so it is
// shared across serverless instances and survives cold starts; see
// src/lib/rate-limit.ts for backend selection and the dev-only fallback.

function clientIp(forwardedFor: string | null): string {
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}

/**
 * How long the form was open, in ms, or null if we cannot tell.
 *
 * The client sends `dwell` — `Date.now()` at submit minus `Date.now()` at
 * render, both read from the same clock, so any skew cancels out. `t` (the
 * render timestamp) is the fallback for a submit with JS disabled, where no
 * dwell can be computed; comparing that visitor's clock against ours is only
 * meaningful if the two roughly agree, so an implausible result is reported as
 * "unknown" rather than treated as suspiciously fast. Getting this wrong is
 * how the previous version silently discarded messages from anyone whose
 * clock ran a few seconds ahead.
 */
function readDwellMs(formData: FormData): number | null {
  const reported = Number(formData.get("dwell"));
  if (Number.isFinite(reported) && reported >= 0 && reported < 6 * 60 * 60 * 1000) {
    return reported;
  }

  const renderedAt = Number(formData.get("t"));
  if (!Number.isFinite(renderedAt) || renderedAt <= 0) return null;
  const elapsed = Date.now() - renderedAt;
  if (elapsed < 0 || elapsed > 24 * 60 * 60 * 1000) return null;
  return elapsed;
}

function formatDwell(dwellMs: number | null): string {
  if (dwellMs === null) return "unknown (no JS, or an unusable clock)";
  const seconds = dwellMs / 1000;
  if (seconds < 60) return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

function historyLine(history: ContactHistory): string {
  const parts: string[] = [];
  if (history.priorFromEmail > 0) {
    const first = history.emailFirstSeen?.slice(0, 10) ?? "unknown";
    parts.push(`message no. ${history.priorFromEmail + 1} from this address (first ${first})`);
  } else {
    parts.push("first message from this address");
  }
  if (history.priorFromIp > 0) {
    parts.push(`${history.priorFromIp + 1} from this IP`);
  }
  return parts.join(" · ");
}

function emailBody(args: {
  name: string;
  email: string;
  normalizedEmail: string;
  message: string;
  ip: string;
  dwellMs: number | null;
  history: ContactHistory;
  assessment: Assessment;
}): string {
  const { name, email, normalizedEmail, message, ip, dwellMs, history, assessment } = args;

  const emailLine =
    normalizedEmail === email.toLowerCase()
      ? `Email:   ${email}`
      : `Email:   ${email}  (same inbox as ${normalizedEmail})`;

  const rate =
    dwellMs !== null && dwellMs > 500 && message.length >= 40
      ? `, ~${Math.round(message.length / (dwellMs / 1000))} chars/s`
      : "";

  return [
    `Name:    ${name}`,
    emailLine,
    `Filled:  ${formatDwell(dwellMs)} after the page loaded (${message.length} chars${rate})`,
    `IP:      ${ip}`,
    `History: ${historyLine(history)}`,
    "",
    `Looks like: ${verdictLabel(assessment.verdict)} (score ${assessment.score})`,
    ...assessment.signals.map((s) => `  ${s.weight > 0 ? "·" : "+"} ${s.reason}`),
    "",
    "-".repeat(60),
    "",
    message,
  ].join("\n");
}

export async function submitContact(
  _prev: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
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

  const honeypotFilled = String(formData.get("company") ?? "").trim() !== "";
  const dwellMs = readDwellMs(formData);

  // The one hard timing gate. Trustworthy now that dwell comes from a single
  // clock, so a fast submit really is a fast submit. Bots should not learn what
  // tripped them, hence the same success shape as a real send.
  if (dwellMs !== null && dwellMs < MIN_DWELL_MS) {
    return { ok: true };
  }

  const { name, email, message } = parsed.data;
  const normalizedEmail = normalizeEmail(email);
  const ip = clientIp((await headers()).get("x-forwarded-for"));

  if (isBlocked(normalizedEmail, ip)) {
    console.warn(`[contact] blocklisted sender dropped: ${normalizedEmail} / ${ip}`);
    return { ok: true };
  }

  // Counts every genuine (non-bot, valid) submission, whether or not the send
  // then succeeds, so a broken email backend can't be hammered.
  const { allowed } = await consumeContactLimit(ip);
  if (!allowed) {
    return { ok: false, error: "Too many messages from here. Please try again later.", values };
  }

  const history = await recordContact(normalizedEmail, ip);
  const assessment = assessContact({
    name,
    email,
    message,
    dwellMs,
    honeypotFilled,
    priorFromEmail: history.priorFromEmail,
    priorFromIp: history.priorFromIp,
  });

  // Off by default: everything still arrives, tagged, so nothing is lost to a
  // heuristic. Set CONTACT_DROP_LIKELY_SPAM=1 once the tagging has proved
  // itself and the volume is worth silencing.
  if (assessment.verdict === "bot" && process.env.CONTACT_DROP_LIKELY_SPAM === "1") {
    console.warn(`[contact] dropped likely bot (score ${assessment.score}) from ${normalizedEmail}`);
    return { ok: true };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set");
    return { ok: false, error: "Contact is temporarily unavailable — please email me directly.", values };
  }

  // Prefix rather than a header, so a plain Gmail filter can route it without
  // touching the domain reputation a spam report would damage.
  const subject =
    assessment.verdict === "bot"
      ? `[likely spam] Portfolio contact from ${name}`
      : `Portfolio contact from ${name}`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Portfolio <contact@jadebonifacio.dev>",
      to,
      replyTo: email,
      subject,
      text: emailBody({
        name,
        email,
        normalizedEmail,
        message,
        ip,
        dwellMs,
        history,
        assessment,
      }),
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
