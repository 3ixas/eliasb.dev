/*
 * Work's panels (docs/design/DESIGN.md "The homepage, in order" 3, R-13 to R-15): BNP Paribas full width with its
 * figure, the simulation and two comparisons, then Joveen and Optegra with a display figure and three before and
 * after pairs each. The words are the passes and panels spec's, listed in docs/content/redesign-copy.md
 * ("Passes and panels · Work") and checked there by verify:copy. Every figure and every bar's amount is a fact its
 * Role story already tells, and `workPanelProblems` fails when one drifts.
 *
 * Its runtime imports carry a .ts extension, so Node can load it directly as well as Next.
 */
import { roleStories } from "./role-stories.ts";
import type { RoleStory, RoleStorySlug } from "./role-story.ts";
import { storyText } from "./story.ts";

/** One side of a comparison: who or when, and the value written out. */
export type Side = { name: string; value: string };

/**
 * A comparison on BNP Paribas's panel: one row of the Role story's scale figure, which gives what is compared and
 * both amounts in one unit, with each side named and its value written out (DESIGN.md "Figures", bars to scale).
 */
export type Comparison = { row: number; before: Side; after: Side };

/**
 * A before and after pair on Joveen's or Optegra's panel: what moved, its value as the story states it, and the two
 * bar amounts in one unit. A change stated as a percentage is drawn from 100 (`+30%` is 100 against 130).
 */
export type Pair = { what: string; value: string; before: number; after: number };

/** A display figure: one of the story's evidence items, counting from `from` when it is a number that moved. */
export type DisplayFigure = { evidence: number; from: number };

export type BnpPanel = {
  slug: "bnp-paribas";
  /** "Six months" over "from zero C# to production code": the evidence item "Six · months from zero C# …", split after its first word. */
  figure: { value: string; label: string };
  simulation: { start: string; end: string; price: string; caption: string; description: string };
  comparisons: readonly [Comparison, Comparison];
};

export type RolePanel = { slug: RoleStorySlug; figure: DisplayFigure; pairs: readonly [Pair, Pair, Pair] };

export const workPanels = {
  heading: "Work",
  subheading: "History, then marketing, then code. Each move was towards the work I liked most.",
  bnp: {
    slug: "bnp-paribas",
    figure: { value: "Six months", label: "from zero C# to production code" },
    simulation: {
      start: "Today",
      end: "Horizon",
      price: "One price",
      caption:
        "The engines run large simulation-based calculations across several asset classes. Thousands of possible market paths go in; a price and its risk come out.",
      description:
        "Illustrative simulated paths from today to the horizon, a histogram of where they end on the right edge, and a dashed line at their average, labelled one price.",
    },
    comparisons: [
      { row: 0, before: { name: "An experienced engineer", value: "about two weeks" }, after: { name: "Me, new to it", value: "a couple of days" } },
      { row: 1, before: { name: "Before", value: "30–40 min" }, after: { name: "After", value: "under 5 min" } },
    ],
  } satisfies BnpPanel,
  /** Joveen, then Optegra: newest first, side by side under BNP Paribas. */
  roles: [
    {
      slug: "joveen",
      figure: { evidence: 0, from: 0 },
      pairs: [
        { what: "Key API p95", value: "520 ms → 230 ms", before: 520, after: 230 },
        { what: "Time to deploy", value: "10 min → under 2", before: 10, after: 2 },
        { what: "Mobile retention", value: "+30%", before: 100, after: 130 },
      ],
    },
    {
      slug: "optegra",
      figure: { evidence: 0, from: 62 },
      pairs: [
        { what: "Pass rate", value: "62% → 88%", before: 62, after: 88 },
        { what: "p95 page load", value: "−30%", before: 100, after: 70 },
        { what: "Consultation conversion", value: "+15%", before: 100, after: 115 },
      ],
    },
  ] satisfies readonly RolePanel[],
} as const;

