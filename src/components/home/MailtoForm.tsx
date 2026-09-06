"use client";

import type { FormEvent } from "react";
import { links } from "@/content/links";

/**
 * Contact form, mailto edition (matches the v2 design). On submit it composes a
 * pre-filled message and hands off to the visitor's mail client — no server, no
 * keys, works everywhere. Required fields still get native validation first.
 */
export function MailtoForm() {
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;

    const subject = encodeURIComponent(`Hello from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${links.email}?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-col gap-3.5">
      <div className="grid grid-cols-2 gap-3.5 max-[840px]:grid-cols-1">
        <input className="v2-field" name="name" placeholder="your name" aria-label="Your name" required />
        <input
          className="v2-field"
          name="email"
          type="email"
          placeholder="your email"
          aria-label="Your email"
          required
        />
      </div>
      <textarea
        className="v2-field resize-y"
        name="message"
        rows={6}
        placeholder="what are we building?"
        aria-label="Message"
        required
      />
      <button
        type="submit"
        className="v2-btn-a cursor-pointer self-start rounded-lg border-none bg-accent px-5 py-3.5 font-mono text-[13px] tracking-[0.02em] text-fg-on-accent"
      >
        send message →
      </button>
    </form>
  );
}
