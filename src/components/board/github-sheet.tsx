"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import {
  busiestStretch,
  contributionLevel,
  contributionTag,
  createContributionCalendar,
  moveContributionCalendarIndex,
} from "@/components/site/contribution-calendar-model";
import { ExternalLink } from "@/components/board/external-link";
import { board, groupedNumber } from "@/content/board";
import type { ActivityDay } from "@/integrations/types";

/**
 * The GitHub year on graph paper: the total in ink, GitHub's five greens,
 * and a pencil loop round the busiest four weeks. Hover, focus or tap a day
 * to see its count. Every date is written by the site, so the server and the
 * browser render the same text in every locale.
 */
export function GitHubSheet({ activity, total, href }: { activity: ActivityDay[]; total: number; href: string }) {
  const calendar = createContributionCalendar(activity);
  const [selected, setSelected] = useState<number | null>(null);
  const buttons = useRef(new Map<number, HTMLButtonElement>());
  const hintId = useId();
  if (!calendar) return null;

  const { days, weekCount, startWeekday } = calendar;
  const stretch = busiestStretch(calendar);
  const copy = board.github;
  const totalText = groupedNumber(total);
  // The roving tab stop: the selected day, or today.
  const tabStop = selected ?? days.length - 1;
  const at = (index: number) => ({ week: Math.floor((startWeekday + index) / 7), weekday: (startWeekday + index) % 7 });
  const percent = (columns: number) => `${(columns / weekCount) * 100}%`;
  const noteBefore = stretch ? (stretch.column + stretch.span) / weekCount > 0.7 : false;

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
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="board-github-ink m-0 font-mono text-label uppercase">{board.labels.github}</p>
          <p className="m-0 mt-1.5 font-display leading-[0.9]">
            <span className="board-github-total text-display font-medium">{totalText}</span>{" "}
            <span className="text-title text-muted italic">{copy.beside}</span>
          </p>
        </div>
        <div className="flex flex-col items-start gap-2.5 sm:items-end">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="font-mono text-[10px] uppercase text-muted">{copy.legend.quiet}</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <span key={level} data-level={level} className="board-github-day size-3.5 rounded-[3px]" />
            ))}
            <span className="font-mono text-[10px] uppercase text-muted">{copy.legend.busy}</span>
          </div>
          <ExternalLink href={href} className="board-github-ink">{copy.link}</ExternalLink>
        </div>
      </div>

      <div className="board-github-scroll mt-6 overflow-x-auto pb-12" data-github-scroll>
        <div className="relative min-w-[720px]" style={{ "--weeks": weekCount } as CSSProperties}>
          <div aria-hidden="true" className="board-github-months font-mono text-[10.5px] text-muted">
            {calendar.monthLabels.map(({ column, label, row, span }) => (
              <span key={`${column}-${label}`} style={{ gridColumn: `${column + 1} / span ${span}`, gridRow: row + 1 }}>
                {label}
              </span>
            ))}
          </div>
          <div
            role="group"
            aria-label={copy.name(totalText, stretch?.when ?? null)}
            aria-describedby={hintId}
            className="board-github-days relative mt-2"
            data-github-days
          >
            {Array.from({ length: startWeekday }, (_, gap) => (
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
                data-level={contributionLevel(day.count)}
                data-selected={selected === index || undefined}
                aria-label={contributionTag(day)}
                tabIndex={index === tabStop ? 0 : -1}
                className="board-github-day"
                onPointerEnter={(event) => event.pointerType === "mouse" && setSelected(index)}
                onFocus={() => setSelected(index)}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => move(event, index)}
              />
            ))}
            {stretch && (
              <span
                aria-hidden="true"
                data-busiest
                className="board-github-loop"
                style={{ left: percent(stretch.column), width: percent(stretch.span) }}
              />
            )}
            {selected !== null && (
              <DayTag
                text={contributionTag(days[selected])}
                left={percent(at(selected).week + (at(selected).week > weekCount / 2 ? 0 : 1))}
                top={`${(at(selected).weekday / 7) * 100}%`}
                flip={at(selected).week > weekCount / 2}
              />
            )}
          </div>
          {stretch && (
            <p
              aria-hidden="true"
              className="board-pencil absolute m-0 mt-3 whitespace-nowrap"
              style={noteBefore ? { right: `calc(100% - ${percent(stretch.column)} + 12px)` } : { left: `calc(${percent(stretch.column + stretch.span)} + 12px)` }}
            >
              {noteBefore ? copy.stretchBefore(stretch.when) : copy.stretch(stretch.when)}
            </p>
          )}
        </div>
      </div>
      <p id={hintId} className="sr-only">{copy.keys}</p>
      <p aria-hidden="true" className="board-pencil m-0 mt-2 board:hidden">{copy.swipe}</p>
    </>
  );
}

/** A day's count, pencilled on a scrap beside it. */
function DayTag({ text, left, top, flip }: { text: string; left: string; top: string; flip: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-day-tag
      className="board-github-tag pointer-events-none absolute z-10 whitespace-nowrap"
      style={{ left, top, translate: flip ? "calc(-100% - 6px) -25%" : "6px -25%" }}
    >
      {text}
    </span>
  );
}
