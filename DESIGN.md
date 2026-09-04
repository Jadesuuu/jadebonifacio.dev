# DESIGN.md — jadebonifacio.dev

Single source of truth for how this site looks and moves. Every UI change must follow this file. If something here is wrong, change the file first, then the code.

## Principles

1. The work is the visual interest. The site stays out of the way.
2. Quiet by default; a few deliberate, well-made details. No decoration for its own sake.
3. Feels expensive: perfect spacing, fast, no jank, works in both themes.
4. Every animation is short, purposeful, runs once, and respects `prefers-reduced-motion`.

## Layout

- Single content column, max width `680px`, left-aligned, centered on the page.
- Page horizontal padding: `24px` mobile, `32px` desktop.
- Vertical rhythm in multiples of `8px`. Section gaps: `64px` mobile, `96px` desktop.
- No sidebars, no cards on the homepage. Project rows are separated by hairline rules.
- Case study pages use the same column. Images and code blocks may break out to `840px` on desktop.

## Color

Dark is the default theme. Defined as CSS custom properties on `:root` (dark) and `[data-theme="light"]`. Components use the variables only, never raw hex.

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--bg` | `#0E0E0F` | `#F4F2EC` | page background |
| `--bg-subtle` | `#18181A` | `#EAE7DF` | code blocks, image placeholders |
| `--fg` | `#ECEAE4` | `#1A1917` | primary text |
| `--fg-muted` | `#9A9890` | `#66645E` | secondary text, descriptions |
| `--fg-faint` | `#5E5D58` | `#9A978F` | metadata, labels, mono text |
| `--border` | `#232325` | `#DDD9CF` | hairline rules |
| `--accent` | `#C9A961` | `#9C7C3A` | brass. Hover underlines, focus ring, callout border, toggle thumb, 404 |

Rules:
- The accent is rare by design. It appears only on: link hover underlines, focus rings, the callout's left border, the theme toggle thumb, and the 404 page background. Nowhere else. If a screen has brass on it at rest (not hovered), something is wrong.
- Never brighten the brass toward yellow. If it reads as "gold," it's too saturated.
- No gradients, no shadows, no glassmorphism, no grain.
- Both themes must pass WCAG AA for body text.

## Typography

Fonts via `next/font`: **Geist Sans** for UI and body, **Geist Mono** for metadata, labels, and code.

| Role | Font | Size / line-height | Weight |
|---|---|---|---|
| Display (homepage headline) | Sans | `32px / 1.25` mobile, `40px / 1.2` desktop | 500 |
| H1 (case study title) | Sans | `32px / 1.2` | 500 |
| H2 | Sans | `22px / 1.3` | 500 |
| H3 | Sans | `18px / 1.4` | 500 |
| Body | Sans | `17px / 1.65` | 400 |
| Small | Sans | `15px / 1.5` | 400 |
| Meta / label | Mono | `13px / 1.5` | 400 |
| Code | Mono | `14px / 1.6` | 400 |

Rules:
- Two weights only: 400 and 500. Never 600 or 700.
- Sentence case everywhere. Section labels are lowercase mono (`selected work`, `how i work`).
- Letter-spacing: `-0.01em` on display and H1, `0` elsewhere. Mono labels get `0.02em`.
- Max line length for body: the 680px column already enforces ~70–75 characters.
- Links in body text: `--fg` with a `1px` underline in `--border`, on hover the underline turns `--accent`.

## Components

**Nav** — Name (mono, `--fg`) left; links right (mono, `--fg-muted`, hover `--fg`). Theme toggle at far right. Sticky, `--bg` background, no border until scrolled, then hairline bottom border.

**Hero** — Display headline, one line of small `--fg-muted` context, one mono line of tools, one mono line of links. No image. Exact copy:
- Headline: `Full-stack developer. I ship production apps from zero, and fix the ones other people wrote.`
- Context: `Philippines · open to remote startup roles`
- Tools (mono, `--fg-faint`): `typescript · react · next.js · nestjs · node · postgres · mongodb · redis · aws`
- Links (mono, `--fg-muted`): `github · linkedin · email`

**Section label** — Mono, `--fg-faint`, `13px`, `margin-bottom: 16px`.

**Project row** — Grid: text column `1fr`, image `180px` on desktop; stacked on mobile with image first. Top hairline border, `24px` vertical padding. Title `18px/500`, description `15px --fg-muted`, stack line mono `--fg-faint`. Entire row is a link. Image: real screenshot, `border-radius: 6px`, `--bg-subtle` background while loading. A row with no screenshot (the enterprise/NDA project) has no image slot at all; its text spans the full column. Never show a placeholder box.

