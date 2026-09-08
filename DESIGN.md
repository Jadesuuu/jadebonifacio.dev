# DESIGN.md — jadebonifacio.dev

How this site looks and moves. The **Claude Design project is the source of truth**; this file is the written-down version of it for people and tools that can't open the canvas.

## Source of truth

- Design project: https://claude.ai/design/p/8b21612c-5b28-4d38-b22a-c8b2400c974b
- Files that matter: `Portfolio Home v2.dc.html` (the home page, current), `404.dc.html`, `JF and The World.dc.html` (case study), `Work Loading Skeleton.dc.html`, `Logo Options.dc.html`. `Portfolio Home.dc.html` is the retired v1 home.
- Local copies live in the git-ignored `design-reference/` folder. Refresh them with DesignSync `get_file` before porting a change.
- Rules: the Claude Design canvas wins over this file, and this file wins over the code. When the canvas changes, update this file in the same PR as the port. Only tokens and copy are allowed to drift from the canvas, and only if this file says so.
- The design is a static HTML canvas. The site is Next.js. Port behaviour and layout, not markup: tokens become CSS variables, inline styles become Tailwind utilities or `v2-*` classes in `globals.css`, canvas scripts become client components under `src/components/home/`.

## Principles

1. The work is the visual interest. The site stays out of the way.
2. Quiet by default, then a few deliberate set pieces per page (home v2 has five: the constellation background, the hero glow, the about particle cloud, the story cursor glow, the toolbox spotlight; case studies have the constellation only, fainter). Nothing else moves on its own.
3. Feels expensive: perfect spacing, fast, no jank, works in both themes.
4. Motion is short, ease-out, respects `prefers-reduced-motion`, and pauses while off-screen. Ambient effects (glow, particle cloud, spotlight) are the exception to "runs once" and must be cheap: one `requestAnimationFrame` loop each, gated by an `IntersectionObserver`.

## Layout

- Home v2: a single long page in a `1080px` shell, `24px` horizontal padding on mobile and `32px` on desktop. Each section is `128px` below the previous one (`pt-32`). Text blocks inside a section cap at `820px` or `56ch`.
- Inner pages (`/about`, `/work/*`): the narrower `680px` column, left-aligned and centred. Images and code blocks may break out to `840px` on desktop.
- Vertical rhythm in multiples of `8px`, with `4px` allowed inside chips and tiles.
- Cards are allowed on the home page where the canvas has them: work cards, timeline cards, the contact block, toolbox tiles, the after-hours bento. Radii: `14px` tiles and bento, `16px` cards and the contact block, `999px` chips, `6px` inline images.
- Breakpoint: one, at `840px`. Grids collapse to a single column below it (the bento goes to two).
- The page background is painted by `html` alone. `body` and page wrappers stay transparent so the fixed constellation canvas (`z-index: -1`) shows through; only cards, tiles, chips, the nav and the contact block paint their own surface.

## Color

Dark is the default theme. Defined as CSS custom properties on `:root` (dark) and `[data-theme="light"]`. Components use the variables only, never raw hex. The one exception is a tool's brand colour, set as `--brand` on a toolbox tile.

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--bg` | `#0E0E0F` | `#F4F2EC` | page background, tiles, chips |
| `--bg-subtle` | `#18181A` | `#EAE7DF` | cards, code blocks, image placeholders, contact block |
| `--fg` | `#ECEAE4` | `#1A1917` | primary text |
| `--fg-muted` | `#9A9890` | `#66645E` | secondary text, descriptions, chip text |
| `--fg-faint` | `#7D7C78` | `#706E68` | metadata, row labels, tile notes. Meets AA (4.5:1) on `--bg` in both themes |
| `--border` | `#232325` | `#DDD9CF` | hairline rules, card and chip borders |
| `--accent` | `#C9A961` | `#9C7C3A` | brass. Section labels, heading full stops, hover borders, focus ring, callout border, toggle thumb, the four set pieces, 404 |
| `--fg-on-accent` | `#0E0E0F` | `#0E0E0F` | text on brass: the 404 page, the "peak radiant" pill, the case-study primary pill |

