import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { bookEntry, OffTheClockList, trainingEntry } from "@/components/quiet/off-the-clock";
import type { ReadingSignal } from "@/integrations/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// A fixed "now", so the training row's day is the same every run.
const saturday = "2026-10-03T12:00:00Z";
const reading: ReadingSignal = {
  state: "curated",
  book: { title: "Dark Age", author: "Pierce Brown", startedAt: "2026-09-14T10:52:45.000Z", coverUrl: "/projects/threshold.webp" },
  href: "https://www.goodreads.com/user/show/171686303-elias-bennett",
  updatedAt: "2026-10-01T12:00:00.000Z",
};

/**
 * The quiet index's closer looks on fixed data, for the specs of the closer-look machinery (inline-looks,
 * desktop-motion, phone-motion, inline-close and craft-precision's interruptions). No page shows these rows any more
 * (#416); the machinery stays for the Role stories' reveal words until #417, and this fixture goes with it. It exists only
 * when the server is started with BOARD_FIXTURES=1.
 */
export default async function CloserLookFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();
  return (
    <div data-stretch-shell>
      <main id="main-content" tabIndex={-1} className="stretch-wrap">
        <h1 className="sr-only">Closer look fixtures</h1>
        {/* Room above, so a look can open low on the page and the row can sit mid-screen. */}
        <div style={{ height: "60vh" }} />
        <div data-fixture="training" className="stretch-section">
          <OffTheClockList entries={[trainingEntry(saturday)]} />
        </div>
        <div data-fixture="pair" className="stretch-section">
          <OffTheClockList entries={[trainingEntry(saturday), bookEntry(reading)]} />
        </div>
        <div style={{ height: "120vh" }} />
      </main>
    </div>
  );
}
