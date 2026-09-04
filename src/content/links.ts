/** Every external destination, defined once. Nothing else hard-codes a URL. */
export const links = {
  github: "https://github.com/Jadesuuu",
  linkedin: "https://www.linkedin.com/in/jade-mark-angelo-bonifacio-169b95288/",
  email: "jade@jadebonifacio.dev",
  /** Served from public/. Always opened in a new tab. */
  resume: "/resume.pdf",
  repos: {
    jfAndTheWorld: "https://github.com/Jadesuuu/jf-and-the-world",
    scoutboard: "https://github.com/Jadesuuu/scoutboard",
    httpMonitor: "https://github.com/Jadesuuu/http-monitor",
    site: "https://github.com/Jadesuuu/jadebonifacio.dev",
  },
} as const;

export const mailto = `mailto:${links.email}`;
