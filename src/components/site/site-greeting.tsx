"use client";

import { useSyncExternalStore } from "react";
import { greetingKey, type GreetingKey } from "@/content/stretch/greeting";
import { siteCopy } from "@/content/stretch/site-copy";

/** The greeting for the visitor's own clock; it only changes when the time of day does. */
const readGreeting = (): GreetingKey => greetingKey(new Date().getHours());

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

const longest = Object.values(siteCopy.greeting).reduce((a, b) => (b.length > a.length ? b : a));

/**
 * A greeting from the visitor's time of day. The page is cached, so the server
 * cannot know it: the server and the first browser render say "Hello", then the
 * browser's own clock picks the line. The time never leaves the browser. The
 * pill is as wide as the longest greeting (stretch-shell.css sets it from
 * data-longest), so the swap moves nothing, and it is not a live region, so a
 * change is not announced.
 */
export function SiteGreeting({ className = "" }: { className?: string }) {
  const key = useSyncExternalStore(subscribe, readGreeting, () => "hello" as const);

  return (
    <p className={`stretch-pill stretch-mono ${className}`.trim()} data-greeting={key}>
      <span className="stretch-greeting" data-longest={longest}>
        {siteCopy.greeting[key]}
      </span>
    </p>
  );
}
