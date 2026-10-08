/*
 * Where I've been: the career log, from docs/content/redesign-copy.md.
 * BNP Paribas detail stays at CV level: no colleague names, internal system
 * names or review context.
 */

export type CareerNote = {
  text: string;
  /** A light label such as "Early 2024". */
  when?: string;
};

export type CareerMilestone = { text: string; when: string };

export type CareerStage = {
  /** "Sep 2021 – Aug 2024". */
  dates: string;
  role: string;
  organisation?: string;
  /** The stage still under way; the log marks it. */
  isCurrent: boolean;
  notes: readonly CareerNote[];
  milestones: readonly CareerMilestone[];
};

export const careerLog = {
  heading: "Where I’ve been",
  note: "History, then marketing, then code.",
  stages: [
    {
      dates: "Before 2021",
      role: "History at uni",
      isCurrent: false,
      notes: [{ text: "Because I loved it, and I still do." }],
      milestones: [],
    },
    {
      dates: "Sep 2021 – Aug 2024",
      role: "Marketing Executive",
      organisation: "Optegra Eye Healthcare & Kensington Medical",
      isCurrent: false,
      notes: [
        { text: "The best part was working with the engineers who built our website." },
        {
          text: "The click: a friend loved his work so much that even a hectic week sounded exciting. I wanted that from mine.",
          when: "Early 2024",
        },
        { text: "Started coding in my spare time, just to see.", when: "Early 2024" },
      ],
      milestones: [],
    },
    {
      dates: "Aug 2024 – Jun 2025",
      role: "Full Stack Software Engineer",
      organisation: "Joveen",
      isCurrent: false,
      notes: [{ text: "All in: an e-commerce role, with a software engineering bootcamp alongside." }],
      milestones: [],
    },
    {
      dates: "Jul 2025 – now",
      role: "Software Engineer",
      organisation: "BNP Paribas CIB, through _nology",
      isCurrent: true,
      notes: [{ text: "Market-data loaders and the pricing engine, as the team’s only C# engineer." }],
      milestones: [
        { text: "Won the Early Careers digitisation competition.", when: "Nov 2025" },
        { text: "_nology Take Ownership award.", when: "Q1 2026" },
        { text: "Nominated as an AI Champion in the risk division.", when: "Spring 2026" },
      ],
    },
  ],
} as const satisfies { heading: string; note: string; stages: readonly CareerStage[] };
