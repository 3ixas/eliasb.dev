import type { CSSProperties } from "react";
import { Pin } from "@/components/board/pin";
import { PinPhoto, PinSlot } from "@/components/board/pin-states";
import { board, trainingSpoken } from "@/content/board";
import { pinStatus } from "@/integrations/pin-rules";
import { londonWeekday } from "@/integrations/signal-mappers";

/**
 * Training: my running photo, taped up, with a page from a training diary
 * pinned over its bottom edge. The page is my usual week, labelled as the
 * plan, so it never goes stale; only the pencilled "today" moves, by the day
 * in London.
 */
export function TrainingPin({ now }: { now: Date }) {
  const { photo } = board.training;

  return (
    <PinSlot
      // Authored, so always current (staleAfterDays.training is null).
      status={pinStatus("training", { state: "curated", updatedAt: null }, now)}
      data-board-pin="training"
      className="board-sway mx-auto w-full max-w-[320px] board:col-span-3 board:max-w-none"
      style={{ "--sway-depth": 0.9 } as CSSProperties}
    >
      <Pin object="photo" fixing="tape" surface="linen" looseness="loose" tilt={2.4} stock="photo" className="p-3 pb-4">
        <PinPhoto src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 899px) 296px, 260px" />
        <p className="m-0 mt-3 font-display text-lead italic">{board.training.caption}</p>
      </Pin>
      <div className="relative z-10 -mt-3 mr-2 ml-5">
        <TrainingPlan today={londonWeekday(now)} />
      </div>
    </PinSlot>
  );
}

function TrainingPlan({ today }: { today: number }) {
  const { days, heading, plan, note } = board.training;

  return (
    <Pin object="sheet" fixing="pushpin" surface="linen" looseness="loose" tilt={-3} stock="paper" fixingAt={92} className="board-diary px-4 pt-4 pb-3">
      <p className="sr-only">{trainingSpoken(today)}</p>
      <div aria-hidden="true" data-training-plan>
        <div className="board-diary-rule flex flex-wrap items-baseline justify-between gap-x-3 pb-1.5">
          <p className="m-0 font-mono text-label whitespace-nowrap uppercase">{heading}</p>
          <p className="m-0 font-mono text-label whitespace-nowrap uppercase text-muted">{plan}</p>
        </div>
        <ol className="m-0 mt-1 list-none p-0">
          {days.map((day, index) => (
            <li key={day.short} data-today={index === today || undefined} className="board-diary-row flex items-baseline gap-3">
              <span className="board-diary-day w-9 shrink-0 font-mono text-label uppercase">{day.short}</span>
              <span className="font-display text-body">{day.session}</span>
              {index === today && <span className="board-pencil ml-auto hidden shrink-0 text-small leading-7 min-[400px]:inline-block">{board.training.today}</span>}
            </li>
          ))}
        </ol>
        <p className="board-pencil m-0 mt-2">{note}</p>
      </div>
    </Pin>
  );
}
