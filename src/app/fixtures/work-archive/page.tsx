import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { WorkArchivePage } from "@/components/site/work-archive-page";
import { PROJECT_CATEGORIES, projects, type Project } from "@/content/projects";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const MAX = 12;

/**
 * Up to twelve projects (`?count=`, twelve by default), four per category, across several years. Years and
 * categories are deliberately out of step with the catalogue's order, so the archive's own sorting and
 * filtering are what the tests see.
 */
const catalogue: Project[] = Array.from({ length: MAX }, (_, position) => ({
  slug: `fixture-${position + 1}`,
  name: `Fixture ${position + 1}`,
  outcome: `Outcome of fixture ${position + 1}.`,
  type: "Prototype",
  year: 2022 + (position % 5),
  category: PROJECT_CATEGORIES[position % PROJECT_CATEGORIES.length],
  links: { code: `https://github.com/3ixas/fixture-${position + 1}` },
  screenshot: projects[0].screenshot,
  crop: projects[0].crop,
  colours: projects[0].colours,
}));

/**
 * The /things-i-make archive fed a catalogue of the length asked for, so the end-to-end suite can stand on either side of
 * the filters' threshold. It exists only when the server is started with BOARD_FIXTURES=1.
 */
export default async function WorkArchiveFixtures({ searchParams }: { searchParams: Promise<{ count?: string }> }) {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();
  const count = Math.min(MAX, Math.max(1, Number((await searchParams).count) || MAX));
  return <WorkArchivePage catalogue={catalogue.slice(0, count)} />;
}
