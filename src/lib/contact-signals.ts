/**
 * Heuristics that estimate whether a contact-form submission was typed by a
 * person or produced by a script.
 *
 * These are guesses, printed in the notification email so the reader can judge
 * for themselves. They deliberately do not decide on their own whether mail
 * gets sent — see src/app/actions/contact.ts for what actually drops a
 * submission (very little, on purpose).
 *
 * Everything here is pure: no I/O, no clocks, no env. Same inputs, same
 * verdict, so the scoring can be reasoned about on its own.
 */

/** Positive weights mean "looks automated", negative mean "looks like a person". */
export type Signal = { weight: number; reason: string };

export type ContactSignalInput = {
  name: string;
  email: string;
  message: string;
  /**
   * Milliseconds the form was open before submitting, measured as the
   * difference between two readings of the *visitor's own* clock — so it is
   * immune to their clock being wrong. `null` when unknown (a no-JS submit, or
   * a value too implausible to trust).
   */
  dwellMs: number | null;
  /** The hidden honeypot field came back non-empty. */
  honeypotFilled: boolean;
  /** Previous submissions from this address / IP, not counting this one. */
  priorFromEmail: number;
  priorFromIp: number;
};

export type Verdict = "bot" | "unsure" | "human";

export type Assessment = {
  verdict: Verdict;
  score: number;
  signals: Signal[];
};

/** At or above this, we call it automated. */
const BOT_THRESHOLD = 6;
/** At or above this (but below BOT_THRESHOLD), we say we cannot tell. */
const UNSURE_THRESHOLD = 3;

/**
 * Boilerplate that turns up in agency cold-pitches and effectively never in a
 * real enquiry. Matched case-insensitively on word boundaries.
 */
const STRONG_PITCH_PHRASES = [
  "customer reviews",
  "testimonials to your",
  "add testimonials",
  "backlink",
  "domain authority",
  "first page of google",
  "top of google",
  "rank your website",
  "i came across your website",
  "i was browsing your",
  "i visited your website",
  "i stumbled upon your",
  "costs you nothing",
  "no obligation",
  "risk free",
  "free of cost",
  "white label",
  "dedicated developer",
  "lead generation",
  "grow your business",
  "increase your traffic",
  "boost your traffic",
  "potential clients might",
  "hesitate to hire",
  "reply if you would like",
  "let me know if interested",
  "kindly revert",
  "hope this email finds you well",
];

/**
 * Weaker tells. Ordinary clients do sometimes use these words, so two or more
 * are needed before the score moves at all.
 */
const WEAK_PITCH_PHRASES = [
  "seo",
  "web design",
  "website redesign",
  "digital marketing",
  "social media marketing",
  "affordable price",
  "low cost",
  "outsourcing",
  "free sample",
  "if you are interested",
  "mobile friendly",
  "loading speed",
];

/**
 * Things on this site a stranger could only mention by actually reading it.
 * Strong evidence of a person, and the main counterweight against a false
 * positive on someone writing a short, blunt enquiry.
 */
const SITE_SPECIFIC_TERMS = [
  "scoutboard",
  "jf & the world",
  "jf and the world",
  "enterprise platform",
  "awsys",
];

/** Message lengths that are suspiciously round — bulk-sender template caps. */
const TEMPLATE_CAPS = [160, 200, 250, 300, 500, 1000];

function escapeRegex(literal: string): string {
  return literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchPhrases(haystack: string, phrases: string[]): string[] {
  return phrases.filter((phrase) =>
    new RegExp(`\\b${escapeRegex(phrase)}\\b`, "i").test(haystack),
  );
}

/**
 * Gmail ignores dots and `+tags` in the local part, so `j.o.e+x@gmail.com` and
 * `joe@gmail.com` are one inbox. Collapsing them is what makes repeat-sender
 * counting work at all — dotted variants are the usual way a bulk sender makes
 * one address look like many.
 */
export function normalizeEmail(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 1 || at === trimmed.length - 1) return trimmed;

  let local = trimmed.slice(0, at);
  let domain = trimmed.slice(at + 1);

  const plus = local.indexOf("+");
  if (plus > 0) local = local.slice(0, plus);

  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") local = local.replaceAll(".", "");

  return `${local}@${domain}`;
}

/** How many dots the local part carries, before normalization. */
function localPartDots(raw: string): number {
  const at = raw.lastIndexOf("@");
  if (at < 1) return 0;
  return (raw.slice(0, at).match(/\./g) ?? []).length;
}

function isGmail(raw: string): boolean {
  const domain = raw.trim().toLowerCase().split("@")[1] ?? "";
  return domain === "gmail.com" || domain === "googlemail.com";
}

function countUrls(message: string): number {
  return (message.match(/\b(?:https?:\/\/|www\.)\S+/gi) ?? []).length;
}

