/* How I work, from docs/content/redesign-copy.md ("Quiet index · How I work"). BNP Paribas detail stays at CV level. */

export type Beat = {
  habit: string;
  proof: string;
  /** The phrase in the proof that the pen underlines; the strongest evidence, and part of the proof word for word. */
  underline: string;
};

export type HowIWork = {
  heading: string;
  note: string;
  /** Four habits, each with the proof of where it shows up. */
  beats: readonly [Beat, Beat, Beat, Beat];
  /** The row after the habits; its closer look types the quote from the Threshold case study, and its line is that case study's PRD date. */
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
      underline: "no clear idea",
    },
    {
      habit: "Write it down first.",
      proof:
        "Before I build, I write down the problem, who it’s for, and what’s out of scope. Threshold had 57 user stories before any code.",
      underline: "57 user stories",
    },
    {
      habit: "Ship it so it’s safe to undo.",
      proof:
        "At BNP Paribas, taking a stale data dependency out of live pricing, I put the new path behind a feature flag that defaults to off, with caching and an end-to-end test nobody had asked for.",
      underline: "defaults to off",
    },
    {
      habit: "Measure whether it works.",
      proof:
        "I learned this in marketing. At Optegra, split tests and analytics dashboards showed which changes brought in consultations and guided what the engineers built next; consultation conversion rose by 15%.",
      underline: "rose by 15%",
    },
  ],
  prd: { title: "Threshold’s PRD" },
};
