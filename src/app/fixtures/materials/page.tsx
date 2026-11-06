import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CalendarTile } from "@/components/quiet/calendar-tile";
import { FullPass, MiniPass } from "@/components/quiet/finished-pass";
import { ProjectObject } from "@/components/quiet/project-object";
import { ProjectLook } from "@/components/quiet/project-rows";
import { Sheet } from "@/components/quiet/sheet";
import { projects } from "@/content/projects";
import { roleStorySlugs } from "@/content/stretch/role-stories";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Each group is one picture for the visual regression spec (e2e/materials.spec.ts), on the page background it sits on. */
const group = { display: "flex", alignItems: "flex-end", gap: 24, padding: 24, width: "fit-content", background: "var(--stretch-page)" } as const;

/**
 * The objects' materials (shadows, lit edges, the foil seal, Optegra's colours, the project crops) on one page, so
 * a change to them is seen without the live data, greetings and copy of the real pages around them. It exists only
 * when the server is started with BOARD_FIXTURES=1.
 */
export default async function MaterialFixtures() {
  await connection();
  if (process.env.BOARD_FIXTURES !== "1") notFound();

  const withCrop = projects.filter((project) => project.crop);
  return (
    <main id="main-content" tabIndex={-1}>
      <h1>Materials</h1>
      <div data-shot="mini-passes" style={group}>
        {roleStorySlugs.map((slug) => (
          <MiniPass key={slug} slug={slug} />
        ))}
      </div>
      <div data-shot="project-crops" style={group}>
        {withCrop.map((project) => (
          <ProjectObject key={project.slug} project={project} eager />
        ))}
      </div>
      <div data-shot="paper-objects" style={group}>
        <CalendarTile number="6" today />
        <CalendarTile number="7" />
        <Sheet />
      </div>
      {roleStorySlugs.map((slug) => (
        <div key={slug} data-shot={`full-pass-${slug}`} style={group}>
          <FullPass slug={slug} />
        </div>
      ))}
      <div data-shot="project-look" style={group}>
        <ProjectLook project={withCrop[0]} />
      </div>
    </main>
  );
}
