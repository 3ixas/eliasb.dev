import type { HistoryEvent, HistorySignal } from "@/integrations/types";

const HISTORY_CACHE_SECONDS = 604800;
const HISTORY_TIMEOUT_MS = 3500;
const HISTORY_FEEDS = ["events", "selected", "births"] as const;

type WikimediaFeedName = typeof HISTORY_FEEDS[number];

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

type ValidWikimediaEvent = WikimediaEvent & {
  year: number;
  text: string;
};

type WikimediaResponse = {
  events?: unknown;
  selected?: unknown;
  births?: unknown;
};

type HistoryCandidate = {
  event: HistoryEvent;
  score: number;
};

const HEAVY_EVENT_TERMS = /\b(?:war|battle|attack|attacked|killing|killed|kill|murder|assassinat(?:ed|ion)|bomb(?:ing)?|terror(?:ist|ism)?|militant|genocide|holocaust|massacre|invasion|siege|shooting|gunmen|riot|coup|earthquake|hurricane|crash|shipwreck|disaster|explosion|flood|fire|storm|died|death|drowned|blitz)\b/i;
const INTEREST_GROUPS = [
  /\b(?:author|writer|novelist|poet|artist|animator|illustrator|composer|musician|singer|band|actor|actress|filmmaker|cartoonist|painter)\b/i,
  /\b(?:book|novel|album|film|movie|theatre|theater|opera|published|released|play|song)\b/i,
  /\b(?:science|scientist|astronomer|astronomy|invent(?:or|ion|ed)?|patent|experiment|mathematician|technology)\b/i,
  /\b(?:spacecraft|space|planet|jupiter|moon|orbit|rocket|telescope|comet|mission)\b/i,
  /\b(?:sport|wrestling|wrestler|football|cricket|racing|champion|olympic|game|team)\b/i,
  /\b(?:first|founded|established|establishes|discovered|opened|inaugurated|premiered|launched|presented|debut)\b/i,
];

