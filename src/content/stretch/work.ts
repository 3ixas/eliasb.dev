/*
 * Work, the homepage section straight after the hero (see Work in GLOSSARY.md):
 * a row for each employer, History at uni, and Where I'm headed with its three
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
import { storyText } from "./story.ts";

/**
 * Where a "So far" fact comes from: a Role story (an employer) or a Case study
 * (a project). The tag, the thread colour and the link all follow from it, so
 * none of them can name a different source than the fact does.
 */
export type HeadedSource = { story: RoleStorySlug } | { project: CaseStudySlug };

/**
 * A bar of the self-issued pass: a label, what "good" means as a title, and one
 * fact already in a Role story or Case study as its "So far". `restates` lists
 * the phrases of that fact which the source must contain word for word; the
 * content check fails when one is missing, so a "So far" cannot drift from its
 * source.
 */
export type HeadedBar = {
  label: string;
  title: string;
  soFar: { text: string; restates: readonly string[] };
  source: HeadedSource;
};

/** A bar's source as it is shown: its name for the "So far" tag, the link, the thread colour and the text a "So far" must restate. */
export type ShownSource = { name: string; link: { label: string; href: string }; thread: string; text: string };

export function shownSource(source: HeadedSource): ShownSource {
  if ("story" in source) {
    const story = roleStories[source.story];
    const { short } = passRecords[source.story];
    return {
      name: short,
      link: { label: passLinkLabel(passRecords[source.story]), href: `/work/${source.story}` },
      thread: roleStoryColours(story.colours).swatch,
      text: storyText(story),
    };
  }
  const project = projects.find((entry) => entry.slug === source.project);
  const study = caseStudies[source.project];
  if (!project?.colours) throw new Error(`Where I'm headed names "${source.project}", which has no Project colour.`);
  return {
    name: project.name,
    link: { label: `The ${project.name} case study →`, href: `/things-i-make/${source.project}` },
    // A project's swatch is one colour for both themes; on the light card it falls short of 3:1 (Threshold's is 2.6), so light takes it deepened, as the Role stories' light swatches are.
    thread: `light-dark(color-mix(in srgb, ${project.colours.swatch} 80%, black), ${project.colours.swatch})`,
    text: storyText(study),
  };
}

/** The words that carry a phrase: figures and words of four letters or more. */
const keyWords = (text: string) => text.toLowerCase().match(/\d+|[a-z]{4,}/g) ?? [];

/**
 * Bars whose "So far" does not restate a fact in its source, as messages naming the bar; empty when valid.
 * Each phrase must be in the source, and the shown line must keep a key word of it, so the claim cannot drift from the phrases that check it.
 */
export function headedProblems(bars: readonly HeadedBar[]): string[] {
  return bars.flatMap((bar) => {
    const source = shownSource(bar.source).text.toLowerCase();
    const shown = new Set(keyWords(bar.soFar.text));
    return bar.soFar.restates.flatMap((phrase) => {
      if (!source.includes(phrase.toLowerCase())) return [`Where I’m headed: the ${bar.label} bar’s "So far" restates "${phrase}", which its source does not say.`];
      if (!keyWords(phrase).some((word) => shown.has(word))) return [`Where I’m headed: the ${bar.label} bar’s "So far" no longer shows "${phrase}", which is what checks it.`];
      return [];
    });
  });
}

/** The small enamel glyphs a Pass pin can carry (src/components/quiet/finished-pass.tsx draws them). */
export type PinGlyph = "trophy" | "key" | "spark" | "gauge" | "database" | "phone" | "tick" | "branch";

/** A Pass pin in an employer's closer look: its glyph, what it is for in bold, and the cause or date beside it. */
export type WorkPin = { glyph: PinGlyph; label: string; detail: string };

/**
 * An employer's row (GLOSSARY.md, Row): the Role story it leads to, then what its closer look shows under
 * its pass: three Pass pins, each a result and its cause (a Résumé line from the Role story), and `proofs`,
 * extra lines the copy deck gives the closer look.
 */
export type Employer = {
  slug: RoleStorySlug;
  pins: readonly WorkPin[];
  proofs: readonly string[];
  /** Where the pass's headline figure counts up from, when it is a number that moved (Optegra's pass rate was 62%). */
  countFrom?: number;
};

export const work = {
  heading: "Work",
  /** The note under the heading: it frames the changes of craft. */
  note: "History, then marketing, then code. Each move was towards the work I liked most.",
  /** Newest first. verify:copy checks it covers every Role story once. */
  employers: [
    {
      slug: "bnp-paribas",
      pins: [
        { glyph: "trophy", label: "Winner", detail: "Digitisation · 2025" },
        { glyph: "key", label: "Take Ownership", detail: "Q1 2026" },
        { glyph: "spark", label: "AI Champion", detail: "2026" },
      ],
      /** What the pass says beyond its headline number ("Only · C# engineer on the team", from staff-pass.ts). */
      proofs: [
        "I was nominated as an AI Champion, and the workflow I built is now used by several teams across the department.",
        "With that workflow I integrated a pricer in a couple of days, a job that takes an experienced engineer about two weeks.",
      ],
    },
    {
      slug: "joveen",
      pins: [
        { glyph: "gauge", label: "Page load, cut by 40%", detail: "Cut page load by 40% by refactoring React components and lazy-loading assets." },
        { glyph: "database", label: "Key API p95, 520 ms → 230 ms", detail: "Added indexes and rewrote slow queries, starting with the API that mattered most." },
        { glyph: "phone", label: "Mobile retention, up 30%", detail: "Fixed mobile layout and browser bugs found by a cross-browser testing pipeline." },
      ],
      proofs: [],
      countFrom: 0,
    },
    {
      slug: "optegra",
      pins: [
        { glyph: "tick", label: "Core Web Vitals pass rate, 62% → 88%", detail: "Scoped performance fixes with the engineers and ticketed them." },
        { glyph: "gauge", label: "p95 page load, cut by 30%", detail: "The same scoped, ticketed fixes." },
        { glyph: "branch", label: "Where the switch started", detail: "The best part of the job was working with the engineers who built our website." },
      ],
      proofs: [],
      countFrom: 62,
    },
  ] satisfies readonly Employer[],
  headed: {
    heading: "Where I’m headed",
    line: "Building a whole product well: what to make, why it works, and getting it to production. How far I’ve got on each.",
    soFar: "So far",
    bars: [
      {
        label: "Judgement",
        title: "Knowing what’s worth building.",
        soFar: {
          text: "At Optegra, split tests and dashboards guided what the engineers built next.",
          restates: ["split tests and analytics dashboards", "guided what the engineers worked on next"],
        },
        source: { story: "optegra" },
      },
      {
        label: "Depth",
        title: "Knowing why it works, not just that it does.",
        soFar: {
          text: "Six months from zero C# to production code, in a pricing engine of around 70 projects.",
          restates: ["from zero C# to production code", "around 70 projects"],
        },
        source: { story: "bnp-paribas" },
      },
      {
        label: "Range",
        title: "The whole way, from idea to running in production.",
        soFar: { text: "Threshold, from 57 user stories to a live site.", restates: ["57 user stories"] },
        source: { project: "threshold" },
      },
    ] satisfies readonly HeadedBar[],
  },
  /** History at uni: a row whose closer look is a note. */
  history: {
    title: "History at uni",
    line: "Before 2021 · Because I loved it, and I still do.",
    note: { school: "University of Essex", course: "Diploma of Higher Education, History", date: "Jul 2021" },
  },
} as const;
