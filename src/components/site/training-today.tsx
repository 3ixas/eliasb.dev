"use client";

import { useSyncExternalStore } from "react";
import { ZoomableImage } from "@/components/site/zoomable-image";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { londonWeekday } from "@/integrations/london-time";

const { days, week, title, photo, photoCaption } = offTheClock.training;

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
 * Off the clock's first nested stone row (DESIGN.md "The homepage, in order" 6, R-50): "Today's workout", showing today's
 * full session over a calm, static 7-day schedule of compact cues (`Mon · Upper` … `Sun · Bike`) with today marked, beside
 * the Central London running photo wired to the shared `ZoomableImage` lightbox. Until the day is known (or with no script)
 * nothing is marked as today while the full 7-day week stays visible; the invisible sizer holds today's line height so
 * filling it in moves nothing.
 */
export function TrainingCell({ now }: { now?: string }) {
  const today = useWeekday(now);
  return (
    <div className="otc__section otc__training" data-otc="training">
      <h3 className="otc__title">{title}</h3>
      <div className="otc__training-body">
        <div className="otc__training-main">
          <p className="otc__today">
            <span className="otc__today-sizer" aria-hidden="true">
              {longest}
            </span>
            <span>{today === null ? "" : days[today].session}</span>
          </p>
          <ol className="otc__week" aria-label={week}>
            {days.map((day, index) => (
              <li key={day.short} className="otc__day" data-today={today === index ? "" : undefined} aria-current={today === index ? "date" : undefined}>
                <span className="otc__week-day" aria-hidden="true">
                  {day.short}
                </span>
                <span className="otc__week-cue" aria-hidden="true">
                  {day.cue}
                </span>
                <span className="sr-only">{`${day.long}: ${day.session}`}</span>
              </li>
            ))}
          </ol>
        </div>
        <figure className="otc__run-photo">
          <ZoomableImage
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="(min-width: 720px) 156px, calc(100vw - 112px)"
          />
          <figcaption className="otc__run-caption">{photoCaption}</figcaption>
        </figure>
      </div>
    </div>
  );
}
