import { ArrivalImage } from "@/components/site/arrival-image";
import { projectColours } from "@/components/quiet/project-object";
import type { Project } from "@/content/projects";

/**
 * A project's closer look as the quiet index drew it: its screenshot sliding in on its Project colour, then its type and
 * year. Things I make and the archive are panels now (#415); only /fixtures/materials still shows it, until #420.
 */
export function ProjectLook({ project }: { project: Project }) {
  const { screenshot } = project;
  return (
    <figure className="qi-project" style={projectColours(project)}>
      {screenshot && <ArrivalImage src={screenshot.src} alt="" width={screenshot.width} height={screenshot.height} sizes="300px" />}
      <figcaption className="stretch-mono">{`${project.type} · ${project.year}`}</figcaption>
    </figure>
  );
}