/** The row of BNP Paribas's scale figure a comparison draws: what it compares and its two amounts. */
export function comparisonRow(story: RoleStory, { row }: Comparison) {
  const scale = story.figures?.["what-changed"];
  if (scale?.kind !== "scale") return undefined;
  return scale.rows[row];
}

/** A display figure's value and label, split as the panel shows them: the evidence item itself. */
export function displayFigure(story: RoleStory, { evidence }: DisplayFigure) {
  return story.evidence[evidence];
}

/** "−40%" as its sign, size and suffix, so the figure can count up to its size behind a fixed sign (the content's U+2212 minus). */
export function countable(value: string): { prefix: string; to: number; suffix: string } | undefined {
  const match = value.match(/^([−+]?)(\d+)(\D*)$/);
  if (!match) return undefined;
  const [, prefix, digits, suffix] = match;
  return { prefix, to: Number(digits), suffix };
}

const numbersIn = (text: string) => text.match(/\d+/g) ?? [];

/** The two amounts a pair's value states: both numbers when it says "a → b", or 100 and 100 ± n when it is a change of n%. */
function statedAmounts(value: string): [number, number] | undefined {
  const change = value.match(/^([−+])(\d+)%$/);
  if (change) return [100, 100 + Number(change[2]) * (change[1] === "−" ? -1 : 1)];
  const numbers = numbersIn(value).map(Number);
  return numbers.length === 2 ? [numbers[0], numbers[1]] : undefined;
}

/**
 * Work's panels as messages naming what is wrong; empty when every figure and bar is its Role story's own fact.
 * A comparison's values must be in its scale row's labels; a pair's numbers must be in its story, and its bars must
 * be the amounts its value states, so a bar cannot be longer than the fact it draws.
 */
export function workPanelProblems(panels: typeof workPanels, stories: Record<RoleStorySlug, RoleStory> = roleStories): string[] {
  const problems: string[] = [];
  const bnp = stories[panels.bnp.slug];
  const figure = `${panels.bnp.figure.value} ${panels.bnp.figure.label}`;
  if (!bnp.evidence.some((item) => `${item.value} ${item.label}` === figure)) problems.push(`Work: BNP Paribas's figure "${panels.bnp.figure.value} ${panels.bnp.figure.label}" is not one of its Role story's evidence items.`);
  for (const comparison of panels.bnp.comparisons) {
    const row = comparisonRow(bnp, comparison);
    if (!row) {
      problems.push(`Work: BNP Paribas's comparison names scale row ${comparison.row}, which its Role story does not have.`);
      continue;
    }
    for (const [side, bar] of [[comparison.before, row.before], [comparison.after, row.after]] as const) {
      if (!bar.label.includes(side.value)) problems.push(`Work: "${row.what}" writes "${side.value}", which its Role story's figure does not say.`);
    }
  }
  for (const panel of panels.roles) {
    const story = stories[panel.slug];
    if (!displayFigure(story, panel.figure)) problems.push(`Work: ${panel.slug}'s figure names evidence item ${panel.figure.evidence}, which its Role story does not have.`);
    const said = `${storyText(story)} ${story.resume.join(" ")}`;
    for (const pair of panel.pairs) {
      const unsaid = numbersIn(pair.value).find((number) => !said.includes(number));
      if (unsaid) problems.push(`Work: ${panel.slug}'s "${pair.what}" says "${unsaid}", which its Role story does not.`);
      const stated = statedAmounts(pair.value);
      if (!stated) problems.push(`Work: ${panel.slug}'s "${pair.what}" value "${pair.value}" states neither two amounts nor a change in per cent.`);
      else if (stated[0] !== pair.before || stated[1] !== pair.after)
        problems.push(`Work: ${panel.slug}'s "${pair.what}" draws ${pair.before} against ${pair.after}, but its value states ${stated[0]} against ${stated[1]}.`);
    }
  }
  return problems;
}
