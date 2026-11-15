/*
 * How I work, from docs/content/redesign-copy.md ("Quiet index · How I work", and "Passes and panels · How I work" for the
 * cards' drawn proofs). BNP Paribas detail stays at CV level.
 */
import type { CaseStudySlug } from "../projects.ts";

/**
 * What a card's foot draws (DESIGN.md "How I work's cards"): the projects a habit started, a count as that many ticks, a
 * switch in its state, or a change in per cent as a bar that much longer. Every number is in the card's own story
 * (`verify:copy` checks it), so the drawing never says more than the words.
 */
export type BeatProof =
  | { kind: "projects"; projects: readonly CaseStudySlug[] }
  | { kind: "count"; value: number }
  | { kind: "switch"; label: string }
  | { kind: "change"; value: string; percent: number };

export type Beat = {
  habit: string;
  proof: string;
  /** The phrase in the story that the card highlights; the strongest evidence, and part of the story word for word. */
  highlight: string;
  drawn: BeatProof;
};

export type HowIWork = {
  heading: string;
  note: string;
  /** Four habits, each with the proof of where it shows up. */
  beats: readonly [Beat, Beat, Beat, Beat];
  /** The link after the cards, to the PRD on Threshold's case study; its date is that case study's PRD date. */
  prd: { title: string };
};

export const howIWork: HowIWork = {
  heading: "How I work",
  note: "Four habits, and where I picked them up.",
  beats: [
    {
      habit: "Start from a real problem.",
      proof:
        "Threshold started because my friends had no clear idea what renting would cost by area. Flowtime started because Pomodoro kept cutting me off mid-flow.",
      highlight: "no clear idea",
      drawn: { kind: "projects", projects: ["threshold", "flowtime"] },
    },
    {
      habit: "Write it down first.",
      proof:
        "Before I build, I write down the problem, who it’s for, and what’s out of scope. Threshold had 57 user stories before any code.",
      highlight: "57 user stories",
      drawn: { kind: "count", value: 57 },
    },
    {
      habit: "Ship it so it’s safe to undo.",
      proof:
        "At BNP Paribas, taking a stale data dependency out of live pricing, I put the new path behind a feature flag that defaults to off, with caching and an end-to-end test nobody had asked for.",
      highlight: "defaults to off",
      drawn: { kind: "switch", label: "Off" },
    },
    {
      habit: "Measure whether it works.",
      proof:
        "I learned this in marketing. At Optegra, split tests and analytics dashboards showed which changes brought in consultations and guided what the engineers built next; consultation conversion rose by 15%.",
      highlight: "rose by 15%",
      drawn: { kind: "change", value: "+15%", percent: 15 },
    },
  ],
  prd: { title: "Threshold’s PRD" },
};
