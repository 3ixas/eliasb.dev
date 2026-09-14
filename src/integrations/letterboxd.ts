import { integrationConfig } from "@/content/integration-config";
import { signalFallbacks } from "@/content/signal-fallbacks";
import { firstImageUrl, rssItems, rssValue } from "@/integrations/rss";
import type { CultureSignal } from "@/integrations/types";

export async function getCultureSignal(): Promise<CultureSignal> {
  try {
    const response = await fetch(integrationConfig.letterboxd.feedUrl, {
      next: { revalidate: 21600, tags: ["letterboxd-signal"] },
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) throw new Error(`Letterboxd returned ${response.status}`);

    const [item] = rssItems(await response.text());
    const filmTitle = item && rssValue(item, "letterboxd:filmTitle");
    if (!item || !filmTitle) return signalFallbacks.culture;

    return {
      state: "live",
      statusLabel: "Culture live",
      headline: filmTitle,
      description: "Latest film, beside the playlist I’m keeping in rotation.",
      href: integrationConfig.spotify.playlistUrl,
      filmTitle,
      filmYear: rssValue(item, "letterboxd:filmYear"),
      filmRating: rssValue(item, "letterboxd:memberRating"),
      filmPosterUrl: firstImageUrl(item),
      filmHref: rssValue(item, "link") ?? integrationConfig.letterboxd.profileUrl,
      playlistHref: integrationConfig.spotify.playlistUrl,
    };
  } catch {
    return signalFallbacks.culture;
  }
}
