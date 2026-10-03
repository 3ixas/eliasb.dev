import { signalFallbacks } from "@/content/signal-fallbacks";
import { getGitHubSignal } from "@/integrations/github";
import type { HomepageSignals } from "@/integrations/types";

export async function getHomepageSignals(): Promise<HomepageSignals> {
  const github = await getGitHubSignal();
  return { ...signalFallbacks, github };
}
