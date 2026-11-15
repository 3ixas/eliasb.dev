"use client";

import { useSyncExternalStore } from "react";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { londonWeekday } from "@/integrations/signal-mappers";

const { days, week, title } = offTheClock.training;

/** The longest session, which an invisible copy holds the line's height to: wrapped at a phone's width it is the tallest. */
const longest = days.reduce((a, b) => (b.session.length > a.length ? b.session : a), "");

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

/**
 * Today's weekday in London, counting from Monday (0). The page is cached, so the server never knows which day a visitor
 * sees it on: the server and the first browser render know nothing, and today is filled in after. `fixed` pins the moment
 * for the fixtures route, so server and browser agree and nothing waits.
 */
function useWeekday(fixed?: string) {
  return useSyncExternalStore(
    subscribe,
    () => londonWeekday(fixed ? new Date(fixed) : undefined),
    () => (fixed ? londonWeekday(new Date(fixed)) : null),
  );
}

/**
 * Off the clock's first section (R-19), "Today's workout": today's session large, and the whole week as seven rows with
 * today marked. Until the day is known (or with no script) the week is all of it, which is still a complete section; the
 * session's line holds the height of the longest session at the current width, so filling it in moves nothing.
 */
export function TrainingCell({ now }: { now?: string }) {
  const today = useWeekday(now);
  return (
    <div className="otc__section otc__training" data-otc="training">
      <h3 className="otc__title">{title}</h3>
      <p className="otc__today">
        <span className="otc__today-sizer" aria-hidden="true">
          {longest}
        </span>
        <span>{today === null ? "" : days[today].session}</span>
      </p>
      <ol className="otc__week" aria-label={week}>
        {days.map((day, index) => (
          <li key={day.short} data-today={today === index ? "" : undefined} aria-current={today === index ? "date" : undefined}>
            <span aria-hidden="true">{day.short}</span>
            <span className="sr-only">{day.long}: </span>
            <span>{day.session}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
