/*
 * Work, the homepage section straight after the hero (see Work in GLOSSARY.md):
 * a row for each employer, then Where I'm headed with its three
 * strand rows. Copy is from docs/content/redesign-copy.md ("Quiet index · Work"), approved by Elias; scripts/verify-copy.mjs
 * checks it. BNP Paribas detail stays at CV level: no colleague names, internal
 * system names or review context.
 *
 * Its runtime imports carry a .ts extension, so Node can load it directly as well as Next.
 */
import { projects, type CaseStudySlug } from "../projects.ts";
import { caseStudies } from "./case-studies.ts";
import { roleStories } from "./role-stories.ts";
import { roleStoryColours, type RoleStorySlug } from "./role-story.ts";
import { passLinkLabel, passRecords } from "./staff-pass.ts";
import { contrastRatio, storyText } from "./story.ts";

/**
 * Where a "So far" fact comes from: a Role story (an employer) or a Case study
 * (a project). The tag, the thread colour and the link all follow from it, so
 * none of them can name a different source than the fact does.
 */
export type HeadedSource = { story: RoleStorySlug } | { project: CaseStudySlug };

/**
 * What a part of Where I'm headed draws from its "So far" line (#459), in the same language as How I work's proof
 * feet: a split test (two variants side by side, one marked as the one that went on), a run of months from zero to
 * production code, or a count of ticks leading to one filled mark for the live site. Every drawn count and claim is
 * held to its "So far" line by `headedProblems` (`verify:copy`).
 */
export type HeadedProof =
  | { kind: "split" }
  | { kind: "months-to-prod"; months: number }
  | { kind: "count-to-live"; value: number };

/**
 * A bar of the self-issued pass: a label, what it takes as a title, one fact
 * already in a Role story or Case study as its "So far", and the drawn proof
 * of that fact. `restates` lists the phrases of that fact which the source
 * must contain word for word; the content check fails when one is missing, so
 * a "So far" cannot drift from its source.
 */
export type HeadedBar = {
  label: string;
  title: string;
  soFar: { text: string; restates: readonly string[] };
  source: HeadedSource;
  drawn: HeadedProof;
};

/** A bar's source as it is shown: its name for the chip, the link, the thread colour, the drawing colour (thread where >= 3:1 on paper, else cobalt), and the text a "So far" must restate. */
export type ShownSource = { name: string; link: { label: string; href: string }; thread: string; drawn: string; text: string };

/** Worst-case paper surface tones (`tokens.css` `--paper` mixed per `parts.css` `.surface--paper` light foot and dark lit top); verified against the stylesheets by `verify:copy`. */
export const PAPER_SURFACE = { light: "#f3f3f2", dark: "#29292c" } as const;

