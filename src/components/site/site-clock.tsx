"use client";

import { useSyncExternalStore } from "react";
import { siteCopy } from "@/content/stretch/site-copy";

const londonTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "14:05": the time in London, whatever the visitor's time zone. */
const readLondonTime = () => londonTime.format(new Date());

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 5_000);
  return () => window.clearInterval(timer);
}

/**
 * The London clock. The page is cached, so the server never knows the time a
 * visitor sees it: the server and the first browser render show only "London",
 * then the time appears. Screen readers hear a full sentence, not the digits
 * on their own.
 */
export function SiteClock({ className = "" }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, readLondonTime, () => null);

  return (
    <p className={`stretch-pill stretch-mono ${className}`.trim()} data-london-clock={time ?? ""}>
      <span aria-hidden="true">{time ? siteCopy.clock.label(time) : "London"}</span>
      {time && <span className="sr-only">{siteCopy.clock.spoken(time)}</span>}
    </p>
  );
}
