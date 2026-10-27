import Image from "next/image";
import Link from "next/link";
import { CloserLookRoot } from "@/components/quiet/closer-look-root";
import { ProjectObject, projectColours } from "@/components/quiet/project-object";
import { Row } from "@/components/quiet/row";
import { featuredProjects, featuredSlugs, HOMEPAGE_INDEX_ROWS, projectIndex, projects, type Project } from "@/content/projects";
import { thingsIMake } from "@/content/stretch/site-copy";

/** A project opens at its case study, else its live site, else its code. */
const destination = ({ links }: Project) => links.caseStudy ?? links.live ?? links.code;

const lookId = ({ slug }: Project) => `project-${slug}`;
const metadata = ({ type, year }: Project) => `${type} · ${year}`;

/** A project's closer look: its screenshot sliding in on its Project colour, then its type and year. */
function ProjectLook({ project }: { project: Project }) {
  const { screenshot } = project;
  return (
    <figure className="qi-project" style={projectColours(project)}>
      {screenshot && <Image src={screenshot.src} alt="" width={screenshot.width} height={screenshot.height} sizes="300px" />}
      <figcaption className="stretch-mono">{metadata(project)}</figcaption>
    </figure>
  );
}

/** The screenshot a featured project's phone card shows; the row hides it everywhere else. */
function CardShot({ project }: { project: Project }) {
  const { screenshot } = project;
  if (!screenshot) return null;
  return (
    <span className="qi-card__shot" aria-hidden="true">
      <Image src={screenshot.src} alt="" width={screenshot.width} height={screenshot.height} sizes="(max-width: 760px) 82vw, 1px" />
    </span>
  );
}

/**
 * The body of the Things I make section (GLOSSARY.md): one list holding the featured projects, then the others
 * newest first (at most ten), then the link to the Work archive with the true count. On phones the featured
 * three become swipeable cards from the same markup (CSS); the cards have no closer look.
 */
export function ThingsIMake() {
  const featured = featuredProjects(projects, featuredSlugs);
  const others = projectIndex(projects, featuredSlugs).slice(0, HOMEPAGE_INDEX_ROWS);
  const looks = Object.fromEntries([...featured, ...others].map((project) => [lookId(project), <ProjectLook key={project.slug} project={project} />]));
  return (
    <CloserLookRoot looks={looks} className="qi-column">
      <h2 id="things-i-make-heading" className="qi-title">
        {thingsIMake.heading}
      </h2>
      <p className="qi-note-line">{thingsIMake.note}</p>
      <ul className="qi-list" data-things="">
        {[...featured, ...others].map((project) => {
          const href = destination(project);
          const isFeatured = featured.includes(project);
          return (
            <Row
              key={project.slug}
              href={href}
              object={<ProjectObject project={project} />}
              title={project.name}
              line={thingsIMake.rowOutcomes[project.slug] ?? project.outcome}
              meta={String(project.year)}
              look={{ id: lookId(project), description: metadata(project) }}
              card={isFeatured ? <CardShot project={project} /> : undefined}
              style={projectColours(project)}
            />
          );
        })}
      </ul>
      <p className="qi-all">
        <Link href="/things-i-make">{thingsIMake.allThings(projects.length)}</Link>
      </p>
    </CloserLookRoot>
  );
}
