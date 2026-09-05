import type { NextConfig } from "next";

// View transitions are driven by src/components/ViewTransitions.tsx using the
// native View Transitions API, so no experimental Next flag is needed here.
const nextConfig: NextConfig = {
  // Next 15 streams <title>/<meta> into the body for non-bot user agents and
  // only blocks (renders them in <head>) for known crawlers. That left the
  // description out of <head> for browsers and made Lighthouse intermittently
  // report it missing. Treat every user agent as "limited" so metadata is
  // always in <head>. Cheap here: all page metadata is static.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
