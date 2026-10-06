import { BoardSurface } from "@/components/board/surface";
import { contact } from "@/content/contact";

/** The footer: the wooden frame's bottom edge, and my signature. */
export function BoardFooter() {
  return (
    <BoardSurface kind="wall" as="footer" className="relative px-4 pt-14 pb-16 sm:px-8 lg:px-16">
      <div aria-hidden="true" className="board-frame-edge absolute inset-x-4 top-0 h-5.5 rounded-b-[6px] sm:inset-x-8 lg:inset-x-14" />
      <p className="relative mx-auto my-0 max-w-[1248px] font-display text-lead italic text-wall-ink">{contact.footer}</p>
    </BoardSurface>
  );
}
