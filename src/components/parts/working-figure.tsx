import type { CSSProperties, ReactNode } from "react";
import type { PanelColours } from "@/content/stretch/story";

/**
 * A working figure in a long-form page (#462; DESIGN.md "Long-form pages", "Figures"): a slice of a product a visitor
 * can use where the prose says what it does. It is a lit surface of paper tinted with the project's colour, rising off
 * the page like every panel, with the figure inside it and its caption beneath. The project's full colour is only on
 * what a visitor presses: the figure's controls take `.working-fig__control`, a raised key in the project's field and
 * ink (story.css), so the figure never melts into the project's own full-colour panels around it.
 *
 * `children` is the figure as the server draws it: its starting state, laid out exactly as it will be once it works, so
 * first paint never waits on script and nothing moves when the island takes over. Wrap it in an island made with
 * `lazyIsland` (lazy-island.tsx), which loads the working version as the figure nears the viewport. Without script the
 * frame is not shown at all: `still` is, the picture with its caption that the page carried before. A figure with no
 * `still` (Flowtime's break, #464) shows its drawing without script, held at its start. Styles are in story.css.
 */
export function WorkingFigure({ caption, colours, still, children }: { caption: string; colours: PanelColours; still?: ReactNode; children: ReactNode }) {
  return (
    <>
      <figure className="working-fig" data-still={still ? "" : undefined} style={{ "--project": colours.field, "--project-ink": colours.ink } as CSSProperties}>
        <div className="working-fig__frame surface surface--paper">{children}</div>
        <figcaption>{caption}</figcaption>
      </figure>
      {still && <div className="working-fig__still">{still}</div>}
    </>
  );
}
