/*
 * The Role story shape (see Role story in GLOSSARY.md): an employer's page at
 * /work/<employer>, the sibling of a Case study. It shares the story pieces
 * (opening band, numbered sections, evidence strip) and differs in what it
 * tells: an employer, a role and the years there, in the employer's colour.
 */
import { siteCopy } from "./site-copy.ts";
import {
  MAX_EVIDENCE,
  storySectionHasContent,
  type EvidenceItem,
  type StoryColours,
  type StorySectionBody,
} from "./story.ts";

/** Every employer that gets a Role story. */
export type RoleStorySlug = "bnp-paribas" | "joveen" | "optegra";

/** The six sections, in the order they are read. */
export const roleStorySectionKeys = [
  "summary",
  "the-role",
  "the-problems",
  "decisions",
  "what-changed",
  "what-i-took-with-me",
] as const;

export type RoleStorySectionKey = (typeof roleStorySectionKeys)[number];

/** The section links and headings: "01 Summary" and so on. */
export const roleStorySectionLabels: Record<RoleStorySectionKey, string> = {
  summary: "Summary",
  "the-role": "The role",
  "the-problems": "The problems",
  decisions: "Decisions",
  "what-changed": "What changed",
  "what-i-took-with-me": "What I took with me",
};

/** The label every Role story shares for the link to the next one. */
export const roleStoryCopy = { nextRole: "Next role" } as const;

/** The one back link every Role story shares: the homepage's Work section. */
export const roleStoryBack = { label: siteCopy.header.backToWork, href: "/#work" } as const;

export type RoleStory = {
  slug: RoleStorySlug;
  /** "BNP Paribas": the band's name, the page title and the social card. */
  employer: string;
  /** "Software engineer": the band's lead and the page title. */
  role: string;
  /** The number on the opening, "01". */
  number: string;
  /** "Risk division · London · Jul 2025 – now". */
  metadata: string;
  /** The summary is also the page's description. */
  sections: Record<RoleStorySectionKey, StorySectionBody> & { summary: { paragraphs: readonly [string] } };
  /** At most four, shown under What changed. */
  evidence: readonly EvidenceItem[];
  /** The employer's colour in each theme. */
  colours: { light: StoryColours; dark: StoryColours };
  /** The Role story that follows this one (newest to oldest), or null on the last. */
  next: RoleStorySlug | null;
};

/** "Software engineer at BNP Paribas": the page's name, which the title adds "· Elias Bennett" to. */
export const roleStoryName = ({ role, employer }: RoleStory) => `${role} at ${employer}`;

/** An employer name too long for the display size: the band and the card both set it smaller. */
export const hasLongEmployer = ({ employer }: RoleStory) => employer.length > 24;

export const roleStoryDescription = (story: RoleStory) => story.sections.summary.paragraphs[0];

/**
 * The colour pair for the theme in force, chosen by the browser: light-dark()
 * follows the page's colour-scheme, which every theme sets, so nothing here
 * depends on which theme block is active.
 */
export function roleStoryColours({ light, dark }: RoleStory["colours"]): StoryColours {
  const pick = (key: keyof StoryColours) => `light-dark(${light[key]}, ${dark[key]})`;
  return { field: pick("field"), ink: pick("ink"), swatch: pick("swatch") };
}

/** Problems with a set of Role stories, as messages; empty when valid. */
export function roleStoryProblems(stories: readonly RoleStory[]): string[] {
  const problems: string[] = [];
  const slugs = stories.map((story) => story.slug);
  for (const story of stories) {
    if (story.evidence.length > MAX_EVIDENCE) {
      problems.push(`Role story "${story.slug}" has more than ${MAX_EVIDENCE} evidence items.`);
    }
    if (story.next !== null && (!slugs.includes(story.next) || story.next === story.slug)) {
      problems.push(`Role story "${story.slug}" must end with a different Role story or none, not "${story.next}".`);
    }
    for (const key of roleStorySectionKeys) {
      if (!storySectionHasContent(story.sections[key])) {
        problems.push(`Role story "${story.slug}" has an empty "${key}" section.`);
      }
    }
  }
  return problems;
}
