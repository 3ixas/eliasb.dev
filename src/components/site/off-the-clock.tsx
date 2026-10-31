import { bookEntry, filmEntry, githubEntry, historyEntry, makingEntry, OffTheClockList, trainingEntry } from "@/components/quiet/off-the-clock";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { getGitHubSignal, getLatestRepositorySignal } from "@/integrations/github";
import { getReadingSignal } from "@/integrations/goodreads";
import { getCachedHistorySignal } from "@/integrations/history-cache";
import { getFilmSignal } from "@/integrations/letterboxd";

/** The live version: reads the signals, each of which falls back to written copy. */
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
    <OffTheClockList entries={[githubEntry(github, now), trainingEntry(), bookEntry(reading, now), filmEntry(film, now), historyEntry(history), makingEntry(latest)]}>
      <h2 id="off-the-clock-heading" className="qi-title">
        {offTheClock.heading}
      </h2>
      <p className="qi-note-line">{offTheClock.note}</p>
    </OffTheClockList>
  );
}
