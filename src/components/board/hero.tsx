import Image from "next/image";
import { Light } from "@/components/board/light";
import { openingScript } from "@/components/board/opening";
import { Pin } from "@/components/board/pin";
import { BoardSurface } from "@/components/board/surface";
import { hero } from "@/content/site";

/**
 * The hero: the headline card pinned to the wall beside the portrait.
 * The opening types a decorative copy over the heading; the heading itself
 * is always the server-rendered sentence (see opening.ts).
 */
export function Hero() {
  return (
    <BoardSurface
      kind="wall"
      as="section"
      aria-labelledby="hero-title"
      data-light="right"
      className="relative overflow-hidden px-4 pt-10 pb-16 sm:px-8 lg:px-16 lg:pt-14 lg:pb-24"
    >
      <Light kind="desk-lamp" />
      <div className="relative z-10 mx-auto grid max-w-[1312px] grid-cols-1 gap-x-8 gap-y-10 board:grid-cols-12">
        <p className="font-mono text-label uppercase text-wall-muted board:col-span-12 board:px-4">{hero.kicker}</p>

        <div className="board:col-span-8" data-opening-card>
          <Pin object="card" fixing="pushpin" surface="wall" looseness="careful" tilt={-0.4} className="px-6 py-10 sm:px-12 sm:py-14 lg:px-16">
            <h1 id="hero-title" className="relative m-0 font-display text-display font-normal text-balance">
              <span data-opening-source data-opening-lead>
                {hero.headline.lead}
              </span>{" "}
              <span data-opening-source data-opening-emphasis className="relative inline-block isolate">
                <em className="text-accent">{hero.headline.emphasis}</em>
                <svg
                  aria-hidden="true"
                  data-highlight
                  viewBox="0 0 400 40"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 -left-[2%] -z-10 h-[0.36em] w-[104%]"
                >
                  <path
                    d="M6 26 C 80 17, 170 31, 250 21 S 360 15, 394 25"
                    stroke="var(--pushpin)"
                    strokeOpacity="0.35"
                    strokeWidth="17"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              {/* Filled by the opening script before hydration; React leaves its contents alone. */}
              <span
                aria-hidden="true"
                data-opening-layer
                className="pointer-events-none absolute inset-0"
                dangerouslySetInnerHTML={{ __html: "" }}
                suppressHydrationWarning
              />
            </h1>
          </Pin>
        </div>

        <div className="mx-auto w-full max-w-[200px] board:max-w-[268px] board:col-span-3 board:col-start-10 board:mt-8">
          <Pin object="photo" fixing="tape" surface="wall" looseness="loose" tilt={3} stock="photo" className="px-3 pt-3 pb-5">
            <Image
              src="/profile/elias-evening.webp"
              alt={hero.portrait.alt}
              width={244}
              height={244}
              sizes="244px"
              className="block aspect-square h-auto w-full object-cover object-[50%_18%]"
            />
            <p className="mt-4 font-mono text-label uppercase text-muted">{hero.portrait.caption}</p>
          </Pin>
        </div>

        <div className="board:col-span-7 board:px-4">
          <p className="m-0 max-w-[40rem] font-sans text-lead text-wall-muted">{hero.supportingLine}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2">
            <a
              href="#work"
              className="board-focus inline-flex min-h-11 items-center gap-1 font-semibold text-wall-ink underline decoration-wall-accent decoration-2 underline-offset-4"
            >
              {hero.links.work} <span aria-hidden="true">{hero.links.workArrow}</span>
            </a>
            <a
              href={hero.links.emailHref}
              className="board-focus inline-flex min-h-11 items-center gap-1 font-medium text-wall-muted underline underline-offset-4"
            >
              {hero.links.email} <span aria-hidden="true">{hero.links.emailArrow}</span>
            </a>
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: openingScript }} />
    </BoardSurface>
  );
}
