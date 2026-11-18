import type { CSSProperties, ReactNode } from "react";

/**
 * A working figure in a long-form page (#462; DESIGN.md "Long-form pages", "Figures"): a slice of a product a visitor
 * can use where the prose says what it does. It is one frame on paper with the project's colour as its accent, the
 * figure inside it, and its caption beneath.
 *
 * `children` is the figure as the server draws it: its starting state, laid out exactly as it will be once it works, so
 * first paint never waits on script and nothing moves when the island takes over. Wrap it in an island made with
 * `lazyIsland` (lazy-island.tsx), which loads the working version as the figure nears the viewport. Without script the
 * frame is not shown at all: `still` is, the picture with its caption that the page carried before. Styles are in
 * story.css.
 */
export function WorkingFigure({ caption, accent, still, children }: { caption: string; accent: string; still: ReactNode; children: ReactNode }) {
  return (
    <>
      <figure className="working-fig" style={{ "--accent": accent } as CSSProperties}>
        <div className="working-fig__frame surface surface--paper">{children}</div>
        <figcaption>{caption}</figcaption>
      </figure>
      <div className="working-fig__still">{still}</div>
    </>
  );
}
