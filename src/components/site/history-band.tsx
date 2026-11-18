"use client";

import Image from "next/image";
import { useState } from "react";
import { offTheClock } from "@/content/stretch/off-the-clock";
import type { HistoryEvent } from "@/integrations/types";

const copy = offTheClock.curiosity;

/**
 * This week in history (R-19, #465): picture first, its fact as the caption, and an outline pill, "1 of 3", that steps
 * to the next in place. The picture's frame is always there at one size: an oddity with no picture shows its year in
 * it, large, so stepping never empties the frame or moves the page. On a phone the picture is full width over the
 * caption; from 960 px it sits at the left of the panel with the heading and caption beside it. The fact is announced
 * politely when it changes. With no script, or one oddity, the first shows and there is no pill. `dates` are the events'
 * dates as written, in the same order; `source` is the archive's "From the archive" when the week is not live.
 */
export function HistoryBand({ events, dates, source }: { events: HistoryEvent[]; dates: string[]; source?: string }) {
  const [position, setPosition] = useState(0);
  const { image, year } = events[position];
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
    <div className="otc__history otc__section" data-otc="history" data-state={source ? "archive" : "live"}>
      <h3 className="otc__title">{copy.label}</h3>
      <span className="otc__history-image">
        {image ? (
          <Image key={image.src} src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(min-width: 960px) 620px, 90vw" />
        ) : (
          <span className="otc__history-year" aria-hidden="true">
            {year}
          </span>
        )}
      </span>
      <div className="otc__history-caption">
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
        {events.length > 1 && (
          <button type="button" className="pill pill--outline otc__step" onClick={() => setPosition((at) => (at + 1) % events.length)}>
            {copy.count(position + 1, events.length)}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
