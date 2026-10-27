/*
 * What a Staff pass shows beyond its Role story's own role, dates and colours
 * (see Staff pass in GLOSSARY.md): the short name, one headline number, and,
 * on the current pass, the awards worn as pins. Every number must already be a
 * fact its Role story tells, so a pass never claims more than the story does.
 */
import type { RoleStory, RoleStorySlug } from "./role-story.ts";
import type { EvidenceItem } from "./story.ts";

/**
 * An award worn as a pin on the current pass's lanyard. `href` is the evidence
 * the pin leads to inside the Role story, as an absolute path so it works from
 * Work and from the story itself; a pin with none is text only.
 */
export type PassPin = { label: string; detail: string; href?: string };

/**
 * The number a pass leads with. It is one of its story's evidence items (the
 * label may stop at the first comma, "Core Web Vitals pass rate"), or else a
 * fact the story states in words, in which case `quote` is the sentence
 * fragment that states it.
 */
export type PassHeadline = EvidenceItem & { quote?: string };

export type PassRecord = {
  /** "Optegra", for the pass and the link "The Optegra story →"; the story's employer can be longer. */
  short: string;
  headline: PassHeadline;
  pins?: readonly PassPin[];
};

/** An employer's pass is current, or returned once the job is over. */
export type PassState = "current" | "returned";

export const passRecords: Record<RoleStorySlug, PassRecord> = {
  "bnp-paribas": {
    short: "BNP Paribas",
    headline: { value: "Only", label: "C# engineer on the team", quote: "only C# engineer" },
    pins: [
      { label: "Winner", detail: "Digitisation · 2025", href: "/work/bnp-paribas#what-changed" },
      { label: "Take Ownership", detail: "Q1 2026", href: "/work/bnp-paribas#take-ownership-certificate" },
      { label: "AI Champion", detail: "2026", href: "/work/bnp-paribas#what-i-took-with-me" },
    ],
  },
  joveen: { short: "Joveen", headline: { value: "−40%", label: "page load" } },
  optegra: { short: "Optegra", headline: { value: "88%", label: "Core Web Vitals pass rate" } },
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

/** Problems with the pass records, as messages naming the pass; empty when valid. */
export function passProblems(records: Record<RoleStorySlug, PassRecord>, stories: readonly RoleStory[]): string[] {
  return stories.flatMap((story) => {
    const record = records[story.slug];
    return headlineIsFromStory(record, story)
      ? []
      : [`Staff pass "${story.slug}": the headline "${record.headline.value} · ${record.headline.label}" is not one of its Role story's evidence items or stated facts.`];
  });
}
