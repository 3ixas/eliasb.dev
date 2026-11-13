"use client";

import { useSyncExternalStore } from "react";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { londonWeekday } from "@/integrations/signal-mappers";

const { days, week, rowLine } = offTheClock.training;

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
 * Off the clock's first cell (R-19): the training week as seven days with today marked, then today's session. Until the
 * day is known (or with no script) it is the week and the plan's name, which is still a complete cell.
 */
export function TrainingCell({ now }: { now?: string }) {
  const today = useWeekday(now);
  return (
    <div className="otc__cell otc__training" data-otc="training">
      <ol className="otc__week" aria-label={week}>
        {days.map((day, index) => (
          <li key={day.short} data-today={today === index ? "" : undefined} aria-current={today === index ? "date" : undefined}>
            <span aria-hidden="true">{day.short[0]}</span>
            <span className="sr-only">
              {day.long}: {day.session}
            </span>
          </li>
        ))}
      </ol>
      <h3>{today === null ? week : days[today].session}</h3>
      {today !== null && <p>{rowLine}</p>}
    </div>
  );
}
