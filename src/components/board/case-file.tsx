import Image from "next/image";
import { IntentLink } from "@/components/board/intent-link";
import { BoardHeader } from "@/components/board/board-header";
import { Pin } from "@/components/board/pin";
import { BoardSurface } from "@/components/board/surface";
import { caseFileCopy as copy, caseFileTabs, type CaseFile, type CaseFileSection } from "@/content/case-files";

const tabStocks = {
  terracotta: "bg-stock-terracotta",
  sage: "bg-stock-sage",
  blueprint: "bg-stock-blueprint",
  ochre: "bg-stock-ochre",
} as const;

/**
 * A case study as an opened kraft case-file folder: the project's name on the
 * folder tab, a stamped number, coloured divider tabs on the edge that jump
 * to each section, and a sheet of paper inside with the thesis on a sticky
 * note and a paperclipped screenshot. Below 900 px the divider tabs sit in a
 * row inside the sheet.
 */
export function CaseFilePage({ file }: { file: CaseFile }) {
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
        <article aria-labelledby="case-file-title" className="relative mx-auto max-w-[1248px] board:pr-16">
          {/* The folder's own tab carries the name in label tape; the h1 says it for everyone. */}
          <div aria-hidden="true" className="board-folder inline-flex h-12 items-center rounded-t-board px-4 board:w-[300px]">
            <span className="board-label-tape">{file.name}</span>
          </div>

          <div className="board-folder relative rounded-b-board rounded-tr-board p-2 shadow-pin sm:p-4 board:p-6">
            <div data-board-surface="paper" className="board-folder-sheet rounded-paper bg-paper py-8 pr-5 pl-10 text-ink sm:pr-8 sm:pl-16 board:px-14 board:py-12">
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <BackToDrawer />
                <p className="board-stamp m-0 -rotate-3 board:-rotate-[8deg]">
                  {copy.stamp} {file.number}
                </p>
              </div>

              <header className="mt-6 grid grid-cols-1 gap-12 board:grid-cols-[1.05fr_1fr] board:items-center">
                <div className="flex min-w-0 flex-col gap-5">
                  <p className="m-0 font-mono text-label uppercase text-muted">{file.kicker}</p>
                  <h1 id="case-file-title" className="m-0 font-display text-display font-normal">
                    {file.name}
                  </h1>
                  <Pin
                    object="note"
                    fixing="adhesive"
                    surface="paper"
                    looseness="loose"
                    tilt={-1.5}
                    stock={file.noteStock}
                    className="max-w-[380px] self-start px-6 pt-9 pb-5"
                  >
                    <p className="m-0 font-display text-title italic">{file.thesis}</p>
                  </Pin>
                  <p className="m-0 max-w-[470px] text-lead">{file.summary}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    {file.liveUrl && (
                      <a href={file.liveUrl} target="_blank" rel="noreferrer" className="board-stamp-button board-stamp-button-solid">
                        {copy.live} <Arrow>↗</Arrow>
                      </a>
                    )}
                    <a href={file.codeUrl} target="_blank" rel="noreferrer" className="board-stamp-button board-stamp-button-outline">
                      {copy.code} <Arrow>↗</Arrow>
                    </a>
                    {file.codeNote && <p className="m-0 text-small text-muted">{file.codeNote}</p>}
                  </div>
                </div>

                <div className="min-w-0">
                  <figure className="m-0">
                    <Pin object="photo" fixing="clip" surface="paper" looseness="loose" tilt={2} stock="photo" fixingAt={8} className="p-3">
                      <Image
                        src={file.screenshot.src}
                        alt={file.screenshot.alt}
                        width={file.screenshot.width}
                        height={file.screenshot.height}
                        sizes="(max-width: 899px) calc(100vw - 96px), 540px"
                        preload
                        className="board-screenshot block h-auto w-full"
                      />
                    </Pin>
                    <figcaption className="mt-5 -rotate-2 font-display text-lead italic text-muted">
                      <Arrow>↑</Arrow> {file.screenshot.note}
                    </figcaption>
                  </figure>
                  <ul aria-label={copy.builtWith} className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
                    {file.labelTape.map((technology) => (
                      <li key={technology} className="board-label-tape -rotate-1">
                        {technology}
                      </li>
                    ))}
                  </ul>
                </div>
              </header>

              <DividerTabs />

              <div className="mt-10 flex flex-col gap-20 board:mt-24">
                {file.sections.map((section) => (
                  <Section key={section.id} section={section} />
                ))}
              </div>

              <p className="mt-20 mb-0">
                <BackToDrawer />
              </p>
            </div>
          </div>
        </article>
      </BoardSurface>
    </>
  );
}

/**
 * The divider tabs. On wide screens they stick out of the folder's right edge
 * and follow the reader down the page; on phones they are a row in the sheet.
 */
function DividerTabs() {
  return (
    <nav
      aria-label={copy.tabsLabel}
      className="mt-12 board:absolute board:top-[120px] board:bottom-6 board:left-full board:mt-0 board:w-14"
    >
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0 board:sticky board:top-28 board:flex-col board:gap-3">
        {caseFileTabs.map((tab) => (
          <li key={tab.id}>
            <a
              href={`#${tab.id}`}
              className={`board-divider-tab ${tabStocks[tab.stock]} board-focus inline-flex min-h-11 items-center px-3 font-mono text-label uppercase text-ink no-underline`}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Section({ section }: { section: CaseFileSection }) {
  const tab = caseFileTabs.find(({ id }) => id === section.id)!;
  return (
    <section id={section.id} aria-labelledby={`${section.id}-title`} className="max-w-[68ch] scroll-mt-28">
      <p className="m-0 flex items-center gap-2 font-mono text-label uppercase text-muted">
        <span aria-hidden="true" className={`inline-block size-3 rounded-paper ${tabStocks[tab.stock]}`} />
        {tab.label}
      </p>
      <h2 id={`${section.id}-title`} className="mt-3 mb-0 font-display text-heading font-normal">
        {section.heading}
      </h2>
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph} className="mt-5 mb-0 text-lead">
          {paragraph}
        </p>
      ))}
      {section.points && (
        <ul className="mt-6 mb-0 flex list-none flex-col gap-5 p-0">
          {section.points.map((point) => (
            <li key={point.lead} className="text-lead">
              <strong className="font-semibold">{point.lead}</strong> {point.text}
            </li>
          ))}
        </ul>
      )}
      {section.figure && (
        <figure className="mx-0 mt-10 mb-0">
          <Pin object="photo" fixing="clip" surface="paper" looseness="careful" tilt={0.4} stock="photo" fixingAt={6} className="p-3">
            <Image
              src={section.figure.src}
              alt={section.figure.alt}
              width={section.figure.width}
              height={section.figure.height}
              sizes="(max-width: 899px) calc(100vw - 96px), 720px"
              className="board-screenshot block h-auto w-full"
            />
          </Pin>
          <figcaption className="mt-4 font-display text-body italic text-muted">{section.figure.caption}</figcaption>
        </figure>
      )}
    </section>
  );
}

function BackToDrawer() {
  return (
    <IntentLink
      href={copy.backToDrawerHref}
      className="board-focus inline-flex min-h-11 items-center gap-1 font-semibold text-muted underline decoration-accent decoration-2 underline-offset-4"
    >
      <Arrow>←</Arrow> {copy.backToDrawer}
    </IntentLink>
  );
}

/** Direction arrows are decoration; the text carries the meaning. */
function Arrow({ children }: { children: string }) {
  return <span aria-hidden="true">{children}</span>;
}
