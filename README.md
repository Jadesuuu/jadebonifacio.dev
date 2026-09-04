# jadebonifacio.dev

Personal site and portfolio of Jade Bonifacio, a full-stack developer in the Philippines. A homepage with selected work, an about page, and one case study per project: what it does, what broke, and how it was fixed.

Live at [jadebonifacio.dev](https://jadebonifacio.dev).

## Stack

- [Next.js 15](https://nextjs.org) (App Router, TypeScript) on [Vercel](https://vercel.com)
- [Tailwind CSS v4](https://tailwindcss.com), tokens defined once in `src/app/globals.css`
- [Framer Motion](https://www.framer.com/motion/) for the one entrance animation
- [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) for case studies
- Geist Sans and Geist Mono via `next/font`
- No component library

## Run it locally

Requires Node 20+ and [pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # production build
pnpm lint
```

## Design

Every visual decision follows [`DESIGN.md`](./DESIGN.md): colour tokens, type scale, spacing, motion, and the rules for when the brass accent may appear. If a change disagrees with that file, the file is updated first, then the code.

## Layout of the repo

```
content/          case studies as markdown
src/app/          routes, global CSS, generated favicon
src/components/   small UI pieces (Nav, Footer, ProjectRow, ThemeToggle, ...)
src/content/      typed site copy and project data
src/lib/          theme cookie, site config, token helpers
scripts/          make-logo.mjs renders the jb_ mark to public/
public/           static assets, resume, logo
```

The theme is dark by default. The toggle writes a cookie that the root layout reads on the server, so there is no flash of the wrong theme on load.
