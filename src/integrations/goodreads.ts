import { integrationConfig } from "@/content/integration-config";
import { signalFallbacks } from "@/content/signal-fallbacks";
import { rssItems, rssValue } from "@/integrations/rss";
import type { ReadingSignal } from "@/integrations/types";

export async function getReadingSignal(): Promise<ReadingSignal> {
  try {
    const response = await fetch(integrationConfig.goodreads.currentlyReadingFeedUrl, {
      next: { revalidate: 21600, tags: ["goodreads-signal"] },
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) throw new Error(`Goodreads returned ${response.status}`);

    const [item] = rssItems(await response.text());
    const title = item && rssValue(item, "title")
      ?.replace(/\s+by\s+.+$/i, "")
      .replace(/\s+\([^)]*#\d+[^)]*\)\s*$/, "");
    const author = item && rssValue(item, "author_name");
    if (!item || !title || !author) return signalFallbacks.reading;

    return {
      state: "live",
      statusLabel: "Currently reading",
      headline: title,
      description: `By ${author} · from my Goodreads shelf`,
      author,
      bookDescription: rssValue(item, "book_description"),
      coverUrl: rssValue(item, "book_large_image_url") ?? rssValue(item, "book_image_url"),
      href: integrationConfig.goodreads.profileUrl,
    };
  } catch {
    return signalFallbacks.reading;
  }
}
