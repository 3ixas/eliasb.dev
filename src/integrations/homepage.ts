import { signalFallbacks } from "@/content/signal-fallbacks";
import { getGitHubSignal } from "@/integrations/github";
import { getFantasySignal } from "@/integrations/sleeper";
import { getTrainingSignal } from "@/integrations/strava";
import type { HomepageSignals } from "@/integrations/types";

export async function getHomepageSignals(): Promise<HomepageSignals> {
  const [github, fantasy, training] = await Promise.all([
    getGitHubSignal(),
    getFantasySignal(),
    getTrainingSignal(),
  ]);
  return {
    ...signalFallbacks,
    github,
    fantasy,
    training,
  };
}
