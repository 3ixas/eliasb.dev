import type { CSSProperties } from "react";
import { ClippingPin } from "@/components/board/clipping";
import { CultureCorner } from "@/components/board/culture-corner";
import { FantasyTicketPin } from "@/components/board/fantasy-ticket";
import { TrainingPin } from "@/components/board/training-log";
import { LondonClock } from "@/components/board/london-clock";
import { Pin } from "@/components/board/pin";
import { PinPhoto, PinSlot } from "@/components/board/pin-states";
import { Pinboard } from "@/components/board/pinboard";
import { BoardSurface } from "@/components/board/surface";
import { board } from "@/content/board";
import { getReadingSignal } from "@/integrations/goodreads";
import { getCachedHistorySignal } from "@/integrations/history-cache";
import { getFilmSignal } from "@/integrations/letterboxd";
import { getFantasySignal } from "@/integrations/sleeper";
import type { PinStatus } from "@/integrations/pin-rules";

// London is authored, a photo and the time, so it is always current (staleAfterDays.london is null).
const londonStatus: PinStatus = { kind: "current" };

/**
 * The Board: the personal section, a framed linen pinboard on the wall.
 * The Weekly Curiosity, training, London, the fantasy ticket and the culture
 * corner are pinned here; GitHub and Making move onto the board in #87.
 */
export async function Board() {
  const now = new Date();
  const [history, reading, film, fantasy] = await Promise.all([
    getCachedHistorySignal(),
    getReadingSignal(),
    getFilmSignal(),
    getFantasySignal(now),
  ]);

  return (
    <BoardSurface
      kind="wall"
      as="section"
      id="outside-work"
      tabIndex={-1}
      aria-labelledby="outside-work-title"
      className="px-4 pt-16 pb-24 sm:px-8 lg:px-16 lg:pt-24"
    >
      <div className="relative z-10 mx-auto max-w-[1248px]">
        <p className="m-0 font-mono text-label uppercase text-wall-muted">{board.kicker}</p>
        <h2 id="outside-work-title" className="mt-4 mb-0 font-display text-heading font-normal text-wall-ink">
          {board.heading.lead} <em className="text-wall-accent">{board.heading.emphasis}</em>
        </h2>
        <Pinboard className="mt-12 board:mt-16">
          <ClippingPin history={history} now={now} />
          <TrainingPin now={now} />
          {/* London with the fantasy ticket pinned below it, beside the clipping. */}
          <div className="flex flex-col gap-16 board:col-span-4 board:col-start-9">
            <LondonPin />
            <FantasyTicketPin fantasy={fantasy} now={now} />
          </div>
          <CultureCorner reading={reading} film={film} now={now} />
        </Pinboard>
      </div>
    </BoardSurface>
  );
}

/** London: a photo taped to the linen, with an analogue clock set to London time. */
function LondonPin() {
  return (
    <PinSlot
      status={londonStatus}
      data-board-pin="london"
      className="board-sway relative mx-auto w-full max-w-[320px] board:max-w-none"
      style={{ "--sway-depth": 0.7 } as CSSProperties}
    >
      <Pin object="photo" fixing="tape" surface="linen" looseness="loose" tilt={-1.2} stock="photo" className="p-3 pb-4">
        <PinPhoto
          src={board.london.src}
          alt={board.london.alt}
          width={board.london.width}
          height={board.london.height}
          sizes="(max-width: 899px) 296px, 360px"
        />
        <p className="mt-3 mb-0 font-mono text-label uppercase">{board.labels.london}</p>
      </Pin>
      <LondonClock className="board-clock absolute -right-3 -bottom-8 z-20" />
    </PinSlot>
  );
}