Rules:
- Brass is rare at rest. Static brass is limited to: section labels, the full stop at the end of each serif heading, one highlighted word in a chip (`radiant`), the theme toggle thumb, the callout border, the "peak radiant" pill, the primary pill in a case-study header, and the 404 page.
- Brass may move. The set pieces use it transiently: the hero and story glows, about a fifth of the constellation dots, about a quarter of the particle-cloud dots and their hairlines, and the toolbox spotlight (borders warm toward brass, big tiles get a brass radial highlight). Hover states may go to brass (buttons, tiles, underlines). Warmed borders are mixed with `color-mix(in oklab, ...)`, never a second brass hex.
- Never brighten the brass toward yellow. If it reads as "gold," it's too saturated.
- Gradients only as soft radial light (glows, the spotlight highlight), never as fills or text. No shadows, no glassmorphism, no grain. The nav's scrolled state may use a translucent `--bg` mix.
- Light theme: glows use `mix-blend-mode: multiply`.
- Both themes must pass WCAG AA for body text.

## Typography

Fonts via `next/font`: **Geist Sans** for UI and body, **Geist Mono** for metadata, labels, chips and code, **Instrument Serif** (regular and italic) for home v2 display headings only.

| Role | Font | Size / line-height | Weight |
|---|---|---|---|
| Home hero headline | Serif italic | `clamp(40px, 6vw, 72px) / 1.05` | 400 |
| Home section heading (H2) | Serif italic | `clamp(34px, 4.5vw, 50px) / 1.1` | 400 |
| H1 (case study, about) | Sans | `32px / 1.2` | 500 |
| H2 (inner pages) | Sans | `22px / 1.3` | 500 |
| H3 | Sans | `18px / 1.4` | 500 |
| Body | Sans | `16–17px / 1.6–1.65` | 400 |
| Small | Sans | `15px / 1.5` | 400 |
| Section label | Mono | `13px / 1.5`, `0.02em` | 400 |
| Row label (`in-game`, `also in rotation`) | Mono | `12px`, `0.04em` | 400 |
| Chip, tile name | Mono | `13–13.5px` | 400 |
| Tile note, tile index | Mono | `11px` / `10px`, index `0.06em` | 400 |
| Code | Mono | `14px / 1.6` | 400 |

Rules:
- Two weights only: 400 and 500. Never 600 or 700. The serif is always 400.
- Every serif heading ends in a brass full stop: `What I reach for<span class="text-accent">.</span>`.
- Sentence case everywhere. Section and row labels are lowercase mono. Chips and tile names are lowercase.
- Letter-spacing: `-0.01em` on sans display and H1, `0` elsewhere, mono labels as in the table.
- Links in body text: `--fg` with a `1px` underline in `--border`; on hover the underline turns `--accent`.

## Home v2 components

Sections, in order. Each starts with a section label, then a serif heading.

**Constellation background** — A fixed canvas behind the whole page: 55–120 dots sized to the viewport (about a fifth brass, the rest `--fg-faint`), each with a depth `z` in `0.15–0.85` that sets its size, alpha and parallax. Hidden over the hero; fades in between 30% and 75% of a viewport of scroll. See Motion. Under reduced motion the canvas is empty.

**Nav** — Name (mono, `--fg`) left; links right (mono, `--fg-muted`, hover `--fg`). Theme toggle, then a mono `⌘K` palette hint (desktop only). Sticky, transparent until scrolled, then a translucent `--bg` with a hairline bottom border.

**Hero** — Two columns (`1.15fr / 0.85fr`, stacked below `840px`): serif headline with a typewriter role line and blinking caret, one `--fg-muted` context line, two buttons (filled `--fg` and outlined `--border`), a mono meta line with a pulsing availability dot and the local clock; portrait on the right with a soft brass glow behind it.

**Skills marquee** — One mono strip of the toolbox, duplicated for a seamless `-50%` loop, `55s` linear. Pauses on hover.

**Selected work** — `v2-card`s: `--bg-subtle`, hairline border, `16px` radius, text left and screenshot right. Hover lifts `3px` and warms the border to `--fg-faint`. The NDA project has no image slot. The stack line ends with an `--accent` chip when the project is running somewhere: `· live ↗` on JF & The World (text only, the app is private) and `· live demo ↗` on ScoutBoard, which is an outbound link to the hosted demo. Because of that nested link the card is an `<article>` rather than one big anchor; the "read the case study →" link is stretched over the card with a pseudo-element, and the demo link sits above it.

