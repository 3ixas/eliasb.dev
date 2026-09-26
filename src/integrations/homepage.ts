import { signalFallbacks } from "@/content/signal-fallbacks";
import { getGitHubSignal } from "@/integrations/github";
import { getReadingSignal } from "@/integrations/goodreads";
import { getCultureSignal } from "@/integrations/letterboxd";
import { getFantasySignal } from "@/integrations/sleeper";
import { getTrainingSignal } from "@/integrations/strava";
import type { HomepageSignals } from "@/integrations/types";

export async function getHomepageSignals(): Promise<HomepageSignals> {
  const [github, fantasy, reading, culture, training] = await Promise.all([
    getGitHubSignal(),
    getFantasySignal(),
    getReadingSignal(),
    getCultureSignal(),
    getTrainingSignal(),
  ]);
  return {
    ...signalFallbacks,
    github,
    fantasy,
    reading,
    culture,
    training,
  };
}
