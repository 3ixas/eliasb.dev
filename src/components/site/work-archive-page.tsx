import { SubpageHeader } from "@/components/site/subpage-header";
import { WorkArchive } from "@/components/site/work-archive";
import type { Project } from "@/content/projects";
import { siteCopy, workArchive } from "@/content/stretch/site-copy";

/**
 * The /work page (docs/specs/STRETCH-REDESIGN-SPEC.md, "Case studies and the
 * archive"): the slim header, the heading and note, and every project in the
 * catalogue as Project index rows, newest first. Like a case study it has no
 * entrance and no cobalt beyond focus, selection and hover.
 */
export function WorkArchivePage({ catalogue }: { catalogue: readonly Project[] }) {
  return (
    <div data-stretch-shell data-work-archive>
      <SubpageHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="stretch-wrap stretch-section stretch-archive" aria-labelledby="work-archive-title">
          <div className="stretch-section__head">
            <h1 id="work-archive-title" className="stretch-display stretch-h2">
              {workArchive.heading}
            </h1>
            <p className="stretch-mono stretch-note">{workArchive.note}</p>
          </div>
          <WorkArchive catalogue={catalogue} />
        </section>
      </main>
      <footer className="stretch-wrap stretch-footer">
        <p className="stretch-mono">{siteCopy.footer}</p>
      </footer>
    </div>
  );
}
