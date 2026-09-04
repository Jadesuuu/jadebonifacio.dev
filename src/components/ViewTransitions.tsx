"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type HistoryMethod = "pushState" | "replaceState";

/**
 * View Transitions (DESIGN.md, Motion). App Router navigations are soft
 * (history.pushState + a client render), so the browser never starts a view
 * transition on its own. This patches pushState/replaceState to wrap each
 * navigation in document.startViewTransition, holding the transition open until
 * the new route has committed (the pathname effect below), so the shared
 * view-transition-name elements — a project-row title and the case-study H1 —
 * morph, and the rest crossfades. Disabled under reduced motion and where the
 * API is unavailable (the navigation still happens, just without animation).
 */
export function ViewTransitions() {
  const pathname = usePathname();
  const finish = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof document === "undefined" || typeof document.startViewTransition !== "function") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const resolvePending = () => {
      if (finish.current) {
        finish.current();
        finish.current = null;
      }
    };

    type HistoryArgs = Parameters<History["pushState"]>;

    const patch = (name: HistoryMethod) => {
      const original = history[name].bind(history);
      const wrapped = (...args: HistoryArgs) => {
        // Resolve any still-open transition before starting a new one.
        resolvePending();
        if (media.matches) {
          original(...args);
          return;
        }
        document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              finish.current = resolve;
              // Fallback: if the route doesn't change (or the effect is missed),
              // don't strand the transition.
              window.setTimeout(resolvePending, 250);
            }),
        );
        original(...args);
      };
      history[name] = wrapped;
      return () => {
        history[name] = original;
      };
    };

    const restore = [patch("pushState"), patch("replaceState")];
    return () => {
      restore.forEach((fn) => fn());
      resolvePending();
    };
  }, []);

  // Runs after React commits the new route, so the transition captures the new
  // DOM as its "after" state.
  useEffect(() => {
    if (finish.current) {
      finish.current();
      finish.current = null;
    }
  }, [pathname]);

  return null;
}
