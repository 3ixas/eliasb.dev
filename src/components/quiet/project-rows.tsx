import Image from "next/image";
import { Row } from "@/components/quiet/row";
import { ProjectObject, projectColours } from "@/components/quiet/project-object";
import type { Project } from "@/content/projects";
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
    <span className="qi-card__shot">
      <Image src={screenshot.src} alt={screenshot.alt} width={screenshot.width} height={screenshot.height} sizes="(max-width: 760px) 82vw, 1px" />
    </span>
  );
}

/** The closer looks of these projects, keyed as their rows ask for them: what the section's `CloserLookRoot` is given. */
export function projectLooks(projects: readonly Project[]) {
  return Object.fromEntries(projects.map((project) => [lookId(project), <ProjectLook key={project.slug} project={project} />]));
}

/**
 * A project's Row, the same on the homepage and in the Work archive: its object, name, line and year, and its closer
 * look. A featured project also has its phone card (the homepage's three; the archive has none).
 */
export function ProjectRow({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <Row
      href={destination(project)}
      object={<ProjectObject project={project} />}
      title={project.name}
      line={thingsIMake.rowOutcomes[project.slug] ?? project.outcome}
      meta={String(project.year)}
      look={{ id: lookId(project), description: metadata(project) }}
      card={featured ? <CardShot project={project} /> : undefined}
      style={projectColours(project)}
    />
  );
}
