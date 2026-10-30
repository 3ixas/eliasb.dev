/*
 * The Stretch redesign's site-wide copy: section headings, Say hello, the
 * Work archive and the 404. Every string is from docs/content/redesign-copy.md
 * (approved 8 October 2026); `scripts/verify-copy.mjs` checks that.
 *
 * No runtime imports (the type import is erased), so Node can load it directly
 * (the contract script) as well as Next.
 */

import type { ProjectCategory } from "../projects";

const pad = (n: number) => String(n).padStart(2, "0");

export const siteCopy = {
  titleHome: "Elias Bennett, software engineer at BNP Paribas",
  /** Other pages: "{Page} · Elias Bennett". */
  title: (page: string) => `${page} · Elias Bennett`,
  description:
    "I’m Elias, a software engineer in London. I build pricing and risk engines at BNP Paribas in C# and Java, and products of my own.",
  socialImage: {
    name: "ELIAS BENNETT",
    lead: "I build pricing and risk engines at BNP Paribas, and",
    emphasis: "products of my own.",
  },
  /** The homepage's anchored sections after the hero, in order: each section's anchor with its label. */
  menu: [
    { id: "work", label: "Work" },
    { id: "things-i-make", label: "Things I make" },
    { id: "how-i-work", label: "How I work" },
    { id: "off-the-clock", label: "Off the clock" },
    { id: "say-hello", label: "Say hello" },
  ],
  header: {
    darkTheme: "Dark theme",
    backToWork: "← Work",
    /** Said beside the greeting on a wide screen while it is hovered or focused: London's time, as {HH:MM}. */
    londonTime: (time: string) => `it’s ${time} here in London`,
    /** The header's links, named for the page they belong to. */
    linksLabel: "On this page",
    /** The portrait's closer look caption (moved from the old hero label). Its button is named "A closer look at Elias", as every object button is named for what it shows. */
    portrait: { caption: "Based in London" },
  },
  /** The header's greeting, by the visitor's own time of day. `hello` is the line before the browser has read it, and without script. The afternoon alone knows the day: Saturday and Sunday are the visitor's own. */
  greeting: {
    hello: "Hello",
    morning: "Kettle’s on.",
    afternoon: { weekday: "Nearly five?", weekend: "Nowhere to be?" },
    evening: "Home yet?",
    late: "Still up?",
  },
} as const;

export const notFound = {
  title: "Nothing here",
  heading: "This page doesn’t exist.",
  line: "It’s moved, or it never did. Everything else is where you left it.",
  /** The missing row: the address asked for is its title, struck through; these are its line and its metadata. */
  missing: { line: "Not on file", meta: "404" },
  /** The section title and note above the five homepage sections, and each section's line, by its anchor. */
  tryTitle: "Try one of these",
  tryNote: "The homepage, a section at a time.",
  tryLines: {
    work: "BNP Paribas, Joveen and Optegra",
    "things-i-make": "Threshold, Argus Risk, Flowtime and more",
    "how-i-work": "Four habits, and the proof for each",
    "off-the-clock": "Training, a book, a film, this week in history",
    "say-hello": "The email, the résumé, GitHub and LinkedIn",
  },
} as const;

/** The homepage section for Elias's own projects, at #things-i-make. */
export const thingsIMake = {
  heading: "Things I make",
  note: "Products of my own, from a rental calculator to a risk simulator.",
  /** Rows whose line is shorter than the project's own outcome, which the inner pages keep. */
  rowOutcomes: {
    "argus-risk": "A risk simulator where every number shows its source and age.",
    "home-secretary": "A household coordination prototype, built for coursework.",
  } as Readonly<Record<string, string>>,
  /** The link to the archive, with the true count. */
  allThings: (built: number) => `Everything I’ve built (${pad(built)}) →`,
} as const;

export const sayHello = {
  /** The email's button, and what it says for two seconds once the address is on the clipboard. */
  copy: "Copy",
  copied: "Copied",
  /** In the order shown. `id` names the profile link (src/content/site.ts) each one opens. */
  links: [
    { id: "resume", label: "Résumé" },
    { id: "github", label: "GitHub" },
    { id: "linkedin", label: "LinkedIn" },
  ],
} as const;

/** The archive at /things-i-make. */
export const workArchive = {
  heading: "Things I make",
  note: "Everything I’ve built that I’d happily talk through.",
  /** Filters appear only once the archive has more than this many projects. */
  filtersAfter: 10,
  /** In the order shown; `category: null` is All. */
  filters: [
    { label: "All", category: null },
    { label: "Products", category: "products" },
    { label: "Systems", category: "systems" },
    { label: "Experiments", category: "experiments" },
  ] satisfies readonly { label: string; category: ProjectCategory | null }[],
  /** Read out to assistive technology when a filter changes the list; not shown. */
  count: (shown: number) => `Showing ${shown} ${shown === 1 ? "project" : "projects"}`,
  description: "Products of my own, from a rental calculator to a risk simulator, with the thinking behind the main ones.",
} as const;
