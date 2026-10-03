import type { CSSProperties } from "react";
import { Pin } from "@/components/board/pin";
import { PinPhoto, PinSlot } from "@/components/board/pin-states";
import { board, trainingNote, trainingRowLabel, trainingSpoken } from "@/content/board";
import { pinStatus } from "@/integrations/pin-rules";
import { tallyGates } from "@/integrations/signal-mappers";
import type { TrainingSignal } from "@/integrations/types";

/**
 * Training: my running photo, taped up, with a page from a training diary
 * pinned over its bottom edge, counting this week's sessions from Strava in
 * tally marks. Without this week's counts, the photo and caption stand alone.
 */
export function TrainingPin({ training, now }: { training: TrainingSignal; now: Date }) {
  const { photo } = board.training;

  return (
    <div
      data-board-pin="training"
      className="board-sway mx-auto w-full max-w-[320px] board:col-span-3 board:max-w-none"
      style={{ "--sway-depth": 0.9 } as CSSProperties}
    >
      <Pin object="photo" fixing="tape" surface="linen" looseness="loose" tilt={2.4} stock="photo" className="p-3 pb-4">
        <PinPhoto src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 899px) 296px, 260px" />
        <p className="m-0 mt-3 font-display text-lead italic">{board.training.caption}</p>
      </Pin>
      {training.rows && (
        <PinSlot status={pinStatus("training", training, now)} data-training-log className="relative z-10 -mt-3 mr-2 ml-5">
          <TrainingLog rows={training.rows} />
        </PinSlot>
      )}
    </div>
  );
}

function TrainingLog({ rows }: { rows: NonNullable<TrainingSignal["rows"]> }) {
  const sessions = rows.reduce((total, { count }) => total + count, 0);

  return (
    <Pin object="sheet" fixing="pushpin" surface="linen" looseness="loose" tilt={-3} stock="paper" fixingAt={92} className="board-diary px-4 pt-4 pb-3">
      <p className="sr-only">{trainingSpoken(rows)}</p>
      <div aria-hidden="true">
        <div className="board-diary-rule flex flex-wrap items-baseline justify-between gap-x-3 pb-1.5">
          <p className="m-0 font-mono text-label whitespace-nowrap uppercase">{board.training.heading}</p>
          <p className="m-0 font-mono text-label whitespace-nowrap uppercase text-muted">{board.training.source}</p>
        </div>
        {rows.length > 0 && (
          <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3">
            {rows.map(({ label, count }) => (
              <div key={label} className="contents">
                <span className="font-display text-lead">{trainingRowLabel(label)}</span>
                <Tally count={count} />
                <span className="text-right font-display text-lead tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        )}
        <p className="board-pencil m-0 mt-2">{trainingNote(sessions)}</p>
      </div>
    </Pin>
  );
}

const STROKE_GAP = 7;
const GATE_WIDTH = 4 * STROKE_GAP + 6;

/** Tally marks in gates of five: four strokes and a fifth across them. */
function Tally({ count }: { count: number }) {
  const gates = tallyGates(count);
  const width = Math.max(1, gates.length * GATE_WIDTH);

  return (
    <svg width={width} height="22" viewBox={`0 0 ${width} 22`} className="board-tally block max-w-full">
      {gates.map((marks, gate) => {
        const x = gate * GATE_WIDTH + 3;
        return (
          <g key={gate}>
            {Array.from({ length: Math.min(marks, 4) }, (_, stroke) => (
              <line key={stroke} x1={x + stroke * STROKE_GAP} y1="3" x2={x + stroke * STROKE_GAP} y2="19" />
            ))}
            {marks === 5 && <line x1={x - 3} y1="16" x2={x + 3 * STROKE_GAP + 3} y2="6" />}
          </g>
        );
      })}
    </svg>
  );
}
