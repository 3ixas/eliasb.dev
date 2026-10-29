import { ProjectRow, projectLooks } from "@/components/quiet/project-rows";
import { LongForm, LongFormOpening } from "@/components/site/long-form";
import { WorkArchiveList } from "@/components/site/work-archive";
import { projectIndex, type Project } from "@/content/projects";
import { workArchive } from "@/content/stretch/site-copy";

/**
 * The Work archive (docs/design/DESIGN.md, "The Work archive"): the homepage's Things I make, unabridged. The
 * shared header with no links, "Things I make" as the `h1` in the opening line's treatment with its note beneath,
 * then every project in the catalogue as the homepage's rows, newest first, with the same closer looks. The server
 * renders all of it.
 */
export function WorkArchivePage({ catalogue }: { catalogue: readonly Project[] }) {
  const ordered = projectIndex(catalogue, []);
  return (
    <LongForm attrs={{ "data-work-archive": "" }}>
      <section className="stretch-wrap qi-long" aria-labelledby="work-archive-title">
        <div className="qi-column">
          <LongFormOpening titleId="work-archive-title" title={workArchive.heading} line={workArchive.note} />
          <WorkArchiveList looks={projectLooks(ordered)} items={ordered.map((project) => ({ slug: project.slug, category: project.category, row: <ProjectRow project={project} /> }))} />
        </div>
      </section>
    </LongForm>
  );
}
