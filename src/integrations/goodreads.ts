import { unstable_cache } from "next/cache";
import { integrationConfig } from "@/content/integration-config";
import { rssItems, rssValue } from "@/integrations/rss";
import { trustedHttpsUrl } from "@/integrations/safe-url";
import { bookFromGoodreads } from "@/integrations/signal-mappers";
import type { ReadingSignal } from "@/integrations/types";

const { currentlyReadingFeedUrl, profileUrl } = integrationConfig.goodreads;

// Throwing keeps Next's last successful fetch during revalidation, so a
// Goodreads outage never replaces the book with an empty shelf.
const fetchReading = unstable_cache(
  async (): Promise<ReadingSignal> => {
    const response = await fetch(currentlyReadingFeedUrl, { signal: AbortSignal.timeout(3500) });
    if (!response.ok) throw new Error(`Goodreads returned ${response.status}`);
    const feed = await response.text();
    if (!/<rss\b/i.test(feed)) throw new Error("Goodreads returned something other than its feed");

    const [item] = rssItems(feed);
    const book = item
      ? bookFromGoodreads({
          title: rssValue(item, "title"),
          author: rssValue(item, "author_name"),
          dateAdded: rssValue(item, "user_date_added"),
          coverUrl: trustedHttpsUrl(rssValue(item, "book_large_image_url") ?? rssValue(item, "book_image_url"), ["i.gr-assets.com"]),
        })
      : null;
    if (item && !book) throw new Error("Goodreads listed a book without a title or author");

    return { state: "live", book, href: profileUrl, updatedAt: new Date().toISOString() };
  },
  ["goodreads-reading-v2"],
  { revalidate: 1800, tags: ["goodreads-signal"] },
);

/** The book on my currently-reading shelf, or an empty shelf. */
export async function getReadingSignal(): Promise<ReadingSignal> {
  try {
    return await fetchReading();
  } catch (error) {
    // Nothing fetched successfully yet: show the empty shelf rather than an old book.
    console.warn("[goodreads] feed unavailable", error instanceof Error ? error.message : error);
    return { state: "pending", book: null, href: profileUrl, updatedAt: null };
  }
}
