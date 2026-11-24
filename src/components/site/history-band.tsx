"use client";

import { useState } from "react";
import { ZoomableImage } from "@/components/site/zoomable-image";
import { offTheClock } from "@/content/stretch/off-the-clock";
import type { HistoryEvent } from "@/integrations/types";

const copy = offTheClock.curiosity;

/**
 * This week in history (DESIGN.md "The homepage, in order" 6, R-19, R-50): the oddity's 3:2 illustration opens full-size
 * in the shared `ZoomableImage` lightbox on click or tap, beside the date, fact, image credit, and an outline pill
 * ("1 of 3") that steps to the next in place. The fact is announced politely when it changes; every oddity shares one
 * stacked sizer cell so stepping moves nothing. With no script, or one oddity, the first shows and there is no pill.
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
      <div className="otc__history-body">
        {/* One 3:2 frame for every oddity, so stepping moves nothing: the zoomable picture, or the year where an oddity has none. */}
        {pictured && (
          <div className="otc__history-image">
            {image ? (
              /* Keying by image.src remounts ZoomableImage when stepping between oddities so any open zoom/preload state resets cleanly. */
              <ZoomableImage
                key={image.src}
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(min-width: 1200px) 260px, (min-width: 720px) 220px, calc(100vw - 96px)"
              />
            ) : (
              <span className="otc__history-year" aria-hidden="true">
                {events[position].year}
              </span>
            )}
          </div>
        )}
        <div className="otc__history-content">
          {/*
            Every oddity sits in the same cell, hidden but for the one shown, so the row is as tall as the tallest and
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
            <button
              type="button"
              className="pill pill--outline otc__step"
              aria-label={`${copy.count(position + 1, events.length)}, ${copy.nextFact}`}
              onClick={() => setPosition((at) => (at + 1) % events.length)}
            >
              {copy.count(position + 1, events.length)}
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
