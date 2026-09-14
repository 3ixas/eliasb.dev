import { signalFallbacks } from "@/content/signal-fallbacks";
import { getGitHubSignal } from "@/integrations/github";
import { getFantasySignal } from "@/integrations/sleeper";
import type { HomepageSignals } from "@/integrations/types";

export async function getHomepageSignals(): Promise<HomepageSignals> {
  const [github, fantasy] = await Promise.all([getGitHubSignal(), getFantasySignal()]);
  const statusText = process.env.SITE_STATUS?.trim();
  const statusExpiresAt = process.env.SITE_STATUS_EXPIRES_AT;
  const statusIsCurrent = statusText && (
    !statusExpiresAt || Number.isNaN(Date.parse(statusExpiresAt)) || Date.parse(statusExpiresAt) > Date.now()
  );
  const playlistUrl = process.env.SPOTIFY_PLAYLIST_URL?.trim();
  const hasPublicPlaylist = !!playlistUrl && /^https:\/\/open\.spotify\.com\/playlist\//.test(playlistUrl);

  return {
    ...signalFallbacks,
    github,
    fantasy,
    status: statusIsCurrent
      ? {
          state: "curated",
          statusLabel: "Current note",
          headline: statusText,
          description: "London · manually updated",
        }
      : signalFallbacks.status,
    culture: hasPublicPlaylist
      ? {
          state: "curated",
          statusLabel: "Playlist live",
          headline: "The current rotation",
          description: "A manually kept Spotify playlist, surrounded by notes and recent cinema.",
          href: playlistUrl,
        }
      : signalFallbacks.culture,
  };
}
