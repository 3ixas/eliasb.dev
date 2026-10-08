import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Pin } from "@/components/board/pin";
import { PinPhoto, PinSlot } from "@/components/board/pin-states";
import { Pinboard } from "@/components/board/pinboard";
import { BoardSurface } from "@/components/board/surface";
import { board } from "@/content/board";
import { pinStatus, type PinKey, type PinSource } from "@/integrations/pin-rules";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// A fixed "now" and fixture sources, so each pin state renders the same every run.
const now = new Date("2026-10-02T12:00:00.000Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

const fixtures: readonly { key: PinKey; source: PinSource; photo?: string | null }[] = [
  { key: "github", source: { state: "live", updatedAt: daysAgo(1) } },
  { key: "reading", source: { state: "live", updatedAt: daysAgo(61) } },
  { key: "making", source: { state: "unavailable", updatedAt: null } },
  { key: "film", source: { state: "live", updatedAt: daysAgo(2) }, photo: null },
  { key: "training", source: { state: "curated", updatedAt: null }, photo: board.training.photo.src },
];

/**
 * The Board's pin states from fixture data, for the end-to-end suite: current,
 * stale, removed, and missing-photo pins on the framed pinboard. It exists
 * only when the server is started with BOARD_FIXTURES=1.
 */
export default async function BoardFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 className="sr-only">Board fixtures</h1>
      <BoardSurface kind="wall" className="p-4 sm:p-16">
        <Pinboard>
          {fixtures.map(({ key, source, photo }) => (
            <PinSlot key={key} status={pinStatus(key, source, now)} data-fixture-pin={key} className="board-sway board:col-span-4">
              <Pin object="photo" fixing="tape" surface="linen" looseness="loose" tilt={1} stock="photo" className="p-3 pb-4">
                {photo !== undefined && (
                  <PinPhoto src={photo} alt={board.training.photo.alt} width={board.training.photo.width} height={board.training.photo.height} sizes="320px" />
                )}
                <p className="mt-3 mb-0 font-mono text-label uppercase">{board.labels[key]}</p>
              </Pin>
            </PinSlot>
          ))}
        </Pinboard>
      </BoardSurface>
    </main>
  );
}
