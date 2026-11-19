"use client";

import Image from "next/image";
import { useState } from "react";
import { offTheClock } from "@/content/stretch/off-the-clock";
import type { HistoryEvent } from "@/integrations/types";

const copy = offTheClock.curiosity;

/**
 * This week in history, full width (R-19): the oddity's picture, large enough to look at (#493), the title, its date and fact, and an outline pill,
 * "1 of 3", that steps to the next in place. The fact is announced politely when it changes; nothing else on the page
 * moves. With no script, or one oddity, the first shows and there is no pill. `dates` are the events' dates as written,
 * in the same order; `source` is the archive's "From the archive" when the week is not live.
 */
export function HistoryBand({ events, dates, source }: { events: HistoryEvent[]; dates: string[]; source?: string }) {
  const [position, setPosition] = useState(0);
  const { image } = events[position];
  const pictured = events.some((event) => event.image);
  /** An oddity's date and fact, and its picture's credit when it has one. */
  const body = (index: number, live = false) => {
    const event = events[index];
    return (
      <>
        <p aria-live={live ? "polite" : undefined}>
          <b>{dates[index]}</b> {event.text}
        </p>
        {event.image && <p className="otc__credit">{`${copy.imageCredit} ${event.image.creator} · ${event.image.licenseName}`}</p>}
      </>
    );
  };
  return (
    <div className="otc__history otc__section" data-otc="history" data-state={source ? "archive" : "live"} data-pictured={pictured ? "" : undefined}>
      <h3 className="otc__title">{copy.label}</h3>
      {/* One frame for every oddity, so stepping moves nothing: the picture, or the year where an oddity has none. */}
      {pictured && (
        <span className="otc__history-image">
          {image ? (
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(min-width: 960px) 280px, (min-width: 720px) 220px, calc(100vw - 76px)" />
          ) : (
            <span className="otc__history-year" aria-hidden="true">
              {events[position].year}
            </span>
          )}
        </span>
      )}
      <div>
        {/*
          Every oddity sits in the same cell, hidden but for the one shown, so the band is as tall as the tallest and
          stepping moves nothing below it. The shown one is the one live region, so the change is announced.
        */}
        <div className="otc__history-text">
          {events.length > 1 &&
            events.map((_, index) => (
              <div key={index} className="otc__history-sizer" aria-hidden="true">
                {body(index)}
              </div>
            ))}
          <div className="otc__history-now">{body(position, true)}</div>
        </div>
        {source && <p className="otc__source">{source}</p>}
      </div>
      {events.length > 1 && (
        <button type="button" className="pill pill--outline otc__step" onClick={() => setPosition((at) => (at + 1) % events.length)}>
          {copy.count(position + 1, events.length)}
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </button>
      )}
    </div>
  );
}
