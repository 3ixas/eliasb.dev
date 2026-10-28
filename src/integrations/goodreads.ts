import { unstable_cache } from "next/cache";
import { integrationConfig } from "@/content/integration-config";
import { bookFromGoodreadsWidget } from "@/integrations/goodreads-widget";
import type { ReadingSignal } from "@/integrations/types";

const { currentlyReadingWidgetUrl, profileUrl } = integrationConfig.goodreads;

// Throwing keeps Next's last successful fetch during revalidation, so a
// Goodreads outage never replaces the book with an empty shelf.
const fetchReading = unstable_cache(
  async (): Promise<ReadingSignal> => {
    const response = await fetch(currentlyReadingWidgetUrl, { signal: AbortSignal.timeout(3500) });
    if (!response.ok) throw new Error(`Goodreads returned ${response.status}`);
    const book = bookFromGoodreadsWidget(await response.text());
    return { state: "live", book, href: profileUrl, updatedAt: new Date().toISOString() };
  },
  ["goodreads-reading-v3"],
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
