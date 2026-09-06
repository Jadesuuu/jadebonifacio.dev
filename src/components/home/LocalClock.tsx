"use client";

import { useEffect, useState } from "react";

// 24-hour Manila time, refreshed every 30s. Formatter built once.
const fmt = new Intl.DateTimeFormat("en-PH", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Manila",
});

/**
 * The live "manila · HH:MM" clock used in the hero and footer. Renders empty on
 * the server and on first client paint (so there's no hydration mismatch), then
 * fills in and ticks. suppressHydrationWarning guards the one text node.
 */
export function LocalClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return <span suppressHydrationWarning>{time}</span>;
}
