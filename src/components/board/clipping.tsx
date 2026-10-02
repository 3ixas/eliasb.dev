import { WeeklyCuriosity, type ClippingStory } from "@/components/board/weekly-curiosity";
import { PinSlot } from "@/components/board/pin-states";
import { board, isoWeek } from "@/content/board";
import { asOfDate, pinStatus } from "@/integrations/pin-rules";
import type { HistorySignal } from "@/integrations/types";

/**
 * The Weekly Curiosity: this week's oddities from history as a newspaper
 * cutting. The most surprising leads; the other two fan out from behind it.
 */
export function ClippingPin({ history, now }: { history: HistorySignal; now: Date }) {
  const copy = board.clipping;
  // The facts happened on the week's Monday, in their own years.
  const day = history.weekOf ? asOfDate(new Date(`${history.weekOf}T12:00:00Z`)) : null;
  const week = history.weekOf ? isoWeek(new Date(`${history.weekOf}T12:00:00Z`)) : null;

  const stories: ClippingStory[] = history.events.map((event) => {
    const date = day ? `${day.long} ${event.year}` : String(event.year);
    return {
      key: `${event.year}-${event.kind}-${event.text}`,
      dateLine: event.kind === "birth" ? copy.born(date) : date,
      text: event.text,
      href: event.sourceUrl,
      linkLabel: history.weekOf ? copy.readOnWikipedia : copy.readMore,
      image: event.image ?? null,
    };
  });

  return (
    <PinSlot
      status={pinStatus("clipping", history, now)}
      data-board-pin="clipping"
      className="relative mx-auto w-full max-w-[460px] board:col-span-5 board:max-w-none"
    >
      <WeeklyCuriosity
        dateline={[week ? copy.volume(week.year, week.week) : null, day ? copy.weekOf(day.short) : copy.archive, copy.price]}
        stories={stories}
        source={{ href: history.sourceUrl, label: day ? copy.moreFromDay(day.long) : copy.browseHistory }}
      />
    </PinSlot>
  );
}
