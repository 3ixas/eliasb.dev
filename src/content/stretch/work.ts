/*
 * Work, the homepage section straight after the hero (see Work in GLOSSARY.md):
 * Now, Where I'm headed and How I got here. Copy is from
 * docs/content/redesign-copy.md ("Work"), approved by Elias; scripts/verify-copy.mjs
 * checks it. BNP Paribas detail stays at CV level: no colleague names, internal
 * system names or review context.
 *
 * Type imports only, so Node can load it directly as well as Next.
 */
import type { RoleStorySlug } from "./role-story";

export type WorkLink = { label: string; href: string };

/** A line of "Where I'm headed": the strand, one proof, and where it leads. */
export type HeadedStrand = { title: string; proof: string; link: WorkLink };

/** A row of "How I got here". `story` is the Role story it opens; `null` is History, which has none. */
export type GotHereRow = {
  /** "Sep 2021 – Aug 2024". */
  dates: string;
  role: string;
  organisation?: string;
  note: string;
  story: RoleStorySlug | null;
};

export const work = {
  heading: "Work",
  now: {
    heading: "Now",
    role: "Software engineer",
    organisation: "BNP Paribas CIB",
    dates: "Jul 2025 – now",
    proofs: [
      "I’m the team’s only C# engineer, so I own the C# side from planning through review.",
      "I was nominated as an AI Champion, and the workflow I built is now used by several teams across the department.",
      "With that workflow I integrated a pricer in a couple of days, a job that takes an experienced engineer about two weeks.",
    ],
    link: { label: "The BNP Paribas story →", href: "/work/bnp-paribas" },
  },
  headed: {
    heading: "Where I’m headed",
    line: "At work, I’m learning to build systems that hold up. On my own products, I’m learning what’s worth building. I want to be genuinely good at both.",
    strands: [
      {
        title: "Systems that hold up.",
        proof: "I shipped a change to live pricing behind a flag, switched off by default, with an end-to-end test nobody asked for.",
        link: { label: "The BNP Paribas story →", href: "/work/bnp-paribas" },
      },
      {
        title: "Deciding what’s worth building.",
        proof: "Before I built Threshold, I wrote 57 user stories and what was out of scope.",
        link: { label: "Things I make ↓", href: "#things-i-make" },
      },
      {
        title: "Building with AI, and bringing people with me.",
        proof: "I built a phase-gated workflow, from grilling the problem to a health review, and showed it to teams across the department. Several now use it.",
        link: { label: "The BNP Paribas story →", href: "/work/bnp-paribas" },
      },
    ] satisfies readonly HeadedStrand[],
  },
  gotHere: {
    heading: "How I got here",
    note: "History, then marketing, then code. Each move was towards the work I liked most.",
    /** Newest first. */
    rows: [
      {
        dates: "Aug 2024 – Jun 2025",
        role: "Full stack software engineer",
        organisation: "Joveen",
        note: "Cut page load by 40% and deploys from 10 minutes to under 2.",
        story: "joveen",
      },
      {
        dates: "Sep 2021 – Aug 2024",
        role: "Marketing executive",
        organisation: "Optegra Eye Healthcare & Kensington Medical",
        note: "Raised the Core Web Vitals pass rate from 62% to 88%.",
        story: "optegra",
      },
      { dates: "Before 2021", role: "History at uni", note: "Because I loved it, and I still do.", story: null },
    ] satisfies readonly GotHereRow[],
  },
} as const;
