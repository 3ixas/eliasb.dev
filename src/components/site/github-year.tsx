"use client";

import { useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { CountUp } from "@/components/quiet/count-up";
import {
  contributionLevel,
  contributionTag,
  createContributionCalendar,
  moveContributionCalendarIndex,
} from "@/components/site/contribution-calendar-model";
import { offTheClock } from "@/content/stretch/off-the-clock";
import type { ActivityDay } from "@/integrations/types";

const copy = offTheClock.github;

/** A count with thousands commas, written by the site so server and browser agree in every locale. */
const grouped = (value: number) => String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/**
 * The GitHub year as squares in GitHub's own greens, with today ringed in cobalt. Its total counts up the first
 * time it is on screen. Hover, focus or tap a day to read its count. On phones the grid scrolls sideways inside its
 * own column and opens on today, with its left edge faded. `mark` is the source mark that ends the total's line.
 */
export function GitHubYear({ activity, total, mark }: { activity: ActivityDay[]; total: number; mark?: ReactNode }) {
  const calendar = createContributionCalendar(activity);
  const [selected, setSelected] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const buttons = useRef(new Map<number, HTMLButtonElement>());
  const hintId = useId();

  // Today is the last column, so the far right is where the grid opens.
  useLayoutEffect(() => {
    const element = scroller.current;
    if (element) element.scrollLeft = element.scrollWidth;
  }, [calendar?.weekCount]);

  if (!calendar) return null;
  const { days, weekCount } = calendar;
  const today = days.length - 1;
  const tabStop = selected ?? today;
  const totalText = grouped(total);

  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "Escape") {
      setSelected(null);
      return;
    }
    const next = moveContributionCalendarIndex(calendar!, index, event.key);
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    const button = buttons.current.get(next);
    button?.focus({ preventScroll: true });
    button?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  return (
    <>
      <p className="stretch-gh__total">
        <span className="stretch-gh__count">
          <CountUp from={0} to={total} format={grouped} whenSeen />
        </span>{" "}
        {copy.contributions(totalText).slice(totalText.length + 1)}
        {mark && <>{"\u00a0· "}{mark}</>}
      </p>
      <p className="stretch-mono stretch-gh__readout" aria-hidden="true" data-readout>
        {selected === null ? " " : contributionTag(days[selected])}
      </p>
      <div ref={scroller} className="stretch-gh__scroll" data-github-scroll>
        <div className="stretch-gh__sheet" style={{ "--weeks": weekCount } as CSSProperties}>
          <div className="stretch-gh__months stretch-mono" aria-hidden="true">
            {calendar.monthLabels.map(({ column, label, row, span }) => (
              <span key={`${column}-${label}`} style={{ gridColumn: `${column + 1} / span ${span}`, gridRow: row + 1 }}>
                {label}
              </span>
            ))}
          </div>
          <div
            role="group"
            aria-label={copy.name(totalText)}
            aria-describedby={hintId}
            className="stretch-gh__days"
            data-github-days
          >
            {Array.from({ length: calendar.startWeekday }, (_, gap) => (
              <span key={`gap-${gap}`} aria-hidden="true" />
            ))}
            {days.map((day, index) => (
              <button
                key={day.date}
                ref={(element) => {
                  if (element) buttons.current.set(index, element);
                  else buttons.current.delete(index);
                }}
                type="button"
                className="stretch-gh__day"
                data-level={contributionLevel(day.count)}
                data-today={index === today ? "" : undefined}
                data-selected={selected === index || undefined}
                aria-label={contributionTag(day)}
                aria-current={index === today ? "date" : undefined}
                tabIndex={index === tabStop ? 0 : -1}
                onPointerEnter={(event) => event.pointerType === "mouse" && setSelected(index)}
                onFocus={() => setSelected(index)}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => move(event, index)}
              />
            ))}
          </div>
        </div>
      </div>
      <p id={hintId} className="sr-only">
        {copy.keys}
      </p>
      <div className="stretch-gh__foot stretch-mono" aria-hidden="true">
        <span className="stretch-gh__legend">
          {copy.legend.less}
          {[0, 1, 2, 3, 4].map((level) => (
            <i key={level} className="stretch-gh__day" data-level={level} />
          ))}
          {copy.legend.more}
          <i className="stretch-gh__day" data-today="" />
          {copy.legend.today}
        </span>
      </div>
    </>
  );
}
