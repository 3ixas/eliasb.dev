import { unstable_cache } from "next/cache";
import { integrationConfig } from "@/content/integration-config";
import { firstImageUrl, rssItems, rssValue } from "@/integrations/rss";
import { trustedHttpsUrl } from "@/integrations/safe-url";
import { filmFromLetterboxd } from "@/integrations/signal-mappers";
import type { FilmSignal } from "@/integrations/types";

const { feedUrl, profileUrl } = integrationConfig.letterboxd;

// Throwing keeps Next's last successful fetch during revalidation, so a
// Letterboxd outage never replaces the film with an empty diary.
const fetchFilm = unstable_cache(
  async (): Promise<FilmSignal> => {
    const response = await fetch(feedUrl, { signal: AbortSignal.timeout(3500) });
    if (!response.ok) throw new Error(`Letterboxd returned ${response.status}`);
    const feed = await response.text();
    if (!/<rss\b/i.test(feed)) throw new Error("Letterboxd returned something other than its feed");

    // The feed mixes diary entries with lists; only diary entries name a film.
    const item = rssItems(feed).find((entry) => rssValue(entry, "letterboxd:filmTitle"));
    const film = item
      ? filmFromLetterboxd(
          {
            title: rssValue(item, "letterboxd:filmTitle"),
            year: rssValue(item, "letterboxd:filmYear"),
            rating: rssValue(item, "letterboxd:memberRating"),
            watchedDate: rssValue(item, "letterboxd:watchedDate"),
            posterUrl: trustedHttpsUrl(firstImageUrl(item), ["a.ltrbxd.com"]),
            href: trustedHttpsUrl(rssValue(item, "link"), ["letterboxd.com", "www.letterboxd.com"]),
          },
          profileUrl,
        )
      : null;

    return { state: "live", film, href: profileUrl, updatedAt: new Date().toISOString() };
  },
  ["letterboxd-film-v2"],
  { revalidate: 900, tags: ["letterboxd-signal"] },
);

/** The latest film in my Letterboxd diary, or an empty diary. */
export async function getFilmSignal(): Promise<FilmSignal> {
  try {
    return await fetchFilm();
  } catch (error) {
    // Nothing fetched successfully yet: show the empty diary rather than an old film.
    console.warn("[letterboxd] feed unavailable", error instanceof Error ? error.message : error);
    return { state: "pending", film: null, href: profileUrl, updatedAt: null };
  }
}
