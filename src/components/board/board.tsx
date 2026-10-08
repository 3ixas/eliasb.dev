import { ClippingPin } from "@/components/board/clipping";
import { CultureCorner } from "@/components/board/culture-corner";
import { TrainingPin } from "@/components/board/training-log";
import { GitHubPin } from "@/components/board/github-pin";
import { MakingPin } from "@/components/board/making-pin";
import { Pinboard } from "@/components/board/pinboard";
import { BoardSurface } from "@/components/board/surface";
import { board } from "@/content/board";
import { getReadingSignal } from "@/integrations/goodreads";
import { getCachedHistorySignal } from "@/integrations/history-cache";
import { getGitHubSignal, getLatestRepositorySignal } from "@/integrations/github";
import { getFilmSignal } from "@/integrations/letterboxd";

/**
 * The Board: the personal section, a framed linen pinboard on the wall.
 * The Weekly Curiosity, Making and training, the culture corner, and the
 * GitHub year across the bottom.
 */
export async function Board() {
  const now = new Date();
  const [history, reading, film, github, latest] = await Promise.all([
    getCachedHistorySignal(),
    getReadingSignal(),
    getFilmSignal(),
    getGitHubSignal(),
    getLatestRepositorySignal(),
  ]);

  return (
    <BoardSurface
      kind="wall"
      as="section"
      id="outside-work"
      tabIndex={-1}
      aria-labelledby="outside-work-title"
      className="px-4 pt-16 pb-24 sm:px-8 lg:px-16 lg:pt-24"
    >
      <div className="relative z-10 mx-auto max-w-[1248px]">
        <p className="m-0 font-mono text-label uppercase text-wall-muted">{board.kicker}</p>
        <h2 id="outside-work-title" className="mt-4 mb-0 font-display text-heading font-normal text-wall-ink">
          {board.heading.lead} <em className="text-wall-accent">{board.heading.emphasis}</em>
        </h2>
        <Pinboard className="mt-12 board:mt-16">
          <ClippingPin history={history} now={now} />
          {/* Making above the training photo, in the middle columns. */}
          <div className="mx-auto flex w-full max-w-[320px] flex-col gap-16 board:col-span-3 board:max-w-none">
            <MakingPin latest={latest} now={now} />
            <TrainingPin now={now} />
          </div>
          <CultureCorner reading={reading} film={film} now={now} />
          <GitHubPin github={github} now={now} />
        </Pinboard>
      </div>
    </BoardSurface>
  );
}
