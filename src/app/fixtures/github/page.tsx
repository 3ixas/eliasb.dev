import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { GitHubPin } from "@/components/board/github-pin";
import { MakingPin } from "@/components/board/making-pin";
import { Pinboard } from "@/components/board/pinboard";
import { BoardSurface } from "@/components/board/surface";
import { datesForWindow, GITHUB_ACTIVITY_DAYS } from "@/integrations/signal-mappers";
import type { GitHubSignal, LatestRepositorySignal } from "@/integrations/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// A fixed "now" and a fixed year, so each state renders the same every run.
const now = new Date("2026-10-02T12:00:00.000Z");
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString();

// A quiet year with a few busy days, and a busy stretch in mid-January.
const activity = datesForWindow(GITHUB_ACTIVITY_DAYS, now).map(({ date }, index) => {
  if (date >= "2026-01-05" && date <= "2026-02-01") return { date, count: 2 + (index % 4) };
  return { date, count: index % 9 === 0 ? 1 : index % 23 === 0 ? 3 : 0 };
});
const year = (updatedAt: string): GitHubSignal => ({
  state: "live",
  activity,
  total: activity.reduce((total, day) => total + day.count, 0),
  updatedAt,
  href: "https://github.com/3ixas",
});
const latest: LatestRepositorySignal = {
  state: "live",
  repository: {
    name: "eliasb.dev",
    description: "Personal site for Elias B.: thoughtful software, projects, experiments, and personal signals.",
    href: "https://github.com/3ixas/eliasb.dev",
    pushedAt: "2026-10-03T05:36:51Z",
  },
  updatedAt: daysAgo(0),
};
// Eight weeks after the entry was written, it's no longer "now".
const later = new Date("2026-12-01T12:00:00.000Z");

/**
 * The GitHub sheet and the Making pin from fixture data, for the end-to-end
 * suite: the year, a stale year, the authored entry, the latest-repository
 * fallback, and no Making pin at all. It exists only when the server is
 * started with BOARD_FIXTURES=1.
 */
export default async function GitHubFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1}>
      <h1 className="sr-only">GitHub and Making fixtures</h1>
      <BoardSurface kind="wall" className="p-4 sm:p-16">
        <Pinboard>
          <div data-fixture="making" className="board:col-span-4">
            <MakingPin latest={latest} now={now} />
          </div>
          <div data-fixture="making-fallback" className="board:col-span-4">
            <MakingPin latest={latest} now={later} />
          </div>
          <div data-fixture="making-none" className="board:col-span-4">
            <MakingPin latest={{ state: "unavailable", repository: null, updatedAt: null }} now={later} />
          </div>
          <div data-fixture="year" className="board:col-span-12">
            <GitHubPin github={year(daysAgo(0))} now={now} />
          </div>
          <div data-fixture="year-stale" className="board:col-span-12">
            <GitHubPin github={year(daysAgo(5))} now={now} />
          </div>
        </Pinboard>
      </BoardSurface>
    </main>
  );
}
