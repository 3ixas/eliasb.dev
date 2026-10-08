import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ClippingPin } from "@/components/board/clipping";
import { Pinboard } from "@/components/board/pinboard";
import { BoardSurface } from "@/components/board/surface";
import { savedHistorySignal } from "@/integrations/history";
import type { HistorySignal } from "@/integrations/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const now = new Date("2026-10-02T12:00:00.000Z");

// A live week: a pictured lead, a text-only event, and a pictured birth.
const week: HistorySignal = {
  state: "live",
  weekOf: "2026-09-28",
  sourceUrl: "https://en.wikipedia.org/wiki/September_28",
  updatedAt: "2026-09-28T06:00:00.000Z",
  events: [
    {
      year: 1924,
      kind: "event",
      text: "The first aerial circumnavigation is completed by a team from the US Army.",
      sourceUrl: "https://en.wikipedia.org/wiki/First_aerial_circumnavigation",
      image: {
        src: "/projects/threshold.webp",
        alt: "Douglas World Cruisers on a beach",
        creator: "The Museum of Flight",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Douglas_World_Cruisers.jpg",
        licenseName: "Public domain",
        licenseUrl: null,
        width: 1280,
        height: 867,
      },
    },
    {
      year: 1781,
      kind: "event",
      text: "A cow wanders into a cathedral and is accidentally made an honorary chorister.",
      sourceUrl: "https://en.wikipedia.org/wiki/Cow",
    },
    {
      year: 1852,
      kind: "birth",
      text: "Henri Moissan, French chemist who first isolated fluorine",
      sourceUrl: "https://en.wikipedia.org/wiki/Henri_Moissan",
      image: {
        src: "/profile/elias-evening.webp",
        alt: "Henri Moissan in his laboratory",
        creator: "Ada Example",
        sourceUrl: "https://commons.wikimedia.org/wiki/File:Henri_Moissan.jpg",
        licenseName: "CC BY-SA 4.0",
        licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
        width: 1280,
        height: 853,
      },
    },
  ],
};

/**
 * The Weekly Curiosity from fixture data, for the end-to-end suite: a live
 * week and the saved examples. It exists only when the server is started with
 * BOARD_FIXTURES=1.
 */
export default async function ClippingFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 className="sr-only">Weekly Curiosity fixtures</h1>
      <BoardSurface kind="wall" className="p-4 sm:p-16">
        <Pinboard>
          <div data-fixture="week" className="board:col-span-5">
            <ClippingPin history={week} now={now} />
          </div>
          <div data-fixture="saved" className="board:col-span-5 board:col-start-1">
            <ClippingPin history={savedHistorySignal()} now={now} />
          </div>
        </Pinboard>
      </BoardSurface>
    </main>
  );
}
