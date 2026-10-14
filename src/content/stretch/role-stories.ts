/*
 * The Role stories in the Stretch shape. Copy is from
 * docs/content/redesign-copy.md ("Role stories"), approved by Elias before it
 * was written here. Public-safe: no colleague names, internal system names, or
 * appraisal, pay or level terms.
 */
import type { RoleStory, RoleStorySlug } from "./role-story";

/** Joveen and Optegra join in #174; until then a slug without a story is a 404. */
export const roleStories: Partial<Record<RoleStorySlug, RoleStory>> = {
  "bnp-paribas": {
    slug: "bnp-paribas",
    employer: "BNP Paribas",
    role: "Software engineer",
    number: "01",
    metadata: "Risk division · London · Jul 2025 – now",
    sections: {
      summary: {
        paragraphs: [
          "I’m a software engineer in BNP Paribas’s risk division in London. I work in C# on the engines that price and risk-manage trades on CPU and GPU, and I’m the team’s only C# engineer.",
        ],
      },
      "the-role": {
        paragraphs: [
          "The engines run large simulation-based calculations across several asset classes. It’s a big codebase, around 70 projects, and some of the C# is translated to run on the GPU.",
          "I joined in July 2025 having never written C#. Today I own implementation and delivery on the C# side, from planning through review.",
        ],
      },
      "the-problems": {
        points: [
          {
            lead: "Market data.",
            text: "Loaders written in Java had to be ported to C#, pulling data from several sources into one place and checking it on the way.",
          },
          {
            lead: "A stale dependency.",
            text: "The live pricing pipeline relied on a data file that was no longer reliably available in production.",
          },
          {
            lead: "Quant code.",
            text: "Pricing code written by quantitative developers had to be integrated into the engine.",
          },
          { lead: "Two execution paths.", text: "The same tests had to run on both CPU and GPU." },
        ],
      },
      decisions: {
        points: [
          {
            lead: "Ship the risky change behind a flag, switched off.",
            text: "Removing the dependency touched live pricing, so I put the new path behind a feature flag that defaults to off, added caching, and wrote an end-to-end test nobody had asked for. The architect’s view was that the thing to protect was the blast radius, not only correctness. I’d have called that a nice-to-have before; now it’s how I start.",
          },
          {
            lead: "Validate the data before trusting it.",
            text: "The commodity loader was the harder one: ten file types, correlation groups, unit conversions, and records linked to each other. I checked the links, so an orphaned record gets caught on load rather than showing up as a strange number in a simulation.",
          },
          {
            lead: "Give AI work phases.",
            text: "I built a workflow where each stage has its own scoped agent: grill the problem, plan, build test-first, self-review, then a health review. Each agent only sees what that stage needs, which keeps it from skipping ahead.",
          },
        ],
      },
      "what-changed": {
        paragraphs: [
          "I used that workflow to integrate a pricer into the calculation engine in a couple of days. For an experienced integration engineer it takes about two weeks, and I was new to it.",
          "I went from no C# to shipping production code independently in six months.",
          "The Early Careers digitisation competition is the other half of this. I led a team of four and co-built a dashboard from our users’ requirements, which cut a 30–40 minute data load to under 5. We won, out of five groups, and presented it to the Head of Risk Systems.",
        ],
      },
      "what-i-took-with-me": {
        paragraphs: [
          "I was nominated as an AI Champion in the risk division, and the workflow is now used by several teams across the department. I also won a Take Ownership award.",
          "The habit underneath all of it is simple: write down what you’re doing before you build it, and ship it so it’s safe to undo.",
        ],
      },
    },
    evidence: [
      { value: "Nov 2025", label: "won the Early Careers digitisation competition" },
      { value: "Q1 2026", label: "Take Ownership award" },
      { value: "Spring 2026", label: "nominated AI Champion" },
      { value: "6", label: "months from zero C# to production code" },
    ],
    // BNP's green, as a hue only (no logo). The light field takes near-black ink (5.0:1);
    // the dark field is the same hue deepened and takes light ink (11.4:1).
    colours: {
      light: { field: "#00965e", ink: "#06120d", swatch: "#053824" },
      dark: { field: "#0b3a28", ink: "#eaf5ef", swatch: "#3ecf8e" },
    },
    next: null,
  },
};

export const roleStorySlugs = Object.keys(roleStories) as RoleStorySlug[];

/** The one checked lookup for a slug that comes from a URL, which is untrusted text. */
export function roleStoryFor(slug: string): RoleStory | undefined {
  return Object.hasOwn(roleStories, slug) ? roleStories[slug as RoleStorySlug] : undefined;
}
