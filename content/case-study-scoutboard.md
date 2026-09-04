# ScoutBoard

**A realtime marketplace for buying and selling small businesses, built in three weeks of evenings.**
Public repo · CI green · NestJS · MongoDB · Redis · Socket.IO · Next.js App Router · TanStack Query · OpenAI

---

## Why I built it

ScoutBoard is a marketplace where small businesses are listed for sale and buyers make offers on them, with the offers landing in realtime. It's the most complete backend I've built: caching with real invalidation rules, a message-driven realtime layer, an AI endpoint that returns structured data, and tests that run in CI.

The reason it exists is specific. I was preparing for a second-round interview at a startup in exactly this domain, and their feedback from my first round, months earlier, was that I needed deeper familiarity with their stack: NestJS, MongoDB, Redis, Socket.IO, TanStack, OpenAI. Reading docs wasn't going to close that gap, so I gave myself five evenings to build something real on that stack and to make every architectural decision one I could defend out loud.

The interview didn't go anywhere. The project did. Every pattern in it is one I can now explain from experience rather than from a tutorial.

## What it does

- Businesses are listed with price, industry, and financials; buyers submit offers
- A sortable, filterable listings table with live offer counts
- Listing detail pages where new offers appear in realtime, no refresh — open two windows, post an offer in one, watch it land in the other
- An AI listing analyst: one endpoint that returns a structured verdict on a listing — fair-value range, reasoning, a suggested offer — as JSON, cached per listing
- A market simulator that generates random offers on a schedule, so the realtime layer has something to show

## Architecture

**pnpm monorepo**, backend and frontend as separate workspaces.

**NestJS backend** with Listings and Offers as separate modules. Offers reference Listings by ObjectId. Every DTO goes through a global `ValidationPipe` with `forbidNonWhitelisted`, so unexpected fields are rejected rather than silently dropped. Cross-module wiring — Offers needing to bump a counter on Listings — was my first real encounter with NestJS's module boundaries and exports.

**MongoDB** for listings and offers. The offer count on each listing is denormalized and maintained with `$inc` on every write, so the listings table doesn't need a join or a count query per row. Denormalized counters drift, so a reconciliation cron recomputes them from the source of truth.

**Redis** in two roles: a cache-aside layer over listing reads, invalidated on every write path (create listing, create offer), and an atomic counter for per-listing view counts and per-key rate limiting on the offers endpoint.

**Socket.IO**, two gateways: one for listings, one for offers. On the frontend, events are pushed directly into TanStack Query's cache with `setQueryData`, so the realtime update and the fetched data share one source of truth and the UI doesn't need a second state layer.

**Next.js App Router frontend** with TanStack Query and TanStack Table, shadcn/ui components.

**OpenAI integration** behind a provider-agnostic wrapper: base URL, model, and key come from environment variables, so swapping to another provider is a config change. The analyst prompt asks for strict JSON and the response is validated before it's cached.

**Jest** on the Offers service with mocked dependencies, and **GitHub Actions** running tests, lint, and coverage on every push.

## Hard parts

**Cache invalidation is asymmetric.** Invalidating the listings cache when a listing is created is obvious. Invalidating it when an *offer* is created is not, but the listings table shows offer counts, so a stale cache means a stale count. The rule I landed on: invalidate what you can key, expire what you can't.

**Realtime and fetched data fighting.** Early on, a socket-pushed offer would arrive but not render, because the UI gated the offers list on `offersCount > 0` from the fetched listing, which hadn't refetched yet. The fix was to trust the cache as the single source and stop deriving render conditions from a separate, slower field. *[Confirm this is how you remember it.]*

**Denormalized counters lie eventually.** `$inc` is atomic, but a failed request after the offer write and before the increment leaves the count wrong forever. The reconciliation cron exists because I'd rather correct drift on a schedule than pretend it can't happen.

## What I'd change

- **It's not deployed.** I cut deployment for time. That's the first thing I'd fix — a backend project nobody can hit is only half a demo.
- **Denormalized counter plus reconciliation cron** is the pragmatic answer. The correct one is a transactional outbox or a proper event pipeline, which is more infrastructure than the project justified.
- **Two Socket.IO gateways only work on one instance.** Scaling horizontally needs the Redis pub/sub adapter so events fan out across servers.
- **Tests cover the service layer, not the gateways or the frontend.** Enough for CI to mean something, not enough to refactor fearlessly.
- **No create-listing form.** Listings are seeded. A deliberate scope cut, but it means the app is read-heavy in a way a real marketplace wouldn't be.

## Links

- Source: [GitHub link]
- Companion project: HTTP Monitor — a NestJS cron-based endpoint monitor with the same Redis/Socket.IO/OpenAI patterns, built as a rebuild of the same company's take-home. [GitHub link]
