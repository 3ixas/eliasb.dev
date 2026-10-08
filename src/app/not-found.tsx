import type { Metadata } from "next";
import { LazyPrefetchLink } from "@/components/board/lazy-prefetch-link";
import { BoardHeader } from "@/components/board/board-header";
import { BoardFooter } from "@/components/board/footer";
import { Pushpin } from "@/components/board/pin";
import { BoardSurface } from "@/components/board/surface";
import { notFoundPage as copy } from "@/content/not-found";
import { pageTitle } from "@/content/site";

export const metadata: Metadata = {
  title: { absolute: pageTitle(copy.title) },
  description: null,
  alternates: { canonical: null },
  // Not the home page's share card.
  openGraph: null,
  twitter: null,
  // Next.js adds its own noindex to a 404; this overrides the layout's robots,
  // so the two agree.
  robots: { index: false, follow: true },
};

/**
 * The 404: a gap on the linen where something used to be pinned. Its outline
 * is still there, the pin is still in the board, and a torn corner of paper is
 * caught under it.
 */
export default function NotFound() {
  return (
    <>
      <BoardHeader page={null} />
      <BoardSurface
        kind="wall"
        as="main"
        id="main-content"
        tabIndex={-1}
        className="flex justify-center px-4 pt-12 pb-24 sm:px-8 lg:pt-20"
      >
        <div data-light="right" className="board-frame relative w-full max-w-[30rem] rounded-[6px] p-3">
          <BoardSurface kind="linen" className="board-linen relative isolate rounded-paper px-6 pt-8 pb-12 sm:px-10">
            <div aria-hidden="true" className="board-night-dim pointer-events-none absolute inset-0" />

            <div aria-hidden="true" data-not-found-gap className="relative z-10 mx-auto h-[190px] w-[16rem] max-w-full">
              <div className="absolute inset-x-6 top-12 h-[120px] border-[1.5px] border-dashed border-(--not-found-outline)" />
              <div className="board-not-found-scrap absolute top-[3.25rem] left-1/2 h-[26px] w-[34px] bg-paper" />
              <Pushpin className="absolute top-8 left-1/2 -translate-x-1/2" />
              <p className="board-stamp absolute -top-1 right-0 m-0 rotate-[10deg] border-4 px-3 py-0.5 text-[1.75rem] leading-none font-medium tracking-[0.1em]">
                {copy.stamp}
              </p>
            </div>

            <div className="relative z-10 mt-4 text-center text-ink">
              <h1 className="m-0 font-display text-title font-normal sm:text-[2.125rem]">{copy.heading}</h1>
              <p className="mx-auto mt-3 mb-5 max-w-[22rem] text-body leading-normal">{copy.line}</p>
              <LazyPrefetchLink href="/" className="board-focus inline-flex min-h-11 items-center gap-1.5 font-semibold underline underline-offset-4">
                {copy.back} <span aria-hidden="true">{copy.backArrow}</span>
              </LazyPrefetchLink>
            </div>
          </BoardSurface>
        </div>
      </BoardSurface>
      <BoardFooter />
    </>
  );
}