/** Mixes a #rrggbb colour with black in sRGB, matching `color-mix(in srgb, <hex> <share>%, black)`. */
function mixWithBlack(hex: string, share: number): string {
  const channel = (at: number) => Math.round(Number.parseInt(hex.slice(at, at + 2), 16) * share).toString(16).padStart(2, "0");
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

/** The source's thread colour where it holds 3:1 against the paper surface in each theme, else cobalt (#459). */
function drawnColour(light: string, dark: string): string {
  const lightOk = contrastRatio(light, PAPER_SURFACE.light) >= 3;
  const darkOk = contrastRatio(dark, PAPER_SURFACE.dark) >= 3;
  return `light-dark(${lightOk ? light : "var(--cobalt)"}, ${darkOk ? dark : "var(--cobalt)"})`;
}

export function shownSource(source: HeadedSource): ShownSource {
  if ("story" in source) {
    const story = roleStories[source.story];
    const { short } = passRecords[source.story];
    return {
      name: short,
      link: { label: passLinkLabel(passRecords[source.story]), href: `/work/${source.story}` },
      thread: roleStoryColours(story.colours).swatch,
      drawn: drawnColour(story.colours.light.swatch, story.colours.dark.swatch),
      text: storyText(story),
    };
  }
  const project = projects.find((entry) => entry.slug === source.project);
  const study = caseStudies[source.project];
  if (!project?.colours) throw new Error(`Where I'm headed names "${source.project}", which has no Project colour.`);
  const lightThread = mixWithBlack(project.colours.swatch, 0.8);
  const darkThread = project.colours.swatch;
  return {
    name: project.name,
    link: { label: `The ${project.name} case study →`, href: `/things-i-make/${source.project}` },
    // A project's swatch is one colour for both themes; on the light card it falls short of 3:1 (Threshold's is 2.6), so light takes it deepened 20% towards black, using the same resolved hex for chip and drawing.
    thread: `light-dark(${lightThread}, ${darkThread})`,
    drawn: drawnColour(lightThread, darkThread),
    text: storyText(study),
  };
}

/** The words that carry a phrase: figures and words of four letters or more. */
const keyWords = (text: string) => text.toLowerCase().match(/\d+|[a-z]{4,}/g) ?? [];

/** Small number words a "So far" line may spell out instead of digits (matching `role-story.ts`). */
const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"] as const;

/**
 * Bars whose "So far" does not restate a fact in its source, or whose drawn proof does not match its line, as
 * messages naming the bar; empty when valid. Each phrase must be in the source, the shown line must keep a key word
 * of it, and every drawn count or mark must be stated by the shown line.
 */
export function headedProblems(bars: readonly HeadedBar[]): string[] {
  return bars.flatMap((bar) => {
    const source = shownSource(bar.source).text.toLowerCase();
    const shown = new Set(keyWords(bar.soFar.text));
    const allWords = new Set(bar.soFar.text.toLowerCase().match(/\d+|[a-z]+/g) ?? []);
    const problems = bar.soFar.restates.flatMap((phrase) => {
      if (!source.includes(phrase.toLowerCase())) return [`Where I’m headed: the ${bar.label} bar’s "So far" restates "${phrase}", which its source does not say.`];
      if (!keyWords(phrase).some((word) => shown.has(word))) return [`Where I’m headed: the ${bar.label} bar’s "So far" no longer shows "${phrase}", which is what checks it.`];
      return [];
    });
    if (bar.drawn.kind === "split") {
      if (!shown.has("split")) problems.push(`Where I’m headed: the ${bar.label} bar draws a split test, which its "So far" line does not mention.`);
    } else if (bar.drawn.kind === "months-to-prod") {
      const { months } = bar.drawn;
      const word = NUMBER_WORDS[months];
      if (!Number.isInteger(months) || months <= 0) {
        problems.push(`Where I’m headed: the ${bar.label} bar draws ${months} months, which must be a positive whole number.`);
      } else if (!allWords.has(String(months)) && (!word || !allWords.has(word))) {
        problems.push(`Where I’m headed: the ${bar.label} bar draws ${months} months, which its "So far" line does not state.`);
      }
      if (!/\b(?:zero|never\s+writing)\b/i.test(bar.soFar.text)) problems.push(`Where I’m headed: the ${bar.label} bar draws a start from zero, which its "So far" line does not mention.`);
      if (!allWords.has("production")) problems.push(`Where I’m headed: the ${bar.label} bar draws production code, which its "So far" line does not mention.`);
    } else {
      if (!Number.isInteger(bar.drawn.value) || bar.drawn.value <= 0) {
        problems.push(`Where I’m headed: the ${bar.label} bar draws ${bar.drawn.value}, which must be a positive whole number.`);
      } else if (!shown.has(String(bar.drawn.value))) {
        problems.push(`Where I’m headed: the ${bar.label} bar draws ${bar.drawn.value}, which its "So far" line does not state.`);
      }
      if (!shown.has("live")) {
        problems.push(`Where I’m headed: the ${bar.label} bar draws a live mark, which its "So far" line does not mention.`);
      }
    }
    return problems;
  });
}

/** An employer listed in Work and the Markdown mirror, newest first. */
export type Employer = {
  slug: RoleStorySlug;
};

export const work = {
  heading: "Work",
  /** The note under the heading: it frames the changes of craft. */
  note: "History, then marketing, then code. Each move was towards the work I liked most.",
  /** Newest first. verify:copy checks it covers every Role story once. */
  employers: [
    { slug: "bnp-paribas" },
    { slug: "joveen" },
    { slug: "optegra" },
  ] satisfies readonly Employer[],
  headed: {
    heading: "Where I’m headed",
    /** The lead (the passes and panels spec, Decisions 2): it names a level and a character, not a job title. */
    line: "I’m working towards the judgement, depth and range to be trusted to decide what to build, build it well and get it used. Here’s how far I’ve got on each.",
    soFar: "So far",
    bars: [
      {
        label: "Judgement",
        title: "Close enough to users to know what’s worth building.",
        soFar: {
          text: "At Optegra, split tests and dashboards guided what the engineers built next.",
          restates: ["split tests and analytics dashboards", "guided what the engineers worked on next"],
        },
        source: { story: "optegra" },
        drawn: { kind: "split" },
      },
      {
        label: "Depth",
        title: "Knowing it well enough that people can rely on it.",
        soFar: {
          text: "Six months from never writing C# to shipping production code, in a pricing engine of around 70 projects.",
          restates: ["from never writing C# to shipping production code", "around 70 projects"],
        },
        source: { story: "bnp-paribas" },
        drawn: { kind: "months-to-prod", months: 6 },
      },
      {
        label: "Range",
        title: "All the way, from first idea to how it gets used.",
        soFar: { text: "Threshold, from 57 user stories to a live site.", restates: ["57 user stories"] },
        source: { project: "threshold" },
        drawn: { kind: "count-to-live", value: 57 },
      },
    ] satisfies readonly HeadedBar[],
  },
} as const;