**The day job, in numbers** — A row of stat tiles. Numbers count up from 0 once when 60% visible (`1300ms`, ease-out cubic).

**About** — Prose left, the particle cloud right: a canvas point cloud (about 520 dots, a quarter brass) that slowly yaws and morphs between a trefoil knot, a shuttlecock, a globe and a mug, each with a mono caption. Hairlines join neighbouring dots and brighten mid-morph. Dots near the pointer are pulled toward it. Draws once and stops under reduced motion.

**Beyond the resume** — Three `v2-card`s in a row, chips underneath.

**Story (timeline)** — A vertical hairline with brass dots; each `tlCard` slides in from below with a small scale as it enters (`600ms`), left for odd and right for even. A large blurred brass glow (`760px`, `blur(90px)`) follows the pointer while it's inside the section.

**Toolbox** — Six core tiles in an `auto-fit, minmax(160px, 1fr)` grid, `12px` gap: `--bg`, hairline border, `14px` radius, `18px 16px 16px` padding, a faint `01…06` index top-right, a `26px` brand-coloured icon, mono name and faint note. Below: row label `also in rotation` and a chip row (`15px` icons), then `languages` and `papers` chip rows with faint suffixes (`jlpt n4`, `'26`). Icons are inline SVG from `simple-icons`; a tool without a mark is a plain chip. The roaming spotlight (see Motion) lives here.

**After hours** — Serif heading, a paragraph with a controller glyph, `in-game` and `irl` chip rows, then a four-up bento (`4/5` tiles, `14px` radius, two-up below `840px`) with mono pills top-left; the Valorant tile's pill is brass with `--fg-on-accent` text.

**Contact** — Two columns inside a `--bg-subtle` block with a `16px` radius: copy plus email/socials left, the form right. Fields: `--bg`, hairline border, `8px` radius, focus border `--accent`.

**Chip (`v2-chip`)** — Inline-flex, mono `13px`, `--fg-muted`, hairline border, `999px` radius, `8px 16px` (toolbox and after-hours use `7px 15px`), `nowrap`.

**Section label** — Mono, `--accent`, `13px`, lowercase, `12px` below.

**Theme toggle** — Pill, `40×22px`, `--border` track, `--accent` thumb. Clicking transitions all colour variables over `300ms`.

**Footer** — Hairline top border. Left: email (mono). Right: resume PDF link (mono). Stacked on mobile.

**Command palette** — Cmd/Ctrl+K. Centred dialog, `--bg`, hairline border, `8px` radius, no shadow. Items: pages, case studies, links, theme. Fuzzy search, keyboard navigable, Escape closes.

**404** — Full-viewport `--accent` background, `--fg-on-accent` text, one line: "nothing here." and a mono link home.

## Inner pages

**Background** — Case-study pages render the constellation background at `ambient={0.55}`, always visible (no hero reveal). The about page has none.

**Case study header** — Mono label in `--accent` (year · type · status), H1, one-sentence summary in `--fg-muted`, meta line of stack, optional scale line, then a button row `20px` below (`10px` gap, wraps). Links are `999px` mono pills, `9px 18px` padding, `13px`, `0.02em`, label followed by ` ↗`: the first link is filled `--accent` with `--fg-on-accent` text (the canvas uses `--bg`, the same value in dark), the rest are ghost pills (`--border` border, `--fg-muted` text; hover border `--accent`, text `--fg`). All pills lift `1px` on hover. A link without a destination (e.g. "live app: private, two users by design") renders as `12px` mono `--fg-faint` text beside the pills. Labels come from the case study frontmatter, so "source" stays "source" where the canvas says "github".

**Case study body** — MDX. Four to six images, each beside the paragraph that mentions it, captions mono `--fg-faint` `13px`. A hero screenshot under the header. Callouts (left `2px` `--accent` border, `--fg-muted` text, `16px` left padding, no background) for one-line lessons. Ends with a "next project →" row.

**Code block** — `--bg-subtle`, `6px` radius, `16px` padding, no border. Shiki, one theme per colour mode: strings `--accent`, keywords `--fg`, comments `--fg-faint`, the rest `--fg-muted`.

**About page** — `680px` column, H1 "About", lowercase mono section labels, no photo, ends with a "next project →" row pointing to `/work/jf-and-the-world`.

**Meta line** — Mono `--fg-faint`, items separated by ` · `.

## Motion

