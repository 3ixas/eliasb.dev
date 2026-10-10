import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ProjectIndex } from "@/components/site/project-index";
import { projects, projectIndex, type Project } from "@/content/projects";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Fourteen projects across several years, pictured rows at the start, middle and end of the visible list. */
const catalogue: Project[] = Array.from({ length: 14 }, (_, position) => ({
  slug: `fixture-${position + 1}`,
  name: `Fixture ${position + 1}`,
  outcome: `Outcome of fixture ${position + 1}.`,
  type: "Prototype",
  category: "experiments",
  year: 2026 - Math.floor(position / 3),
  links: { code: `https://github.com/3ixas/fixture-${position + 1}` },
  ...([0, 4, 9].includes(position) ? { screenshot: projects[0].screenshot } : {}),
}));

/**
 * The Project index fed a catalogue longer than its cap, for the end-to-end
 * suite. It exists only when the server is started with BOARD_FIXTURES=1.
 */
export default async function ProjectIndexFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  return (
    <main id="main-content" tabIndex={-1} className="stretch-wrap" data-stretch-shell>
      <h1 className="sr-only">Project index fixtures</h1>
      <ProjectIndex rows={projectIndex(catalogue, [])} firstNumber={1} total={catalogue.length} />
    </main>
  );
}
