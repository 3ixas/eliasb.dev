/*
 * Work, the homepage section straight after the hero (see Work in GLOSSARY.md):
 * the Staff passes on their rail, History, and Where I'm headed. Copy is from
 * docs/content/redesign-copy.md ("Work"), approved by Elias; scripts/verify-copy.mjs
 * checks it. BNP Paribas detail stays at CV level: no colleague names, internal
 * system names or review context.
 *
 * Its runtime imports carry a .ts extension, so Node can load it directly as well as Next.
 */
import { projects, type CaseStudySlug } from "../projects.ts";
import { caseStudies } from "./case-studies.ts";
import { roleStories } from "./role-stories.ts";
import { roleStoryColours, type RoleStorySlug } from "./role-story.ts";
import { passLinkLabel, passRecords, type PassState } from "./staff-pass.ts";
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

/**
 * A pass on the rail: whose it is, how it hangs (its resting tilt, in degrees,
 * and an optional strap length in px, so past passes can hang at different
 * heights), and whether the job is current or over. Size and pins follow from
 * the state: only the current pass is large and wears the awards. The current
 * pass also carries its own proofs, the lines under its headline number, so
 * they cannot end up on another employer's pass.
 */
export type RailPass = { slug: RoleStorySlug; tilt: number; strap?: number } & (
  | { state: Extract<PassState, "current">; proofs: readonly string[] }
  | { state: Extract<PassState, "returned"> }
);

export const work = {
  heading: "Work",
  /** The note under the heading: it frames the changes of craft, and was How I got here's. */
  note: "History, then marketing, then code. Each move was towards the work I liked most.",
  /** Newest first: the current pass, then the returned ones. verify:copy checks it covers every Role story once. */
  rail: [
    {
      slug: "bnp-paribas",
      state: "current",
      tilt: -1,
      /**
       * What the pass says beyond its headline number ("Only · C# engineer on the
       * team", from src/content/stretch/staff-pass.ts). The first of the three
       * approved Now proofs is that headline, so it is not repeated here.
       */
      proofs: [
        "I was nominated as an AI Champion, and the workflow I built is now used by several teams across the department.",
        "With that workflow I integrated a pricer in a couple of days, a job that takes an experienced engineer about two weeks.",
      ],
    },
    { slug: "joveen", state: "returned", tilt: 1.5, strap: 84 },
    { slug: "optegra", state: "returned", tilt: -1.2 },
  ] satisfies readonly RailPass[],
  headed: {
    heading: "Where I’m headed",
    line: "I want to be really good at this. Here’s what that means to me, and how far I’ve got.",
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
  /** History is a dashed note under the rail, not a pass: it has no Role story to open. */
  history: { dates: "Before 2021", role: "History at uni", note: "Because I loved it, and I still do." },
} as const;

/** How a Role story's pass hangs on Work (its state and resting tilt), so the story opens on the same pass. */
export function railPass(slug: RoleStorySlug): RailPass {
  const pass = work.rail.find((item) => item.slug === slug);
  if (!pass) throw new Error(`Work's rail has no pass for the Role story "${slug}".`);
  return pass;
}
