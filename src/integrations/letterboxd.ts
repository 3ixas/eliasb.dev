import { integrationConfig } from "@/content/integration-config";
import { signalFallbacks } from "@/content/signal-fallbacks";
import { firstImageUrl, rssItems, rssValue } from "@/integrations/rss";
import { trustedHttpsUrl } from "@/integrations/safe-url";
import type { CultureSignal } from "@/integrations/types";

export async function getCultureSignal(): Promise<CultureSignal> {
  try {
    const response = await fetch(integrationConfig.letterboxd.feedUrl, {
      next: { revalidate: 900, tags: ["letterboxd-signal"] },
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) throw new Error(`Letterboxd returned ${response.status}`);

    const [item] = rssItems(await response.text());
    const filmTitle = item && rssValue(item, "letterboxd:filmTitle");
    if (!item || !filmTitle) return signalFallbacks.culture;

    return {
      state: "live",
      statusLabel: "Most recently watched",
      headline: filmTitle,
      description: "The latest film logged in my Letterboxd diary.",
      href: integrationConfig.spotify.playlistUrl,
      filmTitle,
      filmYear: rssValue(item, "letterboxd:filmYear"),
      filmRating: rssValue(item, "letterboxd:memberRating"),
      filmDescription: "The latest film in my diary. I keep the rating and notes on Letterboxd.",
      filmPosterUrl: trustedHttpsUrl(firstImageUrl(item), ["a.ltrbxd.com"]),
      filmHref: trustedHttpsUrl(rssValue(item, "link"), ["letterboxd.com", "www.letterboxd.com"]) ?? integrationConfig.letterboxd.profileUrl,
      playlistHref: integrationConfig.spotify.playlistUrl,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return signalFallbacks.culture;
  }
}
