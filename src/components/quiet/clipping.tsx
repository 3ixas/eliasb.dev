"use client";

import Image from "next/image";
import { useCycle } from "@/components/quiet/cycle";
import { offTheClock } from "@/content/stretch/off-the-clock";
import type { HistoryEvent } from "@/integrations/types";

const copy = offTheClock.curiosity;

/**
 * The history row's closer look: a newsprint clipping stamped "This week in history", with the oddity's picture
 * and credit, date and fact, and which of the week's it is. It shows the oddity the row has cycled to, and the
 * body is keyed by it so the stamp lands again each time. A look has no links: the credit is read, not followed.
 * `dates` are the events' dates as written on the clipping, in the same order.
 */
export function ClippingLook({ id, events, dates }: { id: string; events: HistoryEvent[]; dates: string[] }) {
  const [position] = useCycle(id, events.length);
  const { image, text } = events[position];
  return (
    <div className="qi-clipping">
      <div key={position} className="qi-clipping__body">
        <p className="qi-clipping__stamp stretch-mono">{copy.stamp}</p>
        {image && (
          <figure className="qi-clipping__figure">
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="300px" />
            <figcaption className="stretch-mono">
              {copy.imageCredit} {image.creator} {"·"} {image.licenseName}
            </figcaption>
          </figure>
        )}
        <p className="qi-clipping__date stretch-mono">{dates[position]}</p>
        <p className="qi-clipping__fact">{text}</p>
      </div>
      {events.length > 1 && <p className="qi-clipping__count stretch-mono">{copy.count(position + 1, events.length)}</p>}
    </div>
  );
}
