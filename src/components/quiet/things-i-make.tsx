import Link from "next/link";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { ProjectRow, projectLooks } from "@/components/quiet/project-rows";
import { featuredProjects, featuredSlugs, HOMEPAGE_INDEX_ROWS, projectIndex, projects } from "@/content/projects";
import { thingsIMake } from "@/content/stretch/site-copy";

/**
 * The body of the Things I make section (GLOSSARY.md): one list holding the featured projects, then the others
 * newest first (at most ten), then the link to the Work archive with the true count. On phones the featured
 * three become swipeable cards from the same markup (CSS); the cards have no closer look.
 */
export function ThingsIMake() {
  const featured = featuredProjects(projects, featuredSlugs);
  const others = projectIndex(projects, featuredSlugs).slice(0, HOMEPAGE_INDEX_ROWS);
  return (
    <CloserLookRoot looks={projectLooks([...featured, ...others])} className="qi-column">
      <h2 id="things-i-make-heading" className="qi-title">
        {thingsIMake.heading}
      </h2>
      <p className="qi-note-line">{thingsIMake.note}</p>
      <ul className="qi-list" data-things="">
        {featured.map((project) => (
          <ProjectRow key={project.slug} project={project} featured />
        ))}
        {others.map((project) => (
          <ProjectRow key={project.slug} project={project} />
        ))}
      </ul>
      <p className="qi-all">
        <Link href="/things-i-make">{thingsIMake.allThings(projects.length)}</Link>
      </p>
    </CloserLookRoot>
  );
}