Easing `cubic-bezier(0.2, 0, 0, 1)` (`--ease-out-quiet`) unless noted. Everything below is disabled under `prefers-reduced-motion: reduce`: reveals render visible, counters show their final value, the cloud draws one frame, glows and the spotlight don't start.

| Interaction | Behaviour | Duration |
|---|---|---|
| Page load (home) | Hero fades up `10px` | `400ms` |
| Scroll reveal | Each section child fades in and rises `26px` on entering the viewport (10% visible, `-50px` bottom margin); `data-stagger` groups step their children `70ms` apart, capped at `350ms`; toolbox tiles only fade | `650ms` |
| Timeline card | Rises `30px` from `scale(0.97)` | `600ms` |
| Count-up | 0 → value, ease-out cubic, once | `1300ms` |
| Typewriter | Role line types, deletes, retypes; caret blinks `1.2s` step-end | continuous |
| Marquee | Skills strip scrolls `-50%`, linear, pauses on hover | `55s` loop |
| Hero glow / story glow | Brass radial blur follows the pointer (story) or sits behind the portrait (hero); opacity fades `1100ms` | continuous while in view |
| Particle cloud | Slow yaw; morphs every `3600ms` hold over `1500ms`; pointer pull; pauses off-screen | continuous while in view |
| Constellation background | Dots sway `6px` (`sin(0.3t + phase)`) and scroll at `z ×` page speed, wrapping `70px` past the viewport. Scroll velocity (smoothed `0.12`) wakes the field: dots stretch into streaks up to `110px` along the scroll direction and hairlines join neighbours within `110px` at up to 32% alpha; wake rises at `0.09` and settles at `0.025` per frame. A pointer press sends a ring out to `220px` over `950ms` that pushes dots `4px` and brightens them. Home: alpha `× reveal`; case study: alpha `× 0.55` | continuous |
| Toolbox spotlight | A brass point drifts on a Lissajous path (`sin(0.5t)`, `sin(0.81t + 1.7)`) across the block, or eases toward the pointer (`0.075` per frame) when it is within `30px` of the block. Each tile gets `--g` = smoothstep of `1 - d/175px`: border mixes to 75% brass, chip text to 85% `--fg`, tile lifts `3.5px × --g`, big tiles show a `170px` brass radial at the light's position (16% alpha) and their index turns brass. Pointer following is off on `hover: none` devices | continuous while in view |
| Card hover | Work card lifts `3px`, border to `--fg-faint`; tile border to `--accent` | `200ms` / `150ms` |
| Link hover | Underline colour change | `150ms` |
| Theme toggle | Colour variables transition | `300ms` |
| Page transition | View Transitions API crossfade; project title morphs into the case study H1 | browser default |
| Command palette | Fade + `4px` rise in; fade out | `150ms` |

Never: scroll-jacking, parallax, animated skill bars, or two ambient effects overlapping on screen (sections are `128px` apart so they don't).

## Images

- Screenshots and real photos only, no device frames, no mockup templates.
- Home thumbnails `360×240` (2x for retina), bento tiles cropped to `4/5` with `object-position` set per image, case study images up to `1680px` wide. Screenshots use seeded demo data, never real personal data.
- `next/image` with explicit dimensions. Blur placeholder using `--bg-subtle`. Striped `v2-placeholder` for slots that have no image yet.
- OG image per page via `next/og`: `--bg` background, page title in Geist Sans, name in mono, accent rule.

## Accessibility and performance

- Lighthouse 95+ on all four categories, mobile and desktop.
- Focus rings visible: `2px` `--accent` outline, `2px` offset.
- All interactive elements keyboard reachable; command palette fully operable without a mouse.
- Contrast AA in both themes.
- No layout shift: fonts preloaded via `next/font`, images sized, icons inline.
- Dark is the default for every first visit regardless of `prefers-color-scheme`. Toggle persists to a cookie. Pages are fully static, so a tiny blocking inline script in <head> applies the cookie before first paint; no flash, no per-request server render.
- Ambient effects run one `requestAnimationFrame` loop each, only while on screen, and always clean up in their effect's return. The constellation is always on screen by nature; it skips drawing entirely while faded out.

## Content voice

First person, plain, specific. Short sentences. No buzzwords ("passionate", "leverage", "seamless"). Say what broke and how it was fixed. Admit tradeoffs.
