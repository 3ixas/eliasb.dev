import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Pinboard } from "@/components/board/pinboard";
import { BoardSurface } from "@/components/board/surface";
import { TrainingPin } from "@/components/board/training-log";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Fixed moments, so "today" lands on the same day every run.
const fixtures = [
  // Monday 5 October, 00:30 in London (still Sunday in UTC).
  { name: "monday", now: new Date("2026-10-04T23:30:00Z") },
  // Saturday 3 October, midday.
  { name: "saturday", now: new Date("2026-10-03T12:00:00Z") },
  // Sunday 1 November, 23:30 in London, after the clocks went back.
  { name: "sunday", now: new Date("2026-11-01T23:30:00Z") },
];

/**
 * The training pin at fixed moments, for the end-to-end suite: today on a
 * Monday just after midnight, on a Saturday, and late on a Sunday in GMT. It
 * exists only when the server is started with BOARD_FIXTURES=1.
 */
export default async function TrainingFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 className="sr-only">Training fixtures</h1>
      <BoardSurface kind="wall" className="p-4 sm:p-16">
        <Pinboard>
          {fixtures.map(({ name, now }) => (
            <div key={name} data-fixture={name} className="board:col-span-4">
              <TrainingPin now={now} />
            </div>
          ))}
        </Pinboard>
      </BoardSurface>
    </main>
  );
}
