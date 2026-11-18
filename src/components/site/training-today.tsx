"use client";

import { useSyncExternalStore } from "react";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { londonWeekday } from "@/integrations/signal-mappers";

const { days, week, title } = offTheClock.training;

/** What kind of session a day is, from its words: the gym, the bike or the rope (#465 round 5, the glyphs). */
const kindOf = (session: string) => (/rope/i.test(session) ? "rope" : /bike/i.test(session) ? "bike" : "gym");

/** A session's glyph, drawn in the text colour: a dumbbell, a bike's two wheels, a skipping rope. A picture of its words. */
function SessionGlyph({ session }: { session: string }) {
  const kind = kindOf(session);
  return (
    <svg className="otc__glyph" viewBox="0 0 24 24" aria-hidden="true" data-kind={kind}>
      {kind === "gym" && (
        <g fill="currentColor">
          <rect x="1.5" y="9" width="2.5" height="6" rx="1" />
          <rect x="4.5" y="6.5" width="3.5" height="11" rx="1.2" />
          <rect x="16" y="6.5" width="3.5" height="11" rx="1.2" />
          <rect x="20" y="9" width="2.5" height="6" rx="1" />
          <rect x="8" y="11" width="8" height="2" rx="1" />
        </g>
      )}
      {kind === "bike" && (
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="16" r="4" />
          <circle cx="18.5" cy="16" r="4" />
          <path d="M5.5 16 10 8.5h6l2.5 7.5M10 8.5 12.5 16h-7M9 6h3" />
        </g>
      )}
      {kind === "rope" && (
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M5 21v-5M19 21v-5" strokeWidth="3" />
          <path d="M5 16C5 1 19 1 19 16" />
        </g>
      )}
    </svg>
  );
}

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
 * Off the clock's first section (R-19, #465), "Today's workout", as a desk calendar's page. Its band holds today's
 * weekday between two rings; its paper holds today's session, large, with the session's glyph; and along its foot runs
 * the week, a glyph and a letter a day with today marked. The week is one list read the same everywhere ("Monday: Upper
 * body gym"): with script it is that strip, each day and its session read but not shown (sr-only); without script it
 * is the week's rows, day and session, since today is not known to mark. The session's line holds the height of the
 * longest session and the glyph's slot is fixed, so filling today in moves nothing.
 */
export function TrainingCell({ now }: { now?: string }) {
  const today = useWeekday(now);
  return (
    <div className="otc__section otc__training" data-otc="training">
      <h3 className="otc__title">{title}</h3>
      <div className="otc__day">
        <div className="otc__day-band" aria-hidden="true">
          <span>{today === null ? "" : days[today].long}</span>
        </div>
        <div className="otc__day-page">
          <span className="otc__day-glyph">{today !== null && <SessionGlyph session={days[today].session} />}</span>
          <p className="otc__today">
            <span className="otc__today-sizer" aria-hidden="true">
              {longest}
            </span>
            <span>{today === null ? "" : days[today].session}</span>
          </p>
          <ol className="otc__week" aria-label={week}>
            {days.map((day, index) => (
              <li key={day.short} data-today={today === index ? "" : undefined} aria-current={today === index ? "date" : undefined}>
                <SessionGlyph session={day.session} />
                <span className="otc__week-letter" aria-hidden="true">
                  {day.short.charAt(0)}
                </span>
                <span className="otc__week-day in-data-script:sr-only">
                  {day.long}
                  <span className="sr-only">: </span>
                </span>
                <span className="otc__week-session in-data-script:sr-only">{day.session}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
