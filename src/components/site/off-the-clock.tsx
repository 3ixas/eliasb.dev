import { BookCell, FilmCell, GitHubCell, HistoryCell, OffTheClockPanel } from "@/components/site/off-the-clock-cells";
import { TrainingCell } from "@/components/site/training-today";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { getGitHubSignal, getLatestRepositorySignal } from "@/integrations/github";
import { getReadingSignal } from "@/integrations/goodreads";
import { getCachedHistorySignal } from "@/integrations/history-cache";
import { getFilmSignal } from "@/integrations/letterboxd";

/**
 * Off the clock (DESIGN.md "The homepage, in order" 7, R-19): its title, then one paper panel. It reads the live signals,
 * each of which falls back to written copy (R-30), so the panel keeps its shape whatever the feeds do.
 */
export async function OffTheClock() {
  const now = new Date();
  const [history, reading, film, latest, github] = await Promise.all([
    getCachedHistorySignal(),
    getReadingSignal(),
    getFilmSignal(),
    getLatestRepositorySignal(),
    getGitHubSignal(),
  ]);
  return (
    <section id="off-the-clock" className="frame section" aria-labelledby="off-the-clock-heading">
      <h2 id="off-the-clock-heading" className="section__title">
        {offTheClock.heading}
      </h2>
      <OffTheClockPanel
        training={<TrainingCell />}
        book={<BookCell reading={reading} now={now} />}
        film={<FilmCell signal={film} now={now} />}
        history={<HistoryCell history={history} />}
        year={<GitHubCell github={github} latest={latest} now={now} />}
      />
    </section>
  );
}
