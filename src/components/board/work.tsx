import Image from "next/image";
import { IntentLink } from "@/components/board/intent-link";
import { Light } from "@/components/board/light";
import { Pin } from "@/components/board/pin";
import { BoardSurface } from "@/components/board/surface";
import { featuredProjects, work, type HomepageProject } from "@/content/site";

// Label tape is stuck on by hand, each piece a little crooked.
const tapeTilts = ["-rotate-1", "rotate-[0.8deg]", "-rotate-[0.5deg]", "rotate-[0.6deg]"] as const;

/**
 * Work: each featured project is a screenshot clipped to a clipboard, with its
 * description on a sticky note and its technologies on label tape, under its
 * own picture light. Projects alternate sides on wide screens.
 */
export function Work() {
  return (
    <BoardSurface
      kind="wall"
      as="section"
      id="work"
      tabIndex={-1}
      aria-labelledby="work-title"
      className="px-4 pt-16 pb-24 sm:px-8 lg:px-16 lg:pt-24"
    >
      <div className="relative z-10 mx-auto max-w-[1248px]">
        <p className="m-0 font-mono text-label uppercase text-wall-muted">{work.kicker}</p>
        <h2 id="work-title" className="mt-4 mb-0 font-display text-heading font-normal text-wall-ink">
          {work.heading.lead} <em className="text-wall-accent">{work.heading.emphasis}</em>
        </h2>

        <div className="relative mt-12 board:mt-16">
          <div aria-hidden="true" className="board-pinned-grid pointer-events-none absolute inset-0" />
          <ol className="relative m-0 flex list-none flex-col gap-20 p-0 board:gap-28">
            {featuredProjects.map((project, index) => (
              <Project key={project.slug} project={project} flipped={index % 2 === 1} priority={index === 0} />
            ))}
          </ol>
        </div>

        <p className="mt-16 mb-0 text-center">
          <IntentLink
            href="/work"
            className="board-focus inline-flex min-h-11 items-center gap-1 font-semibold text-wall-ink underline decoration-wall-accent decoration-2 underline-offset-4"
          >
            {work.viewAll} <Arrow>→</Arrow>
          </IntentLink>
        </p>
      </div>
    </BoardSurface>
  );
}

function Project({ project, flipped, priority }: { project: HomepageProject; flipped: boolean; priority: boolean }) {
  const folder = `/work/${project.slug}`;

  return (
    <li data-light="above" className="relative pt-18">
      <Light kind="picture-light" />
      <article
        aria-labelledby={`work-${project.slug}`}
        className="relative grid grid-cols-1 items-center gap-y-8 board:grid-cols-12 board:gap-x-6"
      >
        <div className={flipped ? "relative z-10 board:col-span-7 board:col-start-6 board:row-start-1" : "relative z-10 board:col-span-7"}>
          <Pin object="sheet" fixing="clipboard" surface="wall" looseness="careful" tilt={flipped ? 0.35 : -0.3} interactive className="p-3">
            <IntentLink href={folder} aria-label={work.folderLabel(project.name)} className="board-focus block">
              <Image
                src={project.image}
                alt={project.imageAlt}
                width={project.imageWidth}
                height={project.imageHeight}
                sizes="(max-width: 899px) calc(100vw - 64px), min(60vw, 730px)"
                preload={priority}
                className="board-screenshot block h-auto w-full"
              />
            </IntentLink>
          </Pin>
        </div>

        <div
          className={
            flipped
              ? "relative z-30 board:col-span-5 board:col-start-1 board:row-start-1 board:-mr-9"
              : "relative z-30 board:col-span-5 board:col-start-8 board:-ml-9"
          }
        >
          {/*
            Sticky notes sit a little looser than the clipboards, as on the
            canvas, and in front of the picture light's beam; the light falls on
            their paper behind the text (board-lit), so the ink stays solid.
          */}
          <Pin
            object="note"
            fixing="adhesive"
            surface="wall"
            looseness="loose"
            tilt={flipped ? -1 : 1.1}
            stock={project.noteStock}
            interactive
            className="board-lit flex flex-col gap-4 px-8 pt-10 pb-8"
          >
            <p className="m-0 font-mono text-label uppercase">
              {project.index} · {project.eyebrow}
            </p>
            <h3 id={`work-${project.slug}`} className="m-0 font-display text-heading font-normal">
              {project.name}
            </h3>
            {project.thesis && <p className="m-0 font-display text-title italic">{project.thesis}</p>}
            <p className="m-0 font-sans text-lead">{project.description}</p>
            <ul aria-label={work.builtWith} className="m-0 flex list-none flex-wrap gap-2 p-0">
              {project.labelTape.map((technology, tapeIndex) => (
                <li key={technology} className={`board-label-tape ${tapeTilts[tapeIndex % tapeTilts.length]}`}>
                  {technology}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-x-6">
              <IntentLink
                href={folder}
                className="board-focus inline-flex min-h-11 items-center gap-1 font-semibold underline decoration-accent decoration-2 underline-offset-4"
              >
                {work.openFolder} <Arrow>→</Arrow>
              </IntentLink>
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="board-focus inline-flex min-h-11 items-center gap-1 text-muted underline underline-offset-4">
                  {work.live} <Arrow>↗</Arrow>
                </a>
              )}
              <a href={project.codeUrl} target="_blank" rel="noreferrer" className="board-focus inline-flex min-h-11 items-center gap-1 text-muted underline underline-offset-4">
                {work.code} <Arrow>↗</Arrow>
              </a>
            </div>
          </Pin>
        </div>
      </article>
    </li>
  );
}

/** Direction arrows are decoration; the link text carries the meaning. */
function Arrow({ children }: { children: string }) {
  return <span aria-hidden="true">{children}</span>;
}
