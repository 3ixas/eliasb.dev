import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { WorkArchivePage } from "@/components/site/work-archive-page";
import { PROJECT_CATEGORIES, projects, type Project } from "@/content/projects";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Twelve projects, four per category, across several years. Years and
 * categories are deliberately out of step with the catalogue's order, so the
 * archive's own sorting and filtering are what the tests see.
 */
const catalogue: Project[] = Array.from({ length: 12 }, (_, position) => ({
  slug: `fixture-${position + 1}`,
  name: `Fixture ${position + 1}`,
  outcome: `Outcome of fixture ${position + 1}.`,
  type: "Prototype",
  year: 2022 + (position % 5),
  category: PROJECT_CATEGORIES[position % PROJECT_CATEGORIES.length],
  links: { code: `https://github.com/3ixas/fixture-${position + 1}` },
  ...(position === 0 ? { screenshot: projects[0].screenshot } : {}),
}));

/**
 * The /work archive fed a catalogue longer than ten, for the end-to-end suite.
 * It exists only when the server is started with BOARD_FIXTURES=1.
 */
export default async function WorkArchiveFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();
  return <WorkArchivePage catalogue={catalogue} />;
}
