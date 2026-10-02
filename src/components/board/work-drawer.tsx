import Link from "next/link";
import { BoardHeader } from "@/components/board/board-header";
import { BoardSurface } from "@/components/board/surface";
import { caseFiles, caseFileSlugs, drawer } from "@/content/case-files";

// Folders in a drawer are each a slightly different manila, darker towards the
// back, with their tabs staggered so every name shows. Phones stagger less, so
// the tabs still fit.
const manila = ["bg-(--manila-3)", "bg-(--manila-2)", "bg-(--manila-1)"] as const;
const tabAt = ["left-0 board:left-[4%]", "left-6 board:left-[36%]", "left-12 board:left-[68%]"] as const;

/**
 * The work archive: an open filing drawer with a manila folder for each case
 * study. Each folder opens its case file, and each case file leads back here.
 */
export function WorkDrawer() {
  return (
    <>
      <BoardHeader page="work" />
      <BoardSurface
        kind="wall"
        as="main"
        id="main-content"
        tabIndex={-1}
        className="px-4 pt-10 pb-24 sm:px-8 lg:px-16 lg:pt-16"
      >
        <div className="mx-auto max-w-[960px]">
          <Link
            href={drawer.backToBoardHref}
            className="board-focus inline-flex min-h-11 items-center gap-1 font-semibold text-wall-muted underline decoration-wall-accent decoration-2 underline-offset-4"
          >
            <span aria-hidden="true">←</span> {drawer.backToBoard}
          </Link>
          <p className="mt-8 mb-0 font-mono text-label uppercase text-wall-muted">{drawer.kicker(caseFileSlugs.length)}</p>
          <h1 className="mt-4 mb-0 font-display text-display font-normal text-wall-ink">
            {drawer.heading.lead} <em className="text-wall-accent">{drawer.heading.emphasis}</em>
          </h1>
          <p className="mt-6 mb-0 max-w-[560px] text-lead text-wall-ink">{drawer.intro}</p>

          {/*
            The cabinet the drawer slides out of, the open drawer with its
            walls and back panel, the folders filed upright in it (each one in
            front of the last, so only its top shows), and the drawer's front.
          */}
          <div className="board-cabinet mt-16">
            <div aria-hidden="true" className="board-cabinet-rail" />
            <div className="board-drawer">
              <ol className="relative m-0 flex list-none flex-col p-0 pt-12">
                {caseFileSlugs.map((slug, index) => {
                  const file = caseFiles[slug];
                  return (
                    <li key={slug} className={index === 0 ? "" : "-mt-6"}>
                      <article
                        aria-labelledby={`folder-${slug}`}
                        className={`board-manila board-lifts relative rounded-t-[4px] ${manila[index % manila.length]} px-5 pt-6 ${index === caseFileSlugs.length - 1 ? "pb-8" : "pb-14"} text-ink sm:px-8`}
                      >
                        <div className={`absolute -top-9 h-10 rounded-t-md px-3 pt-2 ${tabAt[index % tabAt.length]} ${manila[index % manila.length]}`}>
                          <h2 id={`folder-${slug}`} className="m-0 text-body font-normal">
                            <span className="board-label-tape">{file.name}</span>
                          </h2>
                        </div>
                        <p className="m-0 font-mono text-label uppercase">
                          {drawer.folderNumber(file.number)} · {file.kicker}
                        </p>
                        <p className="mt-3 mb-0 font-display text-title italic">{file.thesis}</p>
                        <Link
                          href={`/work/${slug}`}
                          aria-label={drawer.folderLabel(file.name)}
                          className="board-focus mt-4 inline-flex min-h-11 items-center gap-1 font-semibold underline decoration-accent decoration-2 underline-offset-4 after:absolute after:inset-0 after:content-['']"
                        >
                          {drawer.openFolder} <span aria-hidden="true">→</span>
                        </Link>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </div>
            {/* The front: a raised panel with a label card and a handle. */}
            <div aria-hidden="true" className="board-drawer-front">
              <span className="board-drawer-label">{drawer.label}</span>
              <span className="board-drawer-handle" />
            </div>
          </div>
        </div>
      </BoardSurface>
    </>
  );
}
