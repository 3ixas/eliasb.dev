import Image from "next/image";
import type { CSSProperties } from "react";
import { Journey } from "@/components/board/journey";
import { Light } from "@/components/board/light";
import { Pin } from "@/components/board/pin";
import { BoardSurface } from "@/components/board/surface";
import { about } from "@/content/about";

/**
 * About: my story in my own words, beside the grey-jumper polaroid, with the
 * journey on red string below it. A candle on a small shelf by the heading is
 * the section's light: unlit by day, lit at night.
 */
export function About() {
  return (
    <BoardSurface
      kind="wall"
      as="section"
      id="about"
      tabIndex={-1}
      aria-labelledby="about-title"
      data-light="left"
      className="px-4 pt-16 pb-24 sm:px-8 lg:px-16 lg:pt-24"
    >
      <div className="relative z-10 mx-auto grid max-w-[1248px] gap-x-12 gap-y-16 board:grid-cols-12">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8 board:col-span-12">
          <div>
            <p className="m-0 font-mono text-label uppercase text-wall-muted">{about.kicker}</p>
            <h2 id="about-title" className="mt-4 mb-0 font-display text-heading font-normal text-wall-ink">
              {about.heading.lead} <em className="text-wall-accent">{about.heading.emphasis}</em>
            </h2>
          </div>
          <div className="mr-auto mb-12 board:mr-[22%]">
            <Light kind="candle" />
          </div>
        </div>

        <div className="board-about-story max-w-[62ch] font-display text-lead text-wall-ink board:col-span-7">
          {about.story.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="m-0 mb-5 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-col items-center gap-16 board:col-span-5">
          <div className="board-sway w-full max-w-[300px]" style={{ "--sway-depth": 0.6 } as CSSProperties}>
            <Pin object="photo" fixing="tape" surface="wall" looseness="loose" tilt={2.5} stock="photo" className="p-3 pb-5">
              <Image
                src={about.photo.src}
                alt={about.photo.alt}
                width={about.photo.width}
                height={about.photo.height}
                sizes="276px"
                className="block aspect-[276/330] h-auto w-full object-cover object-[50%_30%]"
              />
            </Pin>
          </div>
          <Journey />
        </div>
      </div>
    </BoardSurface>
  );
}
