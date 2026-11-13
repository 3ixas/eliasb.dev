/*
 * What a Staff pass shows beyond its Role story's own role, dates and colours
 * (see Staff pass in GLOSSARY.md): the short name, its three printed points
 * (DESIGN.md "The staff pass", R-12), its lanyard, and the quiet
 * index's headline number and pins, which Work's rows and the Résumé's Awards
 * still read. Every point and number must already be a fact its Role story
 * tells, so a pass never claims more than the story does.
 */
import type { RoleStory, RoleStorySlug } from "./role-story.ts";
import type { EvidenceItem } from "./story.ts";

/** An award worn as a pin on the current pass's lanyard: text only, as the pass's pins are not links. */
export type PassPin = { label: string; detail: string };

/**
 * The number a pass leads with. It is one of its story's evidence items (the
 * label may stop at the first comma, "Core Web Vitals pass rate"), or else a
 * fact the story states in words, in which case `quote` is the sentence
 * fragment that states it.
 */
export type PassHeadline = EvidenceItem & { quote?: string };

/**
 * A point printed on a pass: a serif lead over a sans detail. It restates one of its story's evidence items (`evidence`, by
 * index), or facts the story states in words (`quotes`, each found in the story's text or figures). Either way, every
 * number on the point must be in its source.
 */
export type PassPoint = { lead: string; detail: string; evidence?: number; quotes?: readonly string[] };

export type PassRecord = {
  /** "Optegra", for the pass and the link "The Optegra story →"; the story's employer can be longer. */
  short: string;
  /** The three points printed on the pass, strongest first. */
  points: readonly [PassPoint, PassPoint, PassPoint];
  /** The lanyard's ribbon. The band is the Role story's panel field and ink. */
  lanyard: string;
  headline: PassHeadline;
  pins?: readonly PassPin[];
};

/** An employer's pass is current, or returned once the job is over. */
export type PassState = "current" | "returned";

export const passRecords: Record<RoleStorySlug, PassRecord> = {
  "bnp-paribas": {
    short: "BNP Paribas",
    points: [
      { lead: "Winner", detail: "Digitisation competition, 2025", evidence: 0 },
      { lead: "Take Ownership", detail: "Award, Q1 2026", quotes: ["won a Take Ownership award", "Q1 2026 Take Ownership award"] },
      { lead: "AI workflow", detail: "Used by several teams", quotes: ["the workflow is now used by several teams"] },
    ],
    lanyard: "#0b6b47",
    headline: { value: "Only", label: "C# engineer on the team", quote: "only C# engineer" },
    pins: [
      { label: "Winner", detail: "Digitisation · 2025" },
      { label: "Take Ownership", detail: "Q1 2026" },
      { label: "AI Champion", detail: "2026" },
    ],
  },
  joveen: {
    short: "Joveen",
    points: [
      { lead: "−40%", detail: "Page load", evidence: 0 },
      { lead: "520 → 230 ms", detail: "Key API p95", evidence: 3 },
      { lead: "+30%", detail: "Mobile retention", evidence: 2 },
    ],
    lanyard: "#2b2b2d",
    headline: { value: "−40%", label: "page load" },
  },
  optegra: {
    short: "Optegra",
    points: [
      { lead: "62 → 88%", detail: "Core Web Vitals pass rate", evidence: 0 },
      { lead: "−30%", detail: "p95 page load", evidence: 1 },
      { lead: "+15%", detail: "Consultation conversion", evidence: 2 },
    ],
    lanyard: "#00aa90",
    headline: { value: "88%", label: "Core Web Vitals pass rate" },
  },
};

/**
 * How an employer's pass hangs where it is the opening object of its Role story: whether the job is current
 * or over, and its resting tilt in degrees (held under reduced motion).
 */
export const passHang: Record<RoleStorySlug, { state: PassState; tilt: number }> = {
  "bnp-paribas": { state: "current", tilt: -1 },
  joveen: { state: "returned", tilt: 1.5 },
  optegra: { state: "returned", tilt: -1.2 },
};

/** What a pass says its status is: "Valid · present" while the job is current, otherwise "Returned". */
export const passStatus = (state: PassState) => (state === "current" ? currentPassStatus : "Returned");

/** Only a current pass shows a status; a returned one has the "Returned" stamp, and its dates line already says when it ended. */
export const currentPassStatus = "Valid · present";

/** "The Optegra story →": the foot of a pass that links to its Role story. */
export const passLinkLabel = ({ short }: PassRecord) => `The ${short} story →`;

const storyText = ({ sections }: RoleStory) =>
  Object.values(sections)
    .flatMap((section) => [section.heading, ...(section.paragraphs ?? []), ...(section.points ?? []).flatMap((point) => [point.lead, point.text])])
    .filter(Boolean)
    .join(" ");

/** True when the headline is one of the story's evidence items or a fact it states. */
function headlineIsFromStory({ headline }: PassRecord, story: RoleStory): boolean {
  const evidence = story.evidence.some(
    (item) => item.value === headline.value && (item.label === headline.label || item.label.startsWith(`${headline.label},`)),
  );
  return evidence || Boolean(headline.quote && storyText(story).includes(headline.quote));
}

/** Every run of digits in `text`: the numbers a point claims. */
const numbersIn = (text: string): string[] => text.match(/\d+(?:\.\d+)?/g) ?? [];

/** What a point is about to restate, as text, or why it has no source: its evidence item, or its quotes when the story says each one. */
function pointSource(point: PassPoint, story: RoleStory): { text: string } | { problem: string } {
  if ((point.evidence === undefined) === (point.quotes === undefined)) return { problem: "needs one source: an evidence item or quotes" };
  if (point.evidence !== undefined) {
    const item = story.evidence[point.evidence];
    return item ? { text: `${item.value} ${item.label}` } : { problem: `names evidence item ${point.evidence}, which its Role story does not have` };
  }
  // The figures count: a certificate's description says what it awards and when.
  const said = `${storyText(story)} ${JSON.stringify(story.figures ?? {})}`;
  const quotes = point.quotes ?? [];
  const unsaid = quotes.find((quote) => !said.includes(quote));
  return unsaid === undefined ? { text: quotes.join(" ") } : { problem: `quotes "${unsaid}", which its Role story does not say` };
}

/** Problems with the pass records, as messages naming the pass; empty when valid. */
export function passProblems(records: Record<RoleStorySlug, PassRecord>, stories: readonly RoleStory[]): string[] {
  return stories.flatMap((story) => {
    const record = records[story.slug];
    const problems: string[] = headlineIsFromStory(record, story)
      ? []
      : [`Staff pass "${story.slug}": the headline "${record.headline.value} · ${record.headline.label}" is not one of its Role story's evidence items or stated facts.`];
    for (const point of record.points) {
      const name = `Staff pass "${story.slug}": the point "${point.lead} · ${point.detail}"`;
      const source = pointSource(point, story);
      if ("problem" in source) {
        problems.push(`${name} ${source.problem}.`);
        continue;
      }
      const missing = numbersIn(`${point.lead} ${point.detail}`).find((number) => !numbersIn(source.text).includes(number));
      if (missing) problems.push(`${name} says "${missing}", which its source does not.`);
    }
    return problems;
  });
}
