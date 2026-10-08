"use client";

// No page renders this since the London pin left the Board (#117). It is kept
// for the Stretch header's clock (#120), which should reuse it. Its time-zone
// and hydration check went with the pin; write a new one against the header.

import { useSyncExternalStore } from "react";
import { board } from "@/content/board";

const londonTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** "14:05": the time in London, whatever the visitor's time zone. */
function readLondonTime() {
  return londonTime.format(new Date());
}

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(timer);
}

/**
 * An analogue clock set to London time. The page is cached, so the server
 * never knows the time a visitor sees it: the server and the first render in
 * the browser both draw the face without hands, then the hands appear. That
 * keeps hydration exact. Screen readers hear the time once, not the hands.
 */
export function LondonClock({ className }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, readLondonTime, () => null);
  const [hours, minutes] = time ? time.split(":").map(Number) : [0, 0];

  return (
    <svg
      role="img"
      aria-label={time ? board.london.clockLabel(time) : board.london.clockName}
      data-london-clock={time ?? ""}
      width="96"
      height="96"
      viewBox="0 0 96 96"
      className={className}
    >
      <circle cx="48" cy="48" r="44" fill="var(--clock-rim)" />
      <circle cx="48" cy="48" r="38" fill="var(--clock-face)" />
      <g stroke="var(--clock-rim)" strokeWidth="2" strokeLinecap="round">
        <line x1="48" y1="13" x2="48" y2="19" />
        <line x1="83" y1="48" x2="77" y2="48" />
        <line x1="48" y1="83" x2="48" y2="77" />
        <line x1="13" y1="48" x2="19" y2="48" />
      </g>
      {time && (
        <g stroke="var(--clock-hands)" strokeLinecap="round">
          <line data-hand="hour" x1="48" y1="48" x2="48" y2="28" strokeWidth="3.5" transform={`rotate(${(hours % 12) * 30 + minutes * 0.5} 48 48)`} />
          <line data-hand="minute" x1="48" y1="48" x2="48" y2="18" strokeWidth="2" transform={`rotate(${minutes * 6} 48 48)`} />
        </g>
      )}
      <circle cx="48" cy="48" r="3" fill="var(--accent)" />
    </svg>
  );
}
