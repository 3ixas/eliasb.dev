import type { CaseStudySlug } from "@/content/case-studies";

/*
 * Case studies as opened case-file folders. Copy approved in
 * docs/content/copy/03-threshold.md; Argus Risk and Flowtime move here in #81,
 * and until then keep the older chapter page.
 */

export type CaseFileSectionId = "problem" | "decisions" | "how-its-built" | "what-id-change";

type Image = { src: string; alt: string; width: number; height: number };

export type CaseFileSection = {
  id: CaseFileSectionId;
  heading: string;
  paragraphs?: readonly string[];
  /** Points that open with a bold lead, such as decisions or changes. */
  points?: readonly { lead: string; text: string }[];
  figure?: Image & { caption: string };
};

export type CaseFile = {
  slug: CaseStudySlug;
  /** The number on the "Case file Nº" stamp. */
  number: string;
  name: string;
  kicker: string;
  thesis: string;
  summary: string;
  labelTape: readonly string[];
  liveUrl?: string;
  codeUrl: string;
  /** The paperclipped screenshot, with the pencil note beneath it. */
  screenshot: Image & { note: string };
  sections: readonly CaseFileSection[];
  /** The page's meta description. */
  description: string;
};

/** The divider tabs, in order, each on its own paper stock. */
export const caseFileTabs: readonly { id: CaseFileSectionId; label: string; stock: "terracotta" | "sage" | "blueprint" | "ochre" }[] = [
  { id: "problem", label: "Problem", stock: "terracotta" },
  { id: "decisions", label: "Decisions", stock: "sage" },
  { id: "how-its-built", label: "How it’s built", stock: "blueprint" },
  { id: "what-id-change", label: "What I’d change", stock: "ochre" },
];

export const caseFileCopy = {
  stamp: "Case file Nº",
  backToWork: "Back to Work",
  backToWorkHref: "/#work",
  tabsLabel: "Sections",
  builtWith: "Built with",
  live: "Live site",
  code: "Code",
} as const;

export const caseFiles: Partial<Record<CaseStudySlug, CaseFile>> = {
  threshold: {
    slug: "threshold",
    number: "01",
    name: "Threshold",
    kicker: "Product engineering · Data visualisation · 2026",
    thesis: "A clearer view of what moving could cost.",
    summary:
      "Rent calculators tell you the rent. Threshold tells you what it takes to move: the money you need on day one, what you’ll spend each month after, and how long it would take to save the difference. It covers London, Basel, and Zurich.",
    labelTape: ["React 19", "TypeScript", "MapLibre"],
    liveUrl: "https://threshold-beta.vercel.app",
    codeUrl: "https://github.com/3ixas/threshold",
    screenshot: {
      src: "/work/threshold/landing.webp",
      alt: "Threshold landing page introducing the real cost of moving out",
      width: 2294,
      height: 1750,
      note: "the first thing you see when you open it",
    },
    sections: [
      {
        id: "problem",
        heading: "The rent is the easy part.",
        paragraphs: [
          "Most rent calculators stop at the monthly figure. That’s the number everyone asks about, but it isn’t what decides whether you can move. Before you get the keys you might need five weeks’ deposit in London, or three months’ in Switzerland, plus the first month’s rent, moving costs, and furniture.",
          "The monthly picture is muddled too. Council tax in London, health insurance in Switzerland, transport that depends on which zone you live in. Each of these is easy to find on its own; the hard part is seeing them together for one flat in one district.",
          "So the question I wanted to answer was simple: can I afford to move, and if not, how long until I can?",
        ],
      },
      {
        id: "decisions",
        heading: "Two totals and a straight answer.",
        points: [
          {
            lead: "Upfront and monthly stay separate.",
            text: "Adding them together hides the real problem. You can often afford the monthly costs long before you’ve saved the upfront ones, so Threshold shows both totals side by side.",
          },
          {
            lead: "The answer is one of three.",
            text: "You can move now; not yet, and here’s how many months of saving it would take; or your income doesn’t cover the monthly costs. I’d rather give a clear answer than a score you have to interpret.",
          },
          {
            lead: "Each city keeps its own rules.",
            text: "London, Basel, and Zurich have different deposits, local charges, and transport passes. Threshold doesn’t use one set of assumptions for all three, and every default can be changed.",
          },
          {
            lead: "Suggestions show what would help.",
            text: "If a cheaper district nearby, a smaller place, or a flatmate would save a meaningful amount each month, Threshold says so and shows how much.",
          },
        ],
        figure: {
          src: "/work/threshold/costs.webp",
          alt: "Threshold results showing upfront and monthly cost breakdowns",
          width: 2298,
          height: 1750,
          caption: "Upfront and monthly totals, kept apart.",
        },
      },
      {
        id: "how-its-built",
        heading: "The link is the save file.",
        paragraphs: [
          "Everything you choose lives in the URL: the district, the home, the household, and your income and savings. There’s no account and no backend. Copy the link and someone else sees exactly the same scenario, and you can add a second scenario to compare two moves.",
          "The calculations are plain functions with no state of their own, so each one is easy to test. The project has 182 tests, mostly against those functions.",
          "The maps use MapLibre with real boundaries: 33 London boroughs, Zurich’s 12 Kreise, and Basel grouped into seven areas. London transport costs follow the TfL zone for each borough.",
          "The cost data is a snapshot from April 2026, taken from sources like the ONS, Numbeo, and the transport operators. Each city shows when its figures were last updated.",
        ],
        figure: {
          src: "/work/threshold/calculator.webp",
          alt: "Threshold calculator with a district map and scenario controls",
          width: 2296,
          height: 1748,
          caption: "The district map and the choices that drive the estimate.",
        },
      },
      {
        id: "what-id-change",
        heading: "What I’d do next.",
        points: [
          {
            lead: "Keep the data fresh.",
            text: "The figures are a hand-collected snapshot from April 2026, so they start going stale straight away. I’d move them to a scheduled refresh where the sources allow it.",
          },
          {
            lead: "Show the sources in the app.",
            text: "Each city shows a date, but not where each figure came from. I’d link every default to its source so you can check it.",
          },
          {
            lead: "Finer areas in Basel.",
            text: "Basel is grouped into seven areas rather than its 19 Wohnviertel, which hides real differences in rent.",
          },
        ],
      },
    ],
    description:
      "A rental calculator for London, Basel, and Zurich that shows what a move really costs: upfront, monthly, and how long until you can afford it.",
  },
};
