import { signalFallbacks } from "@/content/signal-fallbacks";
import { integrationConfig } from "@/content/integration-config";
import { getGitHubSignal } from "@/integrations/github";
import { getReadingSignal } from "@/integrations/goodreads";
import { getCultureSignal } from "@/integrations/letterboxd";
import { getFantasySignal } from "@/integrations/sleeper";
import type { HomepageSignals } from "@/integrations/types";

export async function getHomepageSignals(): Promise<HomepageSignals> {
  const [github, fantasy, reading, culture] = await Promise.all([
    getGitHubSignal(),
    getFantasySignal(),
    getReadingSignal(),
    getCultureSignal(),
  ]);
  const statusText = integrationConfig.status.message;
  const statusExpiresAt = integrationConfig.status.expiresAt;
  const statusIsCurrent = statusText && (
    !statusExpiresAt || Number.isNaN(Date.parse(statusExpiresAt)) || Date.parse(statusExpiresAt) > Date.now()
  );
  return {
    ...signalFallbacks,
    github,
    fantasy,
    reading,
    culture,
    status: statusIsCurrent
      ? {
          state: "curated",
          statusLabel: "Current note",
          headline: statusText,
          description: "London · manually updated",
        }
      : signalFallbacks.status,
  };
}
