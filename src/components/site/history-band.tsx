"use client";

import Image from "next/image";
import { useState } from "react";
import { offTheClock } from "@/content/stretch/off-the-clock";
import type { HistoryEvent } from "@/integrations/types";

const copy = offTheClock.curiosity;

/**
 * This week in history, full width (R-19): the oddity's picture, the title, its date and fact, and an outline pill,
 * "1 of 3", that steps to the next in place. The fact is announced politely when it changes; nothing else on the page
 * moves. With no script, or one oddity, the first shows and there is no pill. `dates` are the events' dates as written,
 * in the same order; `source` is the archive's "From the archive" when the week is not live.
 */
export function HistoryBand({ events, dates, source }: { events: HistoryEvent[]; dates: string[]; source?: string }) {
  const [position, setPosition] = useState(0);
  const { image } = events[position];
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
    <div className="otc__history" data-otc="history" data-state={source ? "archive" : "live"}>
      <span className="otc__history-image">
        {image && <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="64px" />}
      </span>
      <div>
        <h3>{copy.label}</h3>
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
