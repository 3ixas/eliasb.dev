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
  const { image, text } = events[position];
  return (
    <div className="otc__history" data-otc="history" data-state={source ? "archive" : "live"}>
      <span className="otc__history-image">
        {image && <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="64px" />}
      </span>
      <div>
        <h3>{copy.label}</h3>
        <p aria-live="polite">
          <b>{dates[position]}</b> {text}
        </p>
        {image && (
          <p className="otc__credit">
            {`${copy.imageCredit} ${image.creator} · ${image.licenseName}`}
          </p>
        )}
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
