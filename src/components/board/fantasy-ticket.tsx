import type { CSSProperties } from "react";
import { Pin } from "@/components/board/pin";
import { PinSlot } from "@/components/board/pin-states";
import { board, fantasyRecord, fantasyScore, fantasySpoken, fantasyVerdict } from "@/content/board";
import { pinStatus } from "@/integrations/pin-rules";
import type { FantasySignal } from "@/integrations/types";

/**
 * NFL fantasy as a matchday ticket stub: a strip of turf, the result with a
 * pencilled verdict, and the season record on the torn-off side. It names my
 * team only, and links nowhere, since Sleeper's league page names everyone.
 */
export function FantasyTicketPin({ fantasy, now }: { fantasy: FantasySignal; now: Date }) {
  const { ticket } = fantasy;

  return (
    <PinSlot
      status={pinStatus("fantasy", fantasy, now)}
      data-board-pin="fantasy"
      className="board-sway mx-auto w-full max-w-[360px] board:max-w-none"
      style={{ "--sway-depth": 0.6 } as CSSProperties}
    >
      {ticket && (
        <Pin object="ticket" fixing="pushpin" surface="linen" looseness="loose" tilt={2.5} stock="matchday" fixingAt={58} className="board-matchday">
          <div aria-hidden="true" className="board-turf">
            <Football />
          </div>
          <div className="board-matchday-main py-4 pr-2 pl-3 min-[400px]:pr-3 min-[400px]:pl-4">
            <p className="sr-only">{fantasySpoken(ticket)}</p>
            <div aria-hidden="true">
              <p className="board-matchday-ink m-0 font-mono text-label uppercase">{board.fantasyWeek(ticket.week)}</p>
              <p className="m-0 mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-title font-medium">{board.fantasy.outcomes[ticket.outcome]}</span>
                <span className="board-pencil">{fantasyVerdict(ticket.outcome, ticket.margin)}</span>
              </p>
              <p className="m-0 mt-1 font-display text-lead whitespace-nowrap tabular-nums min-[400px]:text-title">
                {fantasyScore(ticket.scores.team)} – {fantasyScore(ticket.scores.opponent)}
              </p>
              <p className="board-matchday-muted m-0 mt-2 text-small">{board.fantasy.team(ticket.teamName)}</p>
              {ticket.gate && <p className="board-matchday-ink m-0 mt-2 font-mono text-label uppercase">{board.fantasy.gates[ticket.gate]}</p>}
            </div>
          </div>
          <div aria-hidden="true" className="board-matchday-side">
            <p className="board-matchday-ink m-0 font-mono text-label uppercase">
              {fantasyRecord(ticket.record)} · {board.fantasy.source}
            </p>
          </div>
        </Pin>
      )}
    </PinSlot>
  );
}

/** A football on the turf, lying at an angle. */
function Football() {
  return (
    <svg width="58" height="36" viewBox="0 0 58 36" className="board-football">
      <path d="M29 2 C 46 2, 56 12, 56 18 C 56 24, 46 34, 29 34 C 12 34, 2 24, 2 18 C 2 12, 12 2, 29 2 Z" fill="var(--football)" />
      <path
        d="M6 12 C 9 9, 11 8, 13 7 M6 24 C 9 27, 11 28, 13 29 M52 12 C 49 9, 47 8, 45 7 M52 24 C 49 27, 47 28, 45 29"
        stroke="var(--football-lace)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="20" y1="18" x2="38" y2="18" stroke="var(--football-lace)" strokeWidth="2" />
      <g stroke="var(--football-lace)" strokeWidth="1.6">
        <line x1="23" y1="15" x2="23" y2="21" />
        <line x1="27" y1="15" x2="27" y2="21" />
        <line x1="31" y1="15" x2="31" y2="21" />
        <line x1="35" y1="15" x2="35" y2="21" />
      </g>
    </svg>
  );
}
