import type { ReactNode } from "react";
import { Light } from "@/components/board/light";
import { BoardSurface } from "@/components/board/surface";

/**
 * The framed linen pinboard the personal pins hang on. Its three lights hang
 * on the frame: a festoon across the top, a clamp spotlight on the left edge,
 * and fairy lights in the bottom-right corner. At night the linen dims and
 * the lights leave pools and darker gaps; the pins sit above the dimming, on
 * their own paper, so their text keeps its contrast.
 *
 * The festoon's pool is strongest at the top right, so night shadows fall to
 * the left (data-light="right").
 */
export function Pinboard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-light="right" data-pinboard className={`board-frame relative rounded-[6px] p-3 sm:p-4 ${className ?? ""}`}>
      <BoardSurface kind="linen" className="board-linen relative isolate rounded-paper px-4 pt-20 pb-24 sm:px-8 board:px-12">
        <div aria-hidden="true" className="board-night-dim pointer-events-none absolute inset-0" />
        <Light kind="festoon" />
        <Light kind="clamp-spotlight" />
        <Light kind="fairy-lights" />
        <div className="relative z-10 grid grid-cols-1 gap-x-8 gap-y-16 board:grid-cols-12">{children}</div>
      </BoardSurface>
    </div>
  );
}
