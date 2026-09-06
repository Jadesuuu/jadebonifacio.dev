"use client";

import { useEffect, useRef, useState } from "react";
import { links } from "@/content/links";

/**
 * Contact-section chip: shows the email, copies it to the clipboard on click,
 * and flips the accent label to "copied!" for 1.6s. Falls back silently when
 * the clipboard API is unavailable (older browsers, insecure contexts).
 */
export function CopyEmailButton() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onClick = async () => {
    try {
      await navigator.clipboard?.writeText(links.email);
    } catch {
      // No clipboard access — leave the label unchanged.
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex max-w-full cursor-pointer items-center gap-2.5 self-start rounded-lg border border-border bg-transparent px-4 py-3 font-mono text-sm text-fg"
    >
      <span className="overflow-hidden text-ellipsis">{links.email}</span>
      <span aria-live="polite" className="shrink-0 text-accent">
        {copied ? "copied!" : "copy"}
      </span>
    </button>
  );
}
