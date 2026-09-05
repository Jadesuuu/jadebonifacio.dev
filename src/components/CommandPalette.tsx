"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useCallback, type RefObject } from "react";
import { links, mailto } from "@/content/links";
import { projects } from "@/content/projects";
import { applyTheme } from "@/lib/apply-theme";
import type { Theme } from "@/lib/theme";

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The ⌘K button in the nav. Focus returns here on close when it is visible. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** Whatever was focused before opening (the Nav records it), for focus return
   *  when the trigger is hidden (mobile / keyboard shortcut from the body). */
  lastFocusedRef: RefObject<HTMLElement | null>;
};

/**
 * Cmd/Ctrl+K palette (DESIGN.md, Command palette). cmdk provides fuzzy
 * filtering and listbox semantics; Radix Dialog traps focus, closes on Escape
 * or outside click, and restores focus on close.
 *
 * Motion: 150ms fade + 4px rise on open (globals.css, `.palette`). The close
 * is instant by design. A CSS exit animation makes Radix wait for animationend
 * before unmounting, and a second in-session selection reliably stranded the
 * dialog mounted at data-state="closed"; an instant close unmounts
 * synchronously and cannot stick. No Framer Motion here for the same reason.
 */
export function CommandPalette({
  open,
  onOpenChange,
  triggerRef,
  lastFocusedRef,
}: CommandPaletteProps) {
  const router = useRouter();

  const run = useCallback(
    (action: () => void) => () => {
      onOpenChange(false);
      action();
    },
    [onOpenChange],
  );

  const go = (href: string) => run(() => router.push(href));
  const openExternal = (href: string) =>
    run(() => window.open(href, "_blank", "noopener,noreferrer"));
  const setTheme = (next: Theme) => run(() => applyTheme(next));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="palette-overlay" />
        <Dialog.Content
          className="palette"
          aria-label="Command palette"
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            const trigger = triggerRef.current;
            const target =
              trigger && trigger.offsetParent !== null ? trigger : lastFocusedRef.current;
            target?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Command label="Command palette" loop>
            <Command.Input placeholder="type to search…" />
            <Command.List>
              <Command.Empty>nothing here.</Command.Empty>

              <Command.Group heading="pages">
                <Command.Item value="home" onSelect={go("/")}>
                  Home
                </Command.Item>
                <Command.Item value="about" onSelect={go("/about")}>
                  About
                </Command.Item>
                <Command.Item value="contact" onSelect={go("/#contact")}>
                  Contact
                </Command.Item>
              </Command.Group>

              <Command.Group heading="work">
                {projects.map((project) => (
                  <Command.Item
                    key={project.slug}
                    value={`work ${project.title}`}
                    keywords={project.stack}
                    onSelect={go(`/work/${project.slug}`)}
                  >
                    {project.title}
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Group heading="links">
                <Command.Item value="github" onSelect={openExternal(links.github)}>
                  GitHub <span data-hint="">↗</span>
                </Command.Item>
                <Command.Item value="linkedin" onSelect={openExternal(links.linkedin)}>
                  LinkedIn <span data-hint="">↗</span>
                </Command.Item>
                <Command.Item value="email" onSelect={run(() => window.location.assign(mailto))}>
                  Email <span data-hint="">{links.email}</span>
                </Command.Item>
                <Command.Item
                  value="resume"
                  keywords={["cv", "pdf"]}
                  onSelect={openExternal(links.resume)}
                >
                  Resume <span data-hint="">pdf ↗</span>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="theme">
                <Command.Item value="theme light" onSelect={setTheme("light")}>
                  Light
                </Command.Item>
                <Command.Item value="theme dark" onSelect={setTheme("dark")}>
                  Dark
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
