# jadebonifacio.dev

The personal site and portfolio of Jade Bonifacio, a full-stack developer in the Philippines. A quiet, dark-by-default homepage with selected work, an about page, and one case study per project that describes what it does, what broke, and how it was fixed. Live at [jadebonifacio.dev](https://jadebonifacio.dev).

## Stack

- [Next.js 15](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com), with the colour tokens defined once in `src/app/globals.css`
- [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) for MDX case studies
- [Framer Motion](https://www.framer.com/motion/) for the homepage entrance animation
- [cmdk](https://cmdk.paco.me) for the Cmd/Ctrl+K command palette
- [Shiki](https://shiki.style) for build-time code highlighting
- Geist Sans and Geist Mono via `next/font`; no component library

## Run locally

Requires Node 20+ and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev        # http://localhost:3000
```

Other scripts: `pnpm build` (production build), `pnpm start` (serve the build), `pnpm lint`.

## Structure

```
src/app/          routes, root and (site) layouts, global CSS, favicon and OG images
src/components/    UI pieces (Nav, Footer, ProjectRow, ThemeToggle, CommandPalette, mdx/*)
src/content/       site data and case-study content
  projects.ts      the three projects shown on the homepage
  links.ts         every external URL, defined once
  work/*.mdx       one case study per project
src/lib/           theme cookie, site config, Shiki themes, token helpers
DESIGN.md          the single source of truth for every visual decision
```

`DESIGN.md` governs colour, type, spacing, motion, and the rules for when the brass accent may appear. If a change disagrees with it, the file is updated first, then the code.

## Content

Case studies live in `src/content/work/` as MDX files with YAML frontmatter. The frontmatter carries the title, year, kind, status, summary, stack, header links, and the next-project slug; the body is prose plus a few components (`Callout`, `Figure`) and fenced code blocks that Shiki highlights at build time. Header links reference `src/content/links.ts` by name rather than hardcoding URLs. Adding a case study means dropping a new `.mdx` file in that folder and adding the matching entry to `projects.ts`.

The theme is dark by default. The toggle writes a cookie that the root layout reads on the server, so the correct theme is applied on the first byte and there is no flash on load.