**How I work** — Section label plus one short paragraph, max four sentences. Current copy: `The day job taught me how to be careful: read before writing, make small defensible changes. Side projects taught me how to ship. What I want now is somewhere I can do both: a smaller team, more ownership, features rather than maintenance.`

**Meta line** — Mono `--fg-faint`, items separated by ` · `.

**Case study header** — Mono label (year · type · status), H1, one-sentence summary in `--fg-muted`, meta line of stack, links row.

**Code block** — `--bg-subtle` background, `6px` radius, `16px` padding, no border. Syntax theme: custom, built from the palette — strings in `--accent`, keywords `--fg`, comments `--fg-faint`, everything else `--fg-muted`. Shiki, one theme per color mode.

**Callout** (case studies) — Left `2px` `--accent` border, `--fg-muted` text, `16px` left padding. No background, no radius.

**Theme toggle** — Pill, `40×22px`, `--border` track, `--accent` thumb. Clicking transitions all color variables over `300ms`.

**Footer** — Hairline top border. Left: email (mono). Right: resume PDF link (mono). Below on mobile.

**Command palette** — Cmd/Ctrl+K. Centered dialog, `--bg`, hairline border, `8px` radius, no shadow. Items: pages, case studies, links, theme. Fuzzy search. Keyboard navigable. Escape closes.

**Currently line** — Deferred. Not in v1. If added later: mono, below the hero, latest public commit from the GitHub API only, ISR hourly. Nothing manually maintained.

**404** — Full-viewport `--accent` background, `#0E0E0F` text in both themes, one line: "nothing here." and a mono link home. The one place brass fills the screen.

**Case study body** — Rendered from MDX. Rules:
- Four to six images per case study, each placed next to the paragraph that mentions it, never grouped in a gallery. Captions in mono `--fg-faint`, `13px`, below the image.
- A hero screenshot directly under the header block, full column width.
- Ends with a "next project →" row (hairline top border, mono label, project title) so no page dead-ends.
- Callouts for the one-line lessons.

**About page** — Same 680px column. H1 "About" (32/500). Sections separated by the standard section gap, each with a lowercase mono section label. No photo. Prose per the body type scale. Ends with the same "next project →" style row, pointing to /work/jf-and-the-world with label "work".

## Motion

All durations short. All easing `cubic-bezier(0.2, 0, 0, 1)` (ease-out) unless noted. Everything disabled under `prefers-reduced-motion: reduce`.

| Interaction | Behavior | Duration |
|---|---|---|
| Page load (home) | Hero, then each section, fades up `8px` with `40ms` stagger; runs once per session | `400ms` total |
| Project row hover | Image rotates `-1.5deg` and scales `1.02`; title underline draws left→right in `--accent` | `200ms` |
| Link hover | Underline color change | `150ms` |
| Theme toggle | Color variables transition | `300ms` |
| Page transition | View Transitions API: crossfade root, project title morphs into case study H1 via shared `view-transition-name` | browser default (~250ms) |
| Command palette | Fade + `4px` rise in; fade out | `150ms` |

Never: scroll-jacking, parallax, cursor effects, typewriter text, looping animations, animated skill bars.

## Images

- Screenshots only, no device frames, no mockup templates.
- Homepage thumbnails `360×240` (2x for retina), case study images up to `1680px` wide. Screenshots are taken against seeded demo data, never real personal data.
- `next/image` with explicit dimensions. Blur placeholder using `--bg-subtle`.
- OG image per page, generated with `next/og`: `--bg` background, page title in Geist Sans, name in mono, accent rule.

## Accessibility and performance

- Lighthouse 95+ on all four categories, mobile and desktop.
- Focus rings visible: `2px` `--accent` outline, `2px` offset.
- All interactive elements keyboard reachable; command palette fully operable without a mouse.
- Contrast AA in both themes.
- No layout shift: fonts preloaded via `next/font`, images sized.
- Dark is the default for every first visit regardless of `prefers-color-scheme`. Toggle persists to a cookie, applied server-side so there is no flash on load.

## Content voice

First person, plain, specific. Short sentences. No buzzwords ("passionate", "leverage", "seamless"). Say what broke and how it was fixed. Admit tradeoffs.
