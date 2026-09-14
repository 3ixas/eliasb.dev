import type { HistoryEvent, HistorySignal } from "@/integrations/types";

const HISTORY_CACHE_SECONDS = 604800;
const HISTORY_TIMEOUT_MS = 3500;

type WikimediaPage = {
  content_urls?: {
    desktop?: { page?: unknown };
  };
  titles?: { canonical?: unknown };
};

type WikimediaEvent = {
  year?: unknown;
  text?: unknown;
  pages?: unknown;
};

type WikimediaResponse = {
  events?: unknown;
  selected?: unknown;
};

const FALLBACK_EVENTS: HistoryEvent[] = [
  {
    year: 1969,
    text: "The first test flight of Concorde took place, beginning a new chapter in supersonic passenger travel.",
    sourceUrl: "https://en.wikipedia.org/wiki/Concorde",
  },
  {
    year: 1940,
    text: "The London Blitz continued, with the city adapting its nights, streets, and routines around the air raids.",
    sourceUrl: "https://en.wikipedia.org/wiki/The_Blitz",
  },
  {
    year: 1960,
    text: "The first working laser was demonstrated, turning a theoretical idea into a practical instrument.",
    sourceUrl: "https://en.wikipedia.org/wiki/Laser",
  },
];

function weekStart(now = new Date()) {
  const date = new Date(now);
  date.setUTCHours(0, 0, 0, 0);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - (day === 0 ? 6 : day - 1));
  return date;
}

function dateLabel(date: Date) {
  return `Week of ${new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)}`;
}

function pageUrl(page: WikimediaPage | undefined) {
  const direct = page?.content_urls?.desktop?.page;
  if (typeof direct === "string" && direct.startsWith("https://en.wikipedia.org/")) return direct;

  const title = page?.titles?.canonical;
  return typeof title === "string"
    ? `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`
    : "https://en.wikipedia.org/wiki/Main_Page";
}

function isWikimediaEvent(value: unknown): value is WikimediaEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as WikimediaEvent;
  return typeof event.year === "number" && Number.isFinite(event.year) && typeof event.text === "string";
}

function mapEvents(payload: unknown): HistoryEvent[] {
  if (!payload || typeof payload !== "object") return [];
  const response = payload as WikimediaResponse;
  const events = response.events ?? response.selected;
  if (!Array.isArray(events)) return [];

  return events
    .filter(isWikimediaEvent)
    .slice(0, 3)
    .map((event) => {
      const pages = Array.isArray(event.pages) ? event.pages : [];
      const firstPage = pages.find((page): page is WikimediaPage => !!page && typeof page === "object");
      return { year: event.year as number, text: event.text as string, sourceUrl: pageUrl(firstPage) };
    });
}

function fallbackForWeek(start = weekStart()) {
  const weekNumber = Math.floor(start.getTime() / (7 * 24 * 60 * 60 * 1000));
  return FALLBACK_EVENTS[Math.abs(weekNumber) % FALLBACK_EVENTS.length];
}

function fallbackSignal(now = new Date()): HistorySignal {
  const start = weekStart(now);
  const event = fallbackForWeek(start);
  return {
    state: "curated",
    statusLabel: "Authored fallback",
    headline: "This week in history",
    description: "Wikimedia is unavailable, so this fixed note is shown until the next successful lookup.",
    dateLabel: dateLabel(start),
    events: [event],
    sourceUrl: "https://en.wikipedia.org/wiki/Portal:History",
    updatedAt: null,
  };
}

export async function getHistorySignal(): Promise<HistorySignal> {
  const start = weekStart();
  const month = String(start.getUTCMonth() + 1).padStart(2, "0");
  const day = String(start.getUTCDate()).padStart(2, "0");
  const sourceUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/selected/${month}/${day}`;

  try {
    const response = await fetch(sourceUrl, {
      next: { revalidate: HISTORY_CACHE_SECONDS, tags: ["history-signal"] },
      signal: AbortSignal.timeout(HISTORY_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return fallbackSignal();

    const events = mapEvents(await response.json());
    if (!events.length) return fallbackSignal();

    return {
      state: "live",
      statusLabel: "Wikimedia · cached",
      headline: "This week in history",
      description: "A few events from the Monday of this week, looked up from Wikimedia and cached for seven days.",
      dateLabel: dateLabel(start),
      events,
      sourceUrl,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return fallbackSignal();
  }
}
