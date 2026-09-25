import { integrationConfig } from "@/content/integration-config";
import { signalFallbacks } from "@/content/signal-fallbacks";
import { rssItems, rssValue } from "@/integrations/rss";
import { trustedHttpsUrl } from "@/integrations/safe-url";
import type { ReadingSignal } from "@/integrations/types";

function summaryText(value: string | undefined) {
  if (!value) return undefined;
  const plain = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return undefined;
  if (plain.length <= 220) return plain;
  const sentence = plain.slice(0, 220).replace(/\s+\S*$/, "").trim();
  return `${sentence}…`;
}

export async function getReadingSignal(): Promise<ReadingSignal> {
  try {
    const response = await fetch(integrationConfig.goodreads.currentlyReadingFeedUrl, {
      next: { revalidate: 1800, tags: ["goodreads-signal"] },
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
      description: "",
      author,
      bookDescription: summaryText(rssValue(item, "book_description")),
      coverUrl: trustedHttpsUrl(
        rssValue(item, "book_large_image_url") ?? rssValue(item, "book_image_url"),
        ["i.gr-assets.com"],
      ),
      href: integrationConfig.goodreads.profileUrl,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return signalFallbacks.reading;
  }
}