/**
 * Score a submission. Returns every signal that fired, heaviest first, so the
 * notification email can show its reasoning rather than just a label.
 */
export function assessContact(input: ContactSignalInput): Assessment {
  const { email, message, dwellMs, honeypotFilled, priorFromEmail, priorFromIp } = input;
  const signals: Signal[] = [];

  if (honeypotFilled) {
    signals.push({ weight: 5, reason: "filled the hidden honeypot field" });
  }

  // --- Timing and typing rate -------------------------------------------
  if (dwellMs !== null) {
    const seconds = dwellMs / 1000;
    if (seconds < 3) {
      signals.push({
        weight: 4,
        reason: `submitted ${seconds.toFixed(1)}s after opening the form`,
      });
    } else if (seconds < 10) {
      signals.push({
        weight: 2,
        reason: `submitted ${Math.round(seconds)}s after opening the form`,
      });
    } else if (seconds > 90) {
      signals.push({ weight: -2, reason: `spent ${Math.round(seconds / 60)}m on the form` });
    }

    // Characters per second. Sustained human typing tops out well under 20/s;
    // far above that was pasted or generated.
    if (seconds > 0.5 && message.length >= 40) {
      const rate = message.length / seconds;
      if (rate > 25) {
        signals.push({
          weight: 3,
          reason: `${message.length} characters in ${Math.round(seconds)}s (~${Math.round(rate)}/s) — pasted, not typed`,
        });
      } else if (rate > 12) {
        signals.push({ weight: 1, reason: `typed unusually fast (~${Math.round(rate)}/s)` });
      } else if (rate >= 1 && rate <= 8) {
        signals.push({ weight: -1, reason: `typing pace looks human (~${rate.toFixed(1)}/s)` });
      }
    }
  }

  // --- Address shape ----------------------------------------------------
  const dots = localPartDots(email);
  if (isGmail(email) && dots >= 3) {
    signals.push({
      weight: 3,
      reason: `${dots} dots in a Gmail address — one inbox wearing many aliases`,
    });
  }

  // --- Message content --------------------------------------------------
  const strong = matchPhrases(message, STRONG_PITCH_PHRASES);
  if (strong.length >= 2) {
    signals.push({
      weight: 3,
      reason: `${strong.length} cold-pitch phrases: ${strong
        .slice(0, 3)
        .map((p) => `"${p}"`)
        .join(", ")}`,
    });
  } else if (strong.length === 1) {
    signals.push({ weight: 2, reason: `cold-pitch phrase: "${strong[0]}"` });
  }

  const weak = matchPhrases(message, WEAK_PITCH_PHRASES);
  if (weak.length >= 2) {
    signals.push({
      weight: 1,
      reason: `sales vocabulary: ${weak
        .slice(0, 3)
        .map((p) => `"${p}"`)
        .join(", ")}`,
    });
  }

  // A person writes "Hi Jade". A mail-merge writes whatever was in the name
  // column of the scrape.
  if (/^\s*(hi|hello|hey|dear|greetings|good day)[,!]?\s+jade\s+bonifacio\b/i.test(message)) {
    signals.push({ weight: 2, reason: "greeting uses your full name verbatim" });
  }

  if (TEMPLATE_CAPS.includes(message.length)) {
    signals.push({
      weight: 2,
      reason: `message is exactly ${message.length} characters — a common template cap`,
    });
  }

  const urls = countUrls(message);
  if (urls >= 3) {
    signals.push({ weight: 2, reason: `${urls} links in the message` });
  } else if (urls >= 1) {
    signals.push({ weight: 1, reason: "a link in the message" });
  }

  const mentions = SITE_SPECIFIC_TERMS.filter((term) => message.toLowerCase().includes(term));
  if (mentions.length > 0) {
    signals.push({
      weight: -4,
      reason: `mentions something only a reader would know: ${mentions.join(", ")}`,
    });
  }

  // --- Repeat senders ---------------------------------------------------
  if (priorFromEmail >= 2) {
    signals.push({
      weight: 2,
      reason: `message no. ${priorFromEmail + 1} from this address`,
    });
  } else if (priorFromEmail === 1) {
    signals.push({ weight: 1, reason: "second message from this address" });
  }

  // An IP is shared by offices, VPNs and whole mobile carriers, so repeats here
  // carry less weight than a repeated address.
  if (priorFromIp >= 3) {
    signals.push({ weight: 1, reason: `${priorFromIp + 1} messages from this IP` });
  }

  signals.sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  const score = signals.reduce((sum, s) => sum + s.weight, 0);
  const verdict: Verdict =
    score >= BOT_THRESHOLD ? "bot" : score >= UNSURE_THRESHOLD ? "unsure" : "human";

  return { verdict, score, signals };
}

export function verdictLabel(verdict: Verdict): string {
  if (verdict === "bot") return "likely a bot";
  if (verdict === "unsure") return "could be either";
  return "likely a person";
}
