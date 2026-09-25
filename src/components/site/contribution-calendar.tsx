"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { ActivityDay } from "@/integrations/types";
import {
  CONTRIBUTION_WEEKDAYS,
  createContributionCalendar,
  formatContributionDate,
  moveContributionCalendarIndex,
} from "./contribution-calendar-model";

function contributionCountLabel(count: number) {
  if (count === 0) return "No contributions";
  return `${count} ${count === 1 ? "contribution" : "contributions"}`;
}

function activityLevel(count: number) {
  if (count >= 4) return "4";
  if (count >= 3) return "3";
  if (count >= 2) return "2";
  if (count >= 1) return "1";
  return "0";
}

export function ContributionCalendar({ activity, label }: { activity: ActivityDay[]; label: string }) {
  const calendar = createContributionCalendar(activity);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dayButtons = useRef(new Map<string, HTMLButtonElement>());

  if (!calendar) return null;
  const readyCalendar = calendar;

  const selectedDay = calendar.days[selectedIndex];
  const lastDay = calendar.days[calendar.days.length - 1];
  const rangeStart = formatContributionDate(calendar.days[0].date, { month: "short", year: "numeric" });
  const rangeEnd = formatContributionDate(lastDay.date, { month: "short", year: "numeric" });
  const dayIndexes = new Map(calendar.days.map((day, index) => [day.date, index]));

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const nextIndex = moveContributionCalendarIndex(readyCalendar, index, event.key);
    if (nextIndex === null) return;

    event.preventDefault();
    setSelectedIndex(nextIndex);
    const nextDay = readyCalendar.days[nextIndex];
    const nextButton = dayButtons.current.get(nextDay.date);
    nextButton?.focus({ preventScroll: true });
    nextButton?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function selectWithPointer(event: PointerEvent<HTMLButtonElement>, index: number) {
    if (event.pointerType !== "touch") setSelectedIndex(index);
  }

  return (
    <div className="contribution-calendar">
      <div className="contribution-calendar-heading">
        <span>{rangeStart} – {rangeEnd}</span>
        <span>Past 365 days</span>
      </div>
      <div
        className="contribution-calendar-viewport"
        role="region"
        aria-label={`${label}, from ${formatContributionDate(calendar.days[0].date)} to ${formatContributionDate(lastDay.date)}. Scroll sideways to explore the year.`}
        tabIndex={0}
      >
        <div className="contribution-calendar-grid" style={{ "--week-count": calendar.weekCount } as CSSProperties}>
          <div className="contribution-months" aria-hidden="true">
            <span />
            {calendar.monthLabels.map(({ column, label: month }) => (
              <span key={`${column}-${month}`} style={{ gridColumn: column + 2 }}>{month}</span>
            ))}
          </div>
          <div
            className="contribution-days"
            role="grid"
            aria-label={`${label} by day`}
            aria-rowcount={7}
            aria-colcount={calendar.weekCount + 1}
            aria-describedby="contribution-calendar-instructions"
          >
            {calendar.rows.map((weekdays, weekday) => (
              <div className="contribution-weekday-row" role="row" key={CONTRIBUTION_WEEKDAYS[weekday]}>
                <span className="contribution-weekday-label" role="rowheader" aria-label={CONTRIBUTION_WEEKDAYS[weekday]}>
                  {CONTRIBUTION_WEEKDAYS[weekday].slice(0, 3)}
                </span>
                {weekdays.map((day, week) => {
                  if (!day) return <span className="contribution-day-empty" role="gridcell" aria-disabled="true" key={week} />;

                  const index = dayIndexes.get(day.date)!;
                  const selected = index === selectedIndex;
                  const count = contributionCountLabel(day.count);

                  return (
                    <span className="contribution-day-cell" role="gridcell" key={day.date}>
                      <button
                        ref={(element) => {
                          if (element) dayButtons.current.set(day.date, element);
                          else dayButtons.current.delete(day.date);
                        }}
                        className="contribution-day"
                        type="button"
                        data-level={activityLevel(day.count)}
                        aria-label={`${formatContributionDate(day.date, { weekday: "long" })}: ${count}`}
                        aria-current={selected ? "date" : undefined}
                        tabIndex={selected ? 0 : -1}
                        onPointerEnter={(event) => selectWithPointer(event, index)}
                        onFocus={() => setSelectedIndex(index)}
                        onClick={() => setSelectedIndex(index)}
                        onKeyDown={(event) => moveFocus(event, index)}
                      />
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="contribution-calendar-instructions" id="contribution-calendar-instructions">
        Scroll across the year. Focus a day and use the arrow keys to explore it.
      </p>
      <div className="contribution-calendar-footer">
        <div className="contribution-day-detail" aria-label="Selected day">
          <span className="contribution-day-swatch" data-level={activityLevel(selectedDay.count)} aria-hidden="true" />
          <span><time dateTime={selectedDay.date}>{formatContributionDate(selectedDay.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</time> · {contributionCountLabel(selectedDay.count)}</span>
        </div>
        <div className="contribution-calendar-legend" aria-label="Contribution count scale">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={String(level)} aria-hidden="true" />)}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