export const HISTORY_FALLBACK_EVENTS: HistoryEvent[] = [
  {
    year: 1866,
    kind: "birth",
    text: "Science-fiction writer H. G. Wells was born in Bromley, Kent.",
    sourceUrl: "https://catalogue.bnf.fr/ark:/12148/cb119290531",
  },
  {
    year: 1933,
    kind: "event",
    text: "Mexico’s Empresa Mexicana de Lucha Libre, now CMLL, was founded by Salvador Lutteroth.",
    sourceUrl: "https://cmll.com/historia/",
  },
  {
    year: 2003,
    kind: "event",
    text: "NASA sent Galileo into Jupiter’s atmosphere, ending its 14-year mission and protecting Europa from a future impact.",
    sourceUrl: "https://www.jpl.nasa.gov/news/galileo-end-of-mission-status/",
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

function pageUrl(page: unknown): string | undefined {
  if (!page || typeof page !== "object") return undefined;
  const wikimediaPage = page as WikimediaPage;
  const direct = wikimediaPage.content_urls?.desktop?.page;
  if (typeof direct === "string") {
    try {
      const url = new URL(direct);
      if (url.protocol === "https:" && url.hostname === "en.wikipedia.org" && url.pathname !== "/wiki/Main_Page") {
        return url.href;
      }
    } catch {
      return undefined;
    }
  }

  const title = wikimediaPage.titles?.canonical;
  if (typeof title !== "string" || !title.trim()) return undefined;
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.trim().replaceAll(" ", "_"))}`;
}

function isWikimediaEvent(value: unknown): value is ValidWikimediaEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as WikimediaEvent;
  return typeof event.year === "number"
    && Number.isSafeInteger(event.year)
    && event.year > 0
    && typeof event.text === "string"
    && event.text.trim().length > 0;
}

function eventFrom(value: unknown, kind: HistoryEvent["kind"]): HistoryEvent | undefined {
  if (!isWikimediaEvent(value)) return undefined;
  const pages = Array.isArray(value.pages) ? value.pages : [];
  const sourceUrl = pages.map(pageUrl).find((url): url is string => Boolean(url));
  if (!sourceUrl) return undefined;
  const normalizedText = value.text.replace(/\s+/g, " ").trim();
  const text = kind === "birth"
    ? normalizedText.replace(/\s+\(died\s+\d{1,4}\)\s*$/i, "")
    : normalizedText;

  return {
    year: value.year,
    kind,
    text,
    sourceUrl,
  };
}

type WikimediaFeedResult = {
  feedName: WikimediaFeedName;
  items: unknown[];
};

async function fetchHistoryFeed(feedName: WikimediaFeedName, month: string, day: string): Promise<WikimediaFeedResult | null> {
  const sourceUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/${feedName}/${month}/${day}`;
  try {
    const response = await fetch(sourceUrl, {
      next: { revalidate: HISTORY_CACHE_SECONDS, tags: ["history-signal"] },
      signal: AbortSignal.timeout(HISTORY_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== "object") return null;
    const items = (payload as WikimediaResponse)[feedName];
    if (!Array.isArray(items) || items.length === 0) return null;

    const kind: HistoryEvent["kind"] = feedName === "births" ? "birth" : "event";
    return items.some((item) => eventFrom(item, kind)) ? { feedName, items } : null;
  } catch {
    return null;
  }
}

function candidateScore(event: HistoryEvent, currentYear: number): number {
  const searchText = `${event.text} ${decodeURIComponent(new URL(event.sourceUrl).pathname)}`;
  if (HEAVY_EVENT_TERMS.test(searchText) || event.text.length > 260) return 0;

  const interest = INTEREST_GROUPS.reduce((score, group) => score + Number(group.test(searchText)), 0);
  return Math.max(0, interest - (event.year >= currentYear - 40 ? 0.25 : 0));
}

export function selectHistoryEvents(payload: unknown, now = new Date()): HistoryEvent[] {
  if (!payload || typeof payload !== "object") return [];
  const response = payload as WikimediaResponse;
  const events = [
    ...(Array.isArray(response.events) ? response.events.map((event) => eventFrom(event, "event")) : []),
    ...(Array.isArray(response.selected) ? response.selected.map((event) => eventFrom(event, "event")) : []),
    ...(Array.isArray(response.births) ? response.births.map((event) => eventFrom(event, "birth")) : []),
  ].filter((event): event is HistoryEvent => Boolean(event));
  const unique = new Map(events.map((event) => [`${event.kind}:${event.year}:${event.text.toLocaleLowerCase()}`, event]));
  const candidates: HistoryCandidate[] = [...unique.values()]
    .map((event) => ({ event, score: candidateScore(event, now.getUTCFullYear()) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.event.year - right.event.year);

  const selected: HistoryEvent[] = [];
  const centuries = new Set<number>();
  let recentCount = 0;
  for (const { event } of candidates) {
    const century = Math.floor((event.year - 1) / 100);
    const isRecent = event.year >= now.getUTCFullYear() - 40;
    if (centuries.has(century) || (isRecent && recentCount > 0)) continue;

    selected.push(event);
    centuries.add(century);
    if (isRecent) recentCount += 1;
    if (selected.length === 3) break;
  }

  if (
    selected.length !== 3
    || !selected.some(({ year }) => year < 1900)
    || !selected.some(({ kind }) => kind === "birth")
    || !selected.some(({ kind }) => kind === "event")
  ) return [];

  return selected.sort((left, right) => left.year - right.year);
}

function fallbackSignal(): HistorySignal {
  return {
    state: "curated",
    statusLabel: "Saved examples",
    headline: "A few moments in history",
    description: "",
    dateLabel: "Saved examples",
    events: HISTORY_FALLBACK_EVENTS,
    sourceUrl: "https://en.wikipedia.org/wiki/Portal:History",
    updatedAt: null,
  };
}

export async function getHistorySignal(now = new Date()): Promise<HistorySignal> {
  const start = weekStart(now);
  const month = String(start.getUTCMonth() + 1).padStart(2, "0");
  const day = String(start.getUTCDate()).padStart(2, "0");
  const sourceUrl = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`;

  try {
    const feeds = await Promise.all(HISTORY_FEEDS.map((feedName) => fetchHistoryFeed(feedName, month, day)));
    const successfulFeeds = feeds.filter((feed): feed is WikimediaFeedResult => feed !== null);
    if (successfulFeeds.length !== HISTORY_FEEDS.length) return fallbackSignal();

    const payload = Object.fromEntries(successfulFeeds.map(({ feedName, items }) => [feedName, items]));
    const events = selectHistoryEvents(payload, now);
    if (events.length !== 3) return fallbackSignal();

    return {
      state: "live",
      statusLabel: "Wikimedia · cached",
      headline: "This week in history",
      description: "",
      dateLabel: dateLabel(start),
      events,
      sourceUrl,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return fallbackSignal();
  }
}
