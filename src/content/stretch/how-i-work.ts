/*
 * How I work, from docs/content/redesign-copy.md ("Quiet index · How I work", and "Passes and panels · How I work" for the
 * cards' drawn proofs). BNP Paribas detail stays at CV level.
 */
import type { CaseStudySlug } from "../projects.ts";

/**
 * What a card's inset proof tray draws (DESIGN.md "How I work's cards", R-49): the projects a habit started as linked
 * pills, a count with its stepped slices and PRD link, a live feature-flag switch with its routing chips, or a change
 * in per cent over labelled proportional bars. Every number is in the card's own story or Threshold's evidence
 * (`verify:copy` checks it), so no tray says more than the words.
 */
export type BeatProof =
  | { kind: "projects"; projects: readonly CaseStudySlug[] }
  | { kind: "count"; value: number; slices: number }
  | { kind: "switch"; off: string; on: string; currentPath: string; newPath: string }
  | { kind: "change"; value: string; percent: number; before: string; after: string };

/** Shortens a full month name ("16 April 2026") to its 3-letter form ("16 Apr 2026") for the compact PRD tray link. */
export function shortPrdDate(date: string): string {
  return date.replace(/\b([A-Z][a-z]{2})[a-z]+\b/, "$1");
}

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
  /** The PRD link inside card 2's tray, to the PRD on Threshold's case study; its date is that case study's PRD date. */
  prd: { title: string; href: string };
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
      drawn: { kind: "count", value: 57, slices: 13 },
    },
    {
      habit: "Ship it so it’s safe to undo.",
      proof:
        "At BNP Paribas, taking a stale data dependency out of live pricing, I put the new path behind a feature flag that defaults to off, with caching and an end-to-end test nobody had asked for.",
      highlight: "defaults to off",
      drawn: { kind: "switch", off: "Off", on: "On", currentPath: "Today’s path", newPath: "New cached path" },
    },
    {
      habit: "Measure whether it works.",
      proof:
        "I learned this in marketing. At Optegra, split tests and analytics dashboards showed which changes brought in consultations and guided what the engineers built next; consultation conversion rose by 15%.",
      highlight: "rose by 15%",
      drawn: { kind: "change", value: "+15%", percent: 15, before: "Before", after: "After" },
    },
  ],
  prd: { title: "Threshold’s PRD", href: "/things-i-make/threshold#written-down-first" },
};
