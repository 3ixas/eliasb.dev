"use client";

import Image from "next/image";
import { useSyncExternalStore, type CSSProperties } from "react";
import { CalendarTile } from "@/components/quiet/calendar-tile";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { londonDayOfMonth, londonWeekday } from "@/integrations/signal-mappers";

const { days, photo, photoCaption, week, rowLine } = offTheClock.training;

function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

/**
 * Today in London: the weekday counting from Monday (0) and the day of the month. The page is cached, so the
 * server never knows which day a visitor sees it on: the server and the first browser render know nothing, and
 * today is filled in after. `fixed` pins the moment for the fixtures route, so server and browser agree and
 * nothing waits. The snapshot is a string so that an unchanged day is the same value.
 */
function useToday(fixed?: string) {
  const at = fixed ? new Date(fixed) : null;
  const key = (moment?: Date) => `${londonWeekday(moment)}:${londonDayOfMonth(moment)}`;
  const snapshot = useSyncExternalStore(
    subscribe,
    () => (at ? key(at) : key()),
    () => (at ? key(at) : null),
  );
  if (!snapshot) return null;
  const [weekday, date] = snapshot.split(":").map(Number);
  return { weekday, date };
}

/** The training row's object: today's date on a calendar tile whose band is cobalt. */
export function TrainingTile({ now }: { now?: string }) {
  const today = useToday(now);
  return <CalendarTile number={today ? String(today.date) : ""} today />;
}

/** The training row's title: today's session, or the plan's name until the day is known. */
export function TrainingTitle({ now }: { now?: string }) {
  const today = useToday(now);
  return today ? days[today.weekday].session : week;
}

/** The training row's line, in step with its title: there is none until the day is known. */
export function TrainingLine({ now }: { now?: string }) {
  return useToday(now) ? rowLine : null;
}

/** The training week's closer look: the run, then the week filling in one day at a time, today last and in cobalt. */
export function TrainingLook({ now }: { now?: string }) {
  const today = useToday(now);
  return (
    <div className="qi-week">
      <figure className="qi-week__photo">
        <Image src={photo.src} alt="" width={photo.width} height={photo.height} sizes="300px" />
        <figcaption className="stretch-mono">{photoCaption}</figcaption>
      </figure>
      <ol className="qi-week__days">
        {days.map((day, index) => (
          <li key={day.short} style={{ "--i": index } as CSSProperties} data-today={today?.weekday === index ? "" : undefined} aria-current={today?.weekday === index ? "date" : undefined}>
            <span className="stretch-mono" aria-hidden="true">
              {day.short}
            </span>
            {day.session}
          </li>
        ))}
      </ol>
    </div>
  );
}
