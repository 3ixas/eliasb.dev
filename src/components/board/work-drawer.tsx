import Link from "next/link";
import { BoardHeader } from "@/components/board/board-header";
import { BoardSurface } from "@/components/board/surface";
import { caseFiles, caseFileSlugs, drawer } from "@/content/case-files";

// Folders in a drawer are each a slightly different manila, with their tabs
// staggered so every name shows. Phones stagger less, so the tabs still fit.
const manila = ["bg-(--manila-1)", "bg-(--manila-2)", "bg-(--manila-3)"] as const;
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

          <div className="board-drawer mt-16 rounded-b-board shadow-pin">
            <ol className="m-0 flex list-none flex-col gap-14 px-3 pt-14 pb-6 sm:px-6">
              {caseFileSlugs.map((slug, index) => {
                const file = caseFiles[slug];
                return (
                  <li key={slug}>
                    <article
                      aria-labelledby={`folder-${slug}`}
                      className={`board-manila board-lifts relative rounded-t-[4px] ${manila[index % manila.length]} px-5 pt-6 pb-6 text-ink sm:px-8`}
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
            {/* The drawer's front, with its label holder and handle. */}
            <div aria-hidden="true" className="board-drawer-front flex h-24 items-center justify-center gap-6 rounded-b-board">
              <span className="board-drawer-label" />
              <span className="board-drawer-handle" />
            </div>
          </div>
        </div>
      </BoardSurface>
    </>
  );
}
