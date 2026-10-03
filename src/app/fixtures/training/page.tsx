import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Pinboard } from "@/components/board/pinboard";
import { BoardSurface } from "@/components/board/surface";
import { TrainingPin } from "@/components/board/training-log";
import type { TrainingSignal } from "@/integrations/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// A fixed "now" and fixture weeks, so each state renders the same every run.
const now = new Date("2026-10-02T12:00:00.000Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();
const week = (rows: TrainingSignal["rows"], updatedAt = daysAgo(0)): TrainingSignal => ({ state: "live", rows, updatedAt });

const fixtures: { name: string; training: TrainingSignal }[] = [
  { name: "week", training: week([{ label: "Lift", count: 4 }, { label: "Run", count: 2 }]) },
  { name: "every-category", training: week([{ label: "Lift", count: 1 }, { label: "Run", count: 17 }, { label: "Muay Thai", count: 2 }, { label: "Other", count: 1 }]) },
  { name: "nothing-yet", training: week([]) },
  { name: "no-strava", training: { state: "unavailable", rows: null, updatedAt: null } },
  { name: "stale", training: week([{ label: "Run", count: 3 }], daysAgo(10)) },
];

/**
 * The training pin from fixture weeks, for the end-to-end suite: a normal
 * week, every category with a big tally, nothing logged yet, no Strava, and
 * the stale backstop. It exists only when the server is started with
 * BOARD_FIXTURES=1.
 */
export default async function TrainingFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 className="sr-only">Training fixtures</h1>
      <BoardSurface kind="wall" className="p-4 sm:p-16">
        <Pinboard>
          {fixtures.map(({ name, training }) => (
            <div key={name} data-fixture={name} className="board:col-span-4">
              <TrainingPin training={training} now={now} />
            </div>
          ))}
        </Pinboard>
      </BoardSurface>
    </main>
  );
}
