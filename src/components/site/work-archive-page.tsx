import { OnView } from "@/components/parts/on-view";
import { ProjectPanel } from "@/components/parts/project-panel";
import { LongForm } from "@/components/site/long-form";
import { WorkArchiveList } from "@/components/site/work-archive";
import { projectIndex, type Project } from "@/content/projects";
import { workArchive } from "@/content/stretch/site-copy";

/** How many panels can show before any scrolling, whose screenshots must not arrive late. */
const FIRST_SCREEN = 3;

/**
 * The Work archive (DESIGN.md "The Work archive", R-23): the shared header, "Things I make" as the `h1` with its note
 * beneath, then every project as a panel, newest first, three across. The server renders all of it.
 */
export function WorkArchivePage({ catalogue }: { catalogue: readonly Project[] }) {
  const ordered = projectIndex(catalogue, []);
  return (
    <LongForm attrs={{ "data-work-archive": "" }}>
      <section className="frame archive" aria-labelledby="work-archive-title">
        <h1 id="work-archive-title" className="archive__title">
          {workArchive.heading}
        </h1>
        <p className="archive__note">{workArchive.note}</p>
        <WorkArchiveList
          items={ordered.map((project, index) => ({
            slug: project.slug,
            category: project.category,
            panel: (
              <li>
                <OnView motion="rise" className="archive__arrival">
                  <ProjectPanel project={project} line={project.outcome} level={2} meta eager={index < FIRST_SCREEN} />
                </OnView>
              </li>
            ),
          }))}
        />
      </section>
    </LongForm>
  );
}
