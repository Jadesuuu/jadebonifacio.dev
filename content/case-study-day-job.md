# Enterprise platform work — Advanced World Solutions

**Two years shipping into a large, mature codebase I didn't write, for a Japanese client, on a bilingual team.**
Full-time · React · TypeScript · Node · Oracle · AWS · client under NDA

---

## The short version

Side projects show what I can build from zero. This is the other half: working inside a system that's been running for years, with real users depending on it, where every change has to fit code and conventions that predate me.

The client and the specifics are under NDA. What I can describe is the shape of the work.

## What I've worked on

**Legacy port: WinForms to React and Node on Oracle.** A desktop application being rebuilt as a web app, screen by screen, against an Oracle database that stayed put. The hard part isn't the React. It's reading the old code well enough to preserve behavior that nobody documented, deciding when to reproduce a quirk versus fix it, and doing that in a codebase where the answer to "how does this work" is often "ask the person who wrote it years ago" — in Japanese.

**Cross-stack defect work on a real estate management platform.** Bugs that land on my desk don't come labeled frontend or backend. A recent one: file uploads rejecting valid images. The validation logic was checking MIME types, and JPEGs arrive as several variants depending on the source. Tracing that from the user's report through the React upload flow to the validation rule, fixing it without loosening the check for everything else, and writing it up for a team that reads the ticket in a second language — that's a typical week.

**A QR-based parking system with realtime slot monitoring.** Built on AWS SNS and SQS for event fan-out and processing. My first production use of a message queue, and where I learned the difference between a queue and pub/sub by needing both.

**Team tooling on Claude Code.** I use Claude Code daily and have built internal tooling and custom skills around it for the team. Part of the job now is figuring out where AI-assisted development actually saves time in a large legacy codebase and where it confidently makes things worse.

## What the environment taught me

**Working across a language barrier.** The CEO and most of the team communicate in Japanese. I've learned to write tickets, PR descriptions, and questions so they survive translation: short sentences, one idea each, screenshots over prose. It's made me a clearer communicator in English too.

**Reading before writing.** In a codebase this size, the most valuable skill is figuring out how something works before touching it. Most of my time is spent tracing, not typing.

**Small, defensible changes.** Big refactors in a system with years of accumulated behavior break things in ways you find out about a month later. I've learned to make the smallest change that fixes the problem, and to be able to explain exactly why it's safe.

## What I'd want next

This work taught me how to be careful. What I want now is somewhere I can also be fast: a smaller team, more ownership, shipping features rather than maintaining someone else's. That's why I'm looking at startups.
