/*
 * The Role story shape (see Role story in GLOSSARY.md): an employer's page at
 * /work/<employer>, the sibling of a Case study. It shares the story pieces
 * (opening band, numbered sections, evidence strip) and differs in what it
 * tells: an employer, a role and the years there, in the employer's colour.
 */
import type { RevealId } from "./opening.ts";
import { siteCopy } from "./site-copy.ts";
import {
  MAX_EVIDENCE,
  storySectionHasContent,
  storyText,
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

/** A before-and-after bar: the words say it, the number sets its length. */
export type ScaleBar = { label: string; amount: number };

/** One figure a Role story attaches to a section, drawn only from the story's own facts. */
export type RoleStoryFigure =
  | {
      kind: "flag";
      live: string;
      toggled: string;
      /** "off by default". */
      state: string;
      caption: string;
    }
  | {
      kind: "scale";
      /** Each row is one measurement; both bars share its unit, so the lengths compare. */
      rows: readonly { what: string; before: ScaleBar; after: ScaleBar }[];
      caption: string;
    }
  | {
      kind: "certificate";
      /** The anchor the Take Ownership pin leads to. */
      id: string;
      src: string;
      alt: string;
      width: number;
      height: number;
      caption: string;
    }
  | {
      kind: "screens";
      /** Side by side, in this order: a desktop shot is wide, a phone shot is narrow. */
      images: readonly { src: string; alt: string; width: number; height: number; device: "desktop" | "phone" }[];
      /** What it is and when it was captured. */
      caption: string;
      /** Where it came from, shown at the end of the caption as a link. */
      source: { href: string; label: string };
    };

/**
 * The words in a Role story's sections that name something real, and the closer look each shows (rule 7 in
 * docs/design/DESIGN.md: proof is inline, names are behind). Only these are marked; the looks are the homepage's
 * reveal words', so they say nothing the story does not. `roleStoryProblems` checks each phrase is in its section.
 */
export type RoleStoryReveal = { section: RoleStorySectionKey; phrase: string; id: Extract<RevealId, "cores" | "ownership"> };

export const roleStoryReveals: Partial<Record<RoleStorySlug, readonly RoleStoryReveal[]>> = {
  "bnp-paribas": [
    { section: "summary", phrase: "CPU and GPU", id: "cores" },
    { section: "what-i-took-with-me", phrase: "Take Ownership award", id: "ownership" },
  ],
};

/**
 * The evidence a Role story's pass does not already show: an item whose figures are all on the pass (in its
 * headline or a Pass pin) is left out, so the proof under Summary does not say the pass's numbers twice.
 */
export function evidenceBeyondPass(evidence: readonly EvidenceItem[], onPass: readonly string[]): readonly EvidenceItem[] {
  const figuresOf = (text: string) => text.match(/\d+/g) ?? [];
  const shown = new Set(onPass.flatMap(figuresOf));
  return evidence.filter((item) => {
    const figures = figuresOf(`${item.value} ${item.label}`);
    return figures.length === 0 || !figures.every((figure) => shown.has(figure));
  });
}

/** How many achievement lines a role gives the Résumé. */
export const RESUME_LINES = { min: 2, max: 4 } as const;

export type RoleStory = {
  slug: RoleStorySlug;
  /** "BNP Paribas": the band's name, the page title and the social card. */
  employer: string;
  /** "Software engineer": the band's lead and the page title. */
  role: string;
  /** The number on the opening, "01". */
  number: string;
  /** The years there, "Aug 2024 – Jun 2025": the band, and the Work row that opens this story. */
  dates: string;
  /** Where, when it is worth saying: "Risk division · London". */
  setting?: string;
  /** The summary is also the page's description. */
  sections: Record<RoleStorySectionKey, StorySectionBody> & { summary: { paragraphs: readonly [string] } };
  /** A figure under a section, where the story has one. */
  figures?: Partial<Record<RoleStorySectionKey, RoleStoryFigure>>;
  /** The achievement lines the Résumé shows for this role (see Résumé in GLOSSARY.md): written to stand alone, not the evidence fragments. */
  resume: readonly string[];
  /** At most four, shown under What changed. */
  evidence: readonly EvidenceItem[];
  /** The employer's colour in each theme. */
  colours: { light: StoryColours; dark: StoryColours };
  /** The Role story that follows this one (newest to oldest), or null on the last. */
  next: RoleStorySlug | null;
};

/** The band's metadata line: the setting, then the dates. */
export const roleStoryMetadata = ({ setting, dates }: RoleStory) => [setting, dates].filter(Boolean).join(" · ");

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

/**
 * The figures a Résumé line claims (digits, and the number words a line uses), which its own Role story
 * must also state: the lines are written separately, so this is what stops one keeping a number the story
 * has since changed.
 */
const figures = (line: string) => line.toLowerCase().match(/\d+|\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\b/g) ?? [];

/** Résumé lines whose figures their Role story does not state, as messages; empty when valid. */
export function resumeLineProblems(story: RoleStory): string[] {
  const said = new Set(storyText(story).toLowerCase().match(/\d+|[a-z]+/g));
  return story.resume.flatMap((line) =>
    figures(line)
      .filter((figure) => !said.has(figure))
      .map((figure) => `Role story "${story.slug}" has a Résumé line with "${figure}", which its story does not say: "${line}"`),
  );
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
    if (story.resume.length < RESUME_LINES.min || story.resume.length > RESUME_LINES.max) {
      problems.push(`Role story "${story.slug}" has ${story.resume.length} Résumé lines, not ${RESUME_LINES.min} to ${RESUME_LINES.max}.`);
    }
    problems.push(...resumeLineProblems(story));
    for (const { section, phrase } of roleStoryReveals[story.slug] ?? []) {
      const { paragraphs = [] } = story.sections[section];
      if (!paragraphs.some((paragraph) => paragraph.includes(phrase))) {
        problems.push(`Role story "${story.slug}" marks "${phrase}", which no paragraph of its "${section}" section says.`);
      }
    }
    for (const key of roleStorySectionKeys) {
      if (!storySectionHasContent(story.sections[key])) {
        problems.push(`Role story "${story.slug}" has an empty "${key}" section.`);
      }
    }
  }
  return problems;
}
