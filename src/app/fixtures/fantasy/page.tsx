import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { FantasyTicketPin } from "@/components/board/fantasy-ticket";
import { Pinboard } from "@/components/board/pinboard";
import { BoardSurface } from "@/components/board/surface";
import { fantasyTicket, type FantasySnapshot } from "@/integrations/fantasy";
import type { FantasySignal } from "@/integrations/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Week 4 of 2026, from real Sleeper data: week 3 was won 151.24 to 90.52.
const snapshot = (fetchedAt: string, overrides: Partial<FantasySnapshot> = {}): FantasySnapshot => ({
  fetchedAt,
  season: 2026,
  week: 4,
  teamName: "K9 Unit",
  record: { wins: 1, losses: 2, ties: 0 },
  regularSeasonWeeks: 14,
  thisWeek: { team: 0, opponent: 0 },
  lastWeek: { team: 151.24, opponent: 90.52 },
  ...overrides,
});

/** Each fixture at its own moment, read through the same mapper as the Board. */
const at = (iso: string, overrides: Partial<FantasySnapshot> = {}) => {
  const now = new Date(iso);
  const ticket = fantasyTicket(snapshot(iso, overrides), now);
  const fantasy: FantasySignal = { state: ticket ? "live" : "unavailable", ticket, updatedAt: iso };
  return { fantasy, now };
};

const fixtures = [
  // Tuesday 29 September, noon in New York.
  { name: "last-week", ...at("2026-09-29T16:00:00Z") },
  { name: "lost-close", ...at("2026-09-29T16:00:00Z", { lastWeek: { team: 98.5, opponent: 100.1 } }) },
  { name: "lost-blowout", ...at("2026-09-29T16:00:00Z", { lastWeek: { team: 70.02, opponent: 140.3 } }) },
  {
    name: "tied",
    ...at("2026-09-29T16:00:00Z", { lastWeek: { team: 110, opponent: 110 }, record: { wins: 8, losses: 5, ties: 1 }, teamName: "The Extremely Long Fantasy Team Name Club" }),
  },
  // Friday 2 October: Thursday's game is over and neither side has scored.
  { name: "held-over", ...at("2026-10-02T16:00:00Z") },
  // Saturday 3 October, between Thursday and Sunday.
  { name: "between", ...at("2026-10-03T16:00:00Z", { thisWeek: { team: 24.6, opponent: 0 } }) },
  // Sunday 4 October, 2pm in New York.
  { name: "live", ...at("2026-10-04T18:00:00Z", { thisWeek: { team: 61.1, opponent: 88.42 } }) },
  // Monday 5 October, noon, before Monday night.
  { name: "monday", ...at("2026-10-05T16:00:00Z", { thisWeek: { team: 101.3, opponent: 101.3 } }) },
  // Out of the playoffs: no matchup this week.
  { name: "season-over", ...at("2026-09-29T16:00:00Z", { thisWeek: null }) },
];

/**
 * The fantasy ticket stub at fixed moments, for the end-to-end suite: last
 * week's final, held over, between games, live, and no pin. It exists only
 * when the server is started with BOARD_FIXTURES=1.
 */
export default async function FantasyFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 className="sr-only">Fantasy ticket fixtures</h1>
      <BoardSurface kind="wall" className="p-4 sm:p-16">
        <Pinboard>
          {fixtures.map(({ name, fantasy, now }) => (
            <div key={name} data-fixture={name} className="board:col-span-4">
              <FantasyTicketPin fantasy={fantasy} now={now} />
            </div>
          ))}
        </Pinboard>
      </BoardSurface>
    </main>
  );
}
