/*
 * Work, the homepage section straight after the hero (see Work in GLOSSARY.md):
 * the Staff passes on their rail, History, and Where I'm headed. Copy is from
 * docs/content/redesign-copy.md ("Work"), approved by Elias; scripts/verify-copy.mjs
 * checks it. BNP Paribas detail stays at CV level: no colleague names, internal
 * system names or review context.
 *
 * Its runtime imports carry a .ts extension, so Node can load it directly as well as Next.
 */
import { roleStories } from "./role-stories.ts";
import type { RoleStorySlug } from "./role-story";
import type { PassState } from "./staff-pass.ts";

/**
 * Where a link in Work leads: a Role story, named by its slug so the label and
 * the route come from the story and cannot disagree, or a section of the
 * homepage, with the label it needs.
 */
export type WorkLink = { story: RoleStorySlug } | { section: string; label: string };

/** A link as it is shown. */
export type ShownLink = { label: string; href: string };

export function shownLink(link: WorkLink): ShownLink {
  if ("story" in link) return { label: `The ${roleStories[link.story].employer} story →`, href: `/work/${link.story}` };
  return { label: link.label, href: `#${link.section}` };
}

/** A line of "Where I'm headed": the strand, one proof, and where it leads. */
export type HeadedStrand = { title: string; proof: string; link: WorkLink };

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
    line: "At work, I’m learning to build systems that hold up. On my own products, I’m learning what’s worth building. I want to be genuinely good at both.",
    strands: [
      {
        title: "Systems that hold up.",
        proof: "I shipped a change to live pricing behind a flag, switched off by default, with an end-to-end test nobody asked for.",
        link: { story: "bnp-paribas" },
      },
      {
        title: "Deciding what’s worth building.",
        proof: "Before I built Threshold, I wrote 57 user stories and what was out of scope.",
        link: { section: "things-i-make", label: "Things I make ↓" },
      },
      {
        title: "Building with AI, and bringing people with me.",
        proof: "I built a phase-gated workflow, from grilling the problem to a health review, and showed it to teams across the department. Several now use it.",
        link: { story: "bnp-paribas" },
      },
    ] satisfies readonly HeadedStrand[],
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
