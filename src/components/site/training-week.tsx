"use client";

import { useSyncExternalStore } from "react";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { londonWeekday } from "@/integrations/signal-mappers";

const { days, today: todayLabel } = offTheClock.training;

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

/**
 * The training week as a ruled list of seven days, with today marked in cobalt.
 * Today is the day in London, counting from Monday (0). The page is cached, so
 * the server never knows which day a visitor sees it on: the server and the
 * first browser render mark no day, then today is marked. `now` fixes the
 * moment for the fixtures route, so server and browser agree and nothing waits.
 * On phones the day is also set large in a card above the list.
 */
export function TrainingWeek({ now }: { now?: string }) {
  const fixed = now ? londonWeekday(new Date(now)) : null;
  const today = useSyncExternalStore(
    subscribe,
    () => fixed ?? londonWeekday(),
    () => fixed,
  );

  return (
    <div className="stretch-week" data-today-known={today === null ? undefined : ""}>
      <div className="stretch-week__today" aria-hidden="true">
        {today !== null && (
          <>
            <p className="stretch-mono stretch-week__today-label">{todayLabel}</p>
            <p className="stretch-display stretch-week__today-day">{days[today].long}</p>
            <p className="stretch-week__today-session">{days[today].session}</p>
          </>
        )}
      </div>
      <ol className="stretch-week__days">
        {days.map((day, index) => (
          <li key={day.short} className="stretch-week__day" data-today={index === today ? "" : undefined} aria-current={index === today ? "date" : undefined}>
            <span className="stretch-mono stretch-week__short" aria-hidden="true">
              {day.short}
            </span>
            <span className="sr-only">{day.long}: </span>
            <span className="stretch-week__session">{day.session}</span>
            {index === today && <span className="stretch-mono stretch-week__tag">{todayLabel}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
