import { signalFallbacks } from "@/content/signal-fallbacks";
import { getGitHubSignal } from "@/integrations/github";
import { getTrainingSignal } from "@/integrations/strava";
import type { HomepageSignals } from "@/integrations/types";

export async function getHomepageSignals(): Promise<HomepageSignals> {
  const [github, training] = await Promise.all([getGitHubSignal(), getTrainingSignal()]);
  return { ...signalFallbacks, github, training };
}
