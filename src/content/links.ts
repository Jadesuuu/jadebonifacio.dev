/** Every external destination, defined once. Nothing else hard-codes a URL. */
export const links = {
  github: "https://github.com/Jadesuuu",
  linkedin: "https://www.linkedin.com/in/jade-mark-angelo-bonifacio-169b95288/",
  email: "jade@jadebonifacio.dev",
  /** Served from public/. Always opened in a new tab. */
  resume: "/resume.pdf",
  repos: {
    budget: "https://github.com/Jadesuuu/budget-app",
    reel: "https://github.com/Jadesuuu/Reel",
    jfAndTheWorld: "https://github.com/Jadesuuu/jf-and-the-world",
    scoutboard: "https://github.com/Jadesuuu/scoutboard",
    httpMonitor: "https://github.com/Jadesuuu/http-monitor",
    site: "https://github.com/Jadesuuu/jadebonifacio.dev",
  },
  /** Hosted demos, when a project has one. */
  demos: {
    /** The demo build: the same interface answering its own API calls in the browser. */
    reel: "https://reel.jadebonifacio.dev",
    /** The demo build: real migrations in an in-process Postgres, synthetic data, no sign-in. */
    budget: "https://budgetdemo.jadebonifacio.dev",
    jfAndTheWorld: "https://jfdemo.jadebonifacio.dev",
    scoutboard: "https://scoutboard.jadebonifacio.dev",
  },
} as const;

export const mailto = `mailto:${links.email}`;
