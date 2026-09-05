"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { submitContact } from "@/app/actions/contact";
import { links, mailto } from "@/content/links";

/**
 * Contact form. Behaviour only — deliberately minimal, unopinionated markup
 * using existing tokens so the visual design can be layered on later.
 *
 * Progressive enhancement: the <form action> points at the server action, so it
 * works without JS. With JS, useActionState adds pending/success/error states
 * without a navigation. The hidden `t` (render time) and `company` honeypot feed
 * the server action's bot checks.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, null);
  // Render time, captured once. Serialized from SSR so it also works without JS.
  const [renderedAt] = useState(() => Date.now());
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();

  if (state?.ok) {
    return (
      <p className="text-fg-muted" role="status">
        Thanks — your message is on its way. I&apos;ll reply to your email soon.
      </p>
    );
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  // React 19 resets the uncontrolled form after the action; echoing the
  // submitted values back as defaultValues is what keeps the user's text.
  const values = state && !state.ok ? state.values : undefined;

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4" noValidate>
        {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
        <div aria-hidden="true" className="absolute h-px w-px overflow-hidden" style={{ left: "-9999px" }}>
          <label htmlFor="company">Company</label>
          <input id="company" type="text" name="company" tabIndex={-1} autoComplete="off" />
        </div>
        <input type="hidden" name="t" value={renderedAt} />

        <Field id={nameId} name="name" label="Name" error={fieldErrors?.name}>
          <input
            id={nameId}
            name="name"
            type="text"
            defaultValue={values?.name}
            required
            maxLength={80}
            autoComplete="name"
            aria-invalid={fieldErrors?.name ? true : undefined}
            aria-describedby={fieldErrors?.name ? `${nameId}-error` : undefined}
            className="w-full rounded-[6px] border border-border bg-bg-subtle px-3 py-2 text-fg"
          />
        </Field>

        <Field id={emailId} name="email" label="Email" error={fieldErrors?.email}>
          <input
            id={emailId}
            name="email"
            type="email"
            defaultValue={values?.email}
            required
            autoComplete="email"
            aria-invalid={fieldErrors?.email ? true : undefined}
            aria-describedby={fieldErrors?.email ? `${emailId}-error` : undefined}
            className="w-full rounded-[6px] border border-border bg-bg-subtle px-3 py-2 text-fg"
          />
        </Field>

        <Field id={messageId} name="message" label="Message" error={fieldErrors?.message}>
          <textarea
            id={messageId}
            name="message"
            defaultValue={values?.message}
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            aria-invalid={fieldErrors?.message ? true : undefined}
            aria-describedby={fieldErrors?.message ? `${messageId}-error` : undefined}
            className="w-full rounded-[6px] border border-border bg-bg-subtle px-3 py-2 text-fg"
          />
        </Field>

        {state && !state.ok && state.error ? (
          <p role="alert" className="text-small text-fg-muted">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-[6px] border border-border px-4 py-2 text-meta-mono text-fg disabled:opacity-60"
        >
          {pending ? "sending…" : "send"}
        </button>
      </form>

      <CopyEmail />
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  name: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-meta-mono text-fg-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-small text-fg-muted">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(links.email);
      setCopied(true);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (e.g. insecure context): fall back to the mailto link.
      window.location.assign(mailto);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-border px-3 py-1.5 text-meta-mono text-fg-muted"
    >
      {links.email}
      <span aria-hidden="true" className={copied ? "text-accent" : "text-fg-faint"}>
        {copied ? "copied" : "copy"}
      </span>
    </button>
  );
}
