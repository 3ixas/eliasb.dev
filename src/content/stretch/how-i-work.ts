/* How I work, from docs/content/redesign-copy.md. BNP Paribas detail stays at CV level. */

export type Beat = { habit: string; proof: string };

export type HowIWork = {
  heading: string;
  note: string;
  /** Three beats, each a habit and where it shows up. */
  beats: readonly [Beat, Beat, Beat];
  honestLine: string;
  /** Caption of the PRD card beside the beats. */
  prdCaption: string;
};

export const howIWork: HowIWork = {
  heading: "How I work",
  note: "Three habits, and where I picked them up.",
  beats: [
    {
      habit: "Start from a real problem.",
      proof:
        "Threshold started because my friends had no clear idea what renting would cost by area. Flowtime started because Pomodoro kept cutting me off mid-flow.",
    },
    {
      habit: "Write it down first.",
      proof:
        "Before I build, I write down the problem, who it’s for, and what’s out of scope. Threshold had 57 user stories before any code.",
    },
    {
      habit: "Measure whether it works.",
      proof:
        "I learned this in marketing, running split tests and conversion dashboards. At BNP Paribas I co-built a dashboard from users’ requirements that cut a 30–40 minute data load to under 5.",
    },
  ],
  honestLine:
    "My own projects haven’t been launched or measured yet. The next ones I build, I’ll put in front of people.",
  prdCaption: "Threshold’s PRD, 16 April 2026",
};
