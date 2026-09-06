"use client";

import { useActionState, useId, useState } from "react";
import { submitContact } from "@/app/actions/contact";

/**
 * Contact form (v2 design), server-action edition. Submits to `submitContact`,
 * which validates, rate-limits, and sends via Resend — so mail actually goes
 * out, no visitor mail client involved.
 *
 * Progressive enhancement: the <form action> points at the server action, so it
 * works without JS. With JS, useActionState adds pending/success/error states
 * without a navigation. A hidden `t` (render time) and `company` honeypot feed
 * the action's bot checks; on failure the typed values are echoed back as
 * defaultValues (React 19 resets an uncontrolled form after an action).
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, null);
  const [renderedAt] = useState(() => Date.now());
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();

  if (state?.ok) {
    return (
      <div className="flex min-w-0 flex-col justify-center gap-3">
        <p className="font-display text-[26px] italic">
          Message sent<span className="text-accent">.</span>
        </p>
        <p className="m-0 text-[15px] leading-relaxed text-fg-muted" role="status">
          Thanks — it&apos;s on its way. I&apos;ll reply to your email soon.
        </p>
      </div>
    );
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const values = state && !state.ok ? state.values : undefined;

  return (
    <form action={formAction} className="flex min-w-0 flex-col gap-3.5" noValidate>
      {/* Honeypot: off-screen, hidden from assistive tech, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="t" value={renderedAt} />

      <div className="grid grid-cols-2 gap-3.5 max-[840px]:grid-cols-1">
        <div className="flex flex-col gap-1.5">
          <input
            id={nameId}
            className="v2-field aria-invalid:border-accent"
            name="name"
            placeholder="your name"
            aria-label="Your name"
            defaultValue={values?.name}
            required
            maxLength={80}
            autoComplete="name"
            aria-invalid={fieldErrors?.name ? true : undefined}
            aria-describedby={fieldErrors?.name ? `${nameId}-error` : undefined}
          />
          {fieldErrors?.name ? (
            <p id={`${nameId}-error`} className="font-mono text-xs text-accent">
              {fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <input
            id={emailId}
            className="v2-field aria-invalid:border-accent"
            name="email"
            type="email"
            placeholder="your email"
            aria-label="Your email"
            defaultValue={values?.email}
            required
            autoComplete="email"
            aria-invalid={fieldErrors?.email ? true : undefined}
            aria-describedby={fieldErrors?.email ? `${emailId}-error` : undefined}
          />
          {fieldErrors?.email ? (
            <p id={`${emailId}-error`} className="font-mono text-xs text-accent">
              {fieldErrors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <textarea
          id={messageId}
          className="v2-field aria-invalid:border-accent resize-y"
          name="message"
          rows={6}
          placeholder="what are we building?"
          aria-label="Message"
          defaultValue={values?.message}
          required
          minLength={10}
          maxLength={2000}
          aria-invalid={fieldErrors?.message ? true : undefined}
          aria-describedby={fieldErrors?.message ? `${messageId}-error` : undefined}
        />
        {fieldErrors?.message ? (
          <p id={`${messageId}-error`} className="font-mono text-xs text-accent">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {state && !state.ok && state.error && !fieldErrors ? (
        <p role="alert" className="font-mono text-xs text-accent">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="v2-btn-a cursor-pointer self-start rounded-lg border-none bg-accent px-5 py-3.5 font-mono text-[13px] tracking-[0.02em] text-fg-on-accent disabled:cursor-default disabled:opacity-60"
      >
        {pending ? "sending…" : "send message →"}
      </button>
    </form>
  );
}
