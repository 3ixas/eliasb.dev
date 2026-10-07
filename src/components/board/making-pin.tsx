import type { CSSProperties } from "react";
import { ExternalLink } from "@/components/board/external-link";
import { Pin } from "@/components/board/pin";
import { PinSlot } from "@/components/board/pin-states";
import { board, makingNote } from "@/content/board";
import { asOfDate, pinStatus } from "@/integrations/pin-rules";
import type { LatestRepositorySignal } from "@/integrations/types";

/**
 * Making: a blueprint of what I'm building now, with a title block in the
 * corner as an architect's drawing has. Once the entry is past its eight
 * weeks it falls back to my latest public repository, and with neither, the
 * pin comes down.
 */
export function MakingPin({ latest, now }: { latest: LatestRepositorySignal; now: Date }) {
  const note = makingNote(now, latest.repository);
  const copy = board.making;
  const status = note ? pinStatus("making", { state: note.kind === "authored" ? "curated" : "live", updatedAt: null }, now) : ({ kind: "removed" } as const);
  const pushed = note?.kind === "latest" ? asOfDate(new Date(note.repository.pushedAt)) : null;

  return (
    <PinSlot status={status} data-board-pin="making" className="board-sway" style={{ "--sway-depth": 0.5 } as CSSProperties}>
      {note && (
        <Pin object="sheet" fixing="pushpin" surface="linen" looseness="loose" tilt={-1.5} stock="cyanotype" fixingAt={48} className="p-4">
          <BlueprintDrawing />
          <div className="board-blueprint-block mt-3">
            <p className="board-blueprint-cell m-0 font-mono text-label uppercase">{note.kind === "authored" ? board.labels.making : copy.fallbackLabel}</p>
            <div className="px-2.5 py-2">
              <p className="m-0 font-display text-lead leading-snug">{note.kind === "authored" ? note.entry.title : note.repository.name}</p>
              {(note.kind === "authored" ? note.entry.line : note.repository.description) && (
                <p className="m-0 mt-1 text-small">{note.kind === "authored" ? note.entry.line : note.repository.description}</p>
              )}
              <ExternalLink href={note.kind === "authored" ? note.entry.link.href : note.repository.href} className="board-blueprint-link">
                {note.kind === "authored" ? note.entry.link.label : copy.fallbackLink}
              </ExternalLink>
            </div>
            <p className="board-blueprint-footer m-0 flex font-mono text-label uppercase">
              <span className="board-blueprint-cell">{copy.drawnBy}</span>
              <span className="px-2 py-1">
                {note.kind === "authored" ? note.entry.version : pushed && (
                  <time dateTime={pushed.iso}>
                    <span aria-hidden="true">{copy.updated(pushed.short)}</span>
                    <span className="sr-only">{copy.updated(pushed.long)}</span>
                  </time>
                )}
              </span>
            </p>
          </div>
        </Pin>
      )}
    </PinSlot>
  );
}

/** A line drawing of an app's screen, in blueprint white. */
function BlueprintDrawing() {
  return (
    <svg aria-hidden="true" viewBox="0 0 150 110" className="board-blueprint-drawing block h-auto w-full max-w-[220px]">
      <rect x="4" y="6" width="120" height="84" rx="6" fill="none" strokeWidth="1.4" />
      <line x1="4" y1="22" x2="124" y2="22" strokeWidth="1" />
      <rect x="14" y="32" width="62" height="14" rx="7" fill="none" strokeWidth="1" strokeDasharray="3 3" />
      <rect x="48" y="54" width="66" height="14" rx="7" fill="none" strokeWidth="1" />
      <circle cx="134" cy="30" r="12" fill="none" strokeWidth="1.2" />
      <path d="M124 26 L144 26 L140 20 L128 20 Z" fill="none" strokeWidth="1" />
      <line x1="104" y1="6" x2="146" y2="102" strokeWidth=".6" strokeDasharray="2 4" />
    </svg>
  );
}
