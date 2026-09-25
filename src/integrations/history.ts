import type { HistoryEvent, HistoryImage, HistorySignal } from "@/integrations/types";

const HISTORY_CACHE_SECONDS = 604800;
const HISTORY_TIMEOUT_MS = 3500;
const HISTORY_FEEDS = ["events", "selected", "births"] as const;

type WikimediaFeedName = typeof HISTORY_FEEDS[number];

type WikimediaPage = {
  content_urls?: {
    desktop?: { page?: unknown };
  };
  titles?: { canonical?: unknown };
  thumbnail?: { source?: unknown };
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

type MappedHistoryEvent = {
  event: HistoryEvent;
  commonsFileTitle?: string;
};

type HistoryCandidate = {
  event: HistoryEvent;
  score: number;
  commonsFileTitle?: string;
};

type WikimediaImageInfo = {
  thumburl?: unknown;
  thumbwidth?: unknown;
  thumbheight?: unknown;
  thumbmime?: unknown;
  mime?: unknown;
  descriptionurl?: unknown;
  extmetadata?: unknown;
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
const DISTINCTIVE_FACT_TERMS = /\b(?:accidentally|by accident|deliberately|unexpected(?:ly)?|mistakenly|secret(?:ly)?|never before|first[- ]ever|only known|last known|lost at sea)\b/i;
const ROUTINE_ALBUM_RELEASE = /\b(?:band|musician|artist|singer)\b[^.!?]{0,120}\b(?:released|issued)\b[^.!?]{0,80}\b(?:studio )?album\b/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}

export const HISTORY_FALLBACK_EVENTS: HistoryEvent[] = [
  {
    year: 1783,
    kind: "event",
    text: "The first living creatures to ride in a balloon were a sheep, a duck and a rooster. All three survived the flight at Versailles.",
    sourceUrl: "https://airandspace.si.edu/collection-objects/experience-fait-versailles-le-19-sept-1783/nasm_A19680120000",
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

function commonsFileTitle(page: unknown): string | undefined {
  if (!isRecord(page) || !isRecord(page.thumbnail) || typeof page.thumbnail.source !== "string") return undefined;
  try {
    const imageUrl = new URL(page.thumbnail.source);
    if (
      imageUrl.protocol !== "https:"
      || !["thumb.wikimedia.org", "upload.wikimedia.org"].includes(imageUrl.hostname)
      || !imageUrl.pathname.startsWith("/wikipedia/commons/")
    ) return undefined;

    const pathSegments = imageUrl.pathname.split("/").filter(Boolean);
    const commonsIndex = pathSegments.indexOf("commons");
    if (commonsIndex < 0) return undefined;
    const isThumbnailPath = pathSegments[commonsIndex + 1] === "thumb";
    const encodedTitle = pathSegments.at(isThumbnailPath ? -2 : -1);
    if (!encodedTitle) return undefined;
    const title = decodeURIComponent(encodedTitle).trim();
    return title && !title.includes("/") ? title : undefined;
  } catch {
    return undefined;
  }
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

function eventFrom(value: unknown, kind: HistoryEvent["kind"]): MappedHistoryEvent | undefined {
  if (!isWikimediaEvent(value)) return undefined;
  const pages = Array.isArray(value.pages) ? value.pages : [];
  const pageRecords = pages
    .map((page) => {
      const sourceUrl = pageUrl(page);
      return sourceUrl ? { sourceUrl, commonsFileTitle: commonsFileTitle(page) } : undefined;
    })
    .filter((page): page is { sourceUrl: string; commonsFileTitle: string | undefined } => Boolean(page));
  const sourcePage = pageRecords.find((page) => page.commonsFileTitle) ?? pageRecords[0];
  const sourceUrl = sourcePage?.sourceUrl;
  if (!sourceUrl) return undefined;
  const normalizedText = value.text.replace(/\s+/g, " ").trim();
  const text = kind === "birth"
    ? normalizedText.replace(/\s+\(died\s+\d{1,4}\)\s*$/i, "")
    : normalizedText;

  return {
    event: {
      year: value.year,
      kind,
      text,
      sourceUrl,
    },
    commonsFileTitle: sourcePage.commonsFileTitle,
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
  if (event.kind === "birth" && !DISTINCTIVE_FACT_TERMS.test(event.text)) return 0;

  const interest = INTEREST_GROUPS.reduce((score, group) => score + Number(group.test(searchText)), 0);
  const distinctiveDetail = DISTINCTIVE_FACT_TERMS.test(event.text) ? 1.5 : 0;
  const routineMilestone = ROUTINE_ALBUM_RELEASE.test(event.text) ? 1.25 : 0;
  return Math.max(0, interest + distinctiveDetail - routineMilestone - (event.year >= currentYear - 40 ? 0.25 : 0));
}

function selectHistoryCandidates(payload: unknown, now = new Date()): HistoryCandidate[] {
  if (!payload || typeof payload !== "object") return [];
  const response = payload as WikimediaResponse;
  const events = [
    ...(Array.isArray(response.events) ? response.events.map((event) => eventFrom(event, "event")) : []),
    ...(Array.isArray(response.selected) ? response.selected.map((event) => eventFrom(event, "event")) : []),
    ...(Array.isArray(response.births) ? response.births.map((event) => eventFrom(event, "birth")) : []),
  ].filter((event): event is MappedHistoryEvent => Boolean(event));
  const unique = new Map<string, MappedHistoryEvent>();
  for (const mappedEvent of events) {
    const { event } = mappedEvent;
    unique.set(`${event.kind}:${event.year}:${event.text.toLocaleLowerCase()}`, mappedEvent);
  }
  const candidates: HistoryCandidate[] = [...unique.values()]
    .map(({ event, commonsFileTitle }) => ({ event, commonsFileTitle, score: candidateScore(event, now.getUTCFullYear()) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.event.year - right.event.year);

  const selected: HistoryCandidate[] = [];
  const centuries = new Set<number>();
  let recentCount = 0;
  for (const candidate of candidates) {
    const { event } = candidate;
    const century = Math.floor((event.year - 1) / 100);
    const isRecent = event.year >= now.getUTCFullYear() - 40;
    if (centuries.has(century) || (isRecent && recentCount > 0)) continue;

    selected.push(candidate);
    centuries.add(century);
    if (isRecent) recentCount += 1;
    if (selected.length === 3) break;
  }

  if (
    selected.length !== 3
    || !selected.some(({ event }) => event.year < 1900)
    || selected.filter(({ event }) => event.kind === "event").length < 2
  ) return [];

  return selected.sort((left, right) => left.event.year - right.event.year);
}

export function selectHistoryEvents(payload: unknown, now = new Date()): HistoryEvent[] {
  return selectHistoryCandidates(payload, now).map(({ event }) => event);
}

function metadataText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&nbsp;": " ",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&lt;": "<",
    "&gt;": ">",
  };
  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_match, decimal: string) => {
      const codePoint = Number.parseInt(decimal, 10);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : "";
    })
    .replace(/&#x([\da-f]+);/gi, (_match, hexadecimal: string) => {
      const codePoint = Number.parseInt(hexadecimal, 16);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : "";
    })
    .replace(/&(?:amp|nbsp|quot|apos|lt|gt);|&#39;/g, (entity) => entities[entity] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || undefined;
}

function safeHttpsUrl(value: unknown, hostnames: string[]): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && !url.port
      && hostnames.includes(url.hostname)
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}

function historyImageAlt(objectName: string | undefined, fileTitle: string): string {
  const cleanedObjectName = objectName?.replace(/\.(?:jpe?g|png|webp|gif|avif|svg)$/i, "");
  const title = cleanedObjectName && /[\s_-]/.test(cleanedObjectName)
    ? cleanedObjectName
    : fileTitle.replace(/\.[^.]+$/, "");
  return title
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .replace(/(\d)([A-Za-z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchCommonsImage(fileTitle: string): Promise<HistoryImage | undefined> {
  const requestUrl = new URL("https://commons.wikimedia.org/w/api.php");
  requestUrl.search = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    prop: "imageinfo",
    titles: `File:${fileTitle}`,
    iiprop: "url|mime|thumbmime|extmetadata",
    iiurlwidth: "800",
    iiextmetadatafilter: "ObjectName|Artist|LicenseShortName|LicenseUrl",
    iiextmetadatalanguage: "en",
  }).toString();

  try {
    const response = await fetch(requestUrl, {
      next: { revalidate: HISTORY_CACHE_SECONDS, tags: ["history-signal"] },
      signal: AbortSignal.timeout(HISTORY_TIMEOUT_MS),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return undefined;

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !isRecord(payload.query)) return undefined;
    const pages = payload.query.pages;
    const page = Array.isArray(pages) ? pages[0] : isRecord(pages) ? Object.values(pages)[0] : undefined;
    if (!isRecord(page) || !Array.isArray(page.imageinfo) || !isRecord(page.imageinfo[0])) return undefined;
    const imageInfo = page.imageinfo[0] as WikimediaImageInfo;
    const src = safeHttpsUrl(imageInfo.thumburl, ["thumb.wikimedia.org", "upload.wikimedia.org"]);
    const sourceUrl = safeHttpsUrl(imageInfo.descriptionurl, ["commons.wikimedia.org"]);
    const thumbnailMime = typeof imageInfo.thumbmime === "string" ? imageInfo.thumbmime : imageInfo.mime;
    const extmetadata = isRecord(imageInfo.extmetadata) ? imageInfo.extmetadata : {};
    const objectName = isRecord(extmetadata.ObjectName) ? metadataText(extmetadata.ObjectName.value) : undefined;
    const creator = isRecord(extmetadata.Artist) ? metadataText(extmetadata.Artist.value) : undefined;
    const licenseName = isRecord(extmetadata.LicenseShortName) ? metadataText(extmetadata.LicenseShortName.value) : undefined;
    const rawLicenseUrl = isRecord(extmetadata.LicenseUrl) ? extmetadata.LicenseUrl.value : undefined;
    const licenseUrl = safeHttpsUrl(rawLicenseUrl, ["creativecommons.org", "www.gnu.org", "freedomdefined.org", "artlibre.org"]) ?? null;
    const width = imageInfo.thumbwidth;
    const height = imageInfo.thumbheight;
    if (
      !src
      || !src.includes("/wikipedia/commons/")
      || !sourceUrl?.startsWith("https://commons.wikimedia.org/wiki/File:")
      || !creator
      || !licenseName
      || !["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(String(thumbnailMime))
      || typeof width !== "number"
      || !Number.isSafeInteger(width)
      || width < 240
      || typeof height !== "number"
      || !Number.isSafeInteger(height)
      || height < 120
    ) return undefined;

    const alt = historyImageAlt(objectName, fileTitle);
    return { src, alt, creator, sourceUrl, licenseName, licenseUrl };
  } catch {
    return undefined;
  }
}

function fallbackSignal(): HistorySignal {
  return {
    state: "curated",
    statusLabel: "Saved examples",
    headline: "A few curious turns",
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
    const candidates = selectHistoryCandidates(payload, now);
    if (candidates.length !== 3) return fallbackSignal();
    const events = await Promise.all(candidates.map(async ({ event, commonsFileTitle }) => {
      if (!commonsFileTitle) return event;
      const image = await fetchCommonsImage(commonsFileTitle);
      return image ? { ...event, image } : event;
    }));

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
