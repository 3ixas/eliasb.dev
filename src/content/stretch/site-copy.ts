/*
 * The Stretch redesign's site-wide copy: hero, section headings, Say hello, the
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
    menu: "Menu",
    close: "Close",
    backToWork: "← Work",
  },
  /** The header's greeting, by the visitor's own time of day. `hello` is the line before the browser has read it, and without script. */
  greeting: {
    hello: "Hello",
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    late: "Still up?",
  },
  footer: "Made by Elias",
} as const;

export const notFound = {
  title: "Nothing here",
  heading: "This page doesn’t exist.",
  line: "It’s moved, or it never did. Everything else is where you left it.",
  button: "Back to the homepage →",
  /** The lost-property tag hung beside the heading (#217): the address asked for, stamped. */
  tag: {
    title: "Lost property",
    item: "Item",
    foundAt: "Found at",
    foundAtValue: "eliasb.dev",
    returnTo: "Return to",
    returnToValue: "the homepage",
    stamp: "Not on file",
  },
  /** The lead-in to the five homepage sections, listed under the line. */
  orTry: "Or try",
} as const;

export const hero = {
  name: { first: "Elias", last: "Bennett" },
  /** Plain text directly under the name. */
  role: "Software Engineer",
  portraitLabel: "Based in London",
  headline: { lead: "I build pricing and risk engines at BNP Paribas, and", emphasis: "products of my own." },
  support: "In C# and Java, on CPU and GPU. I’ve won the bank’s Early Careers digitisation competition and a Take Ownership award.",
  actions: { work: "See my work ↓", hello: "Say hello" },
} as const;

/** The homepage section for Elias's own projects, at #things-i-make. */
export const thingsIMake = {
  heading: "Things I make",
  /** What the hero used to say: the Maker of clarity line, then taking ideas all the way through. */
  intro: {
    lead: "I build everyday software, and make complicated things feel simple.",
    support: "I take ideas all the way through: deciding what’s worth making, designing it, building it across the stack, and finding out whether it actually works.",
  },
  /** "06 things I’ve built · 03 I’m proudest of", from the catalogue's counts. */
  note: (built: number, proudest: number) => `${pad(built)} things I’ve built · ${pad(proudest)} I’m proudest of`,
  /** The link to the archive, with the true count. */
  allThings: (built: number) => `Everything I’ve built (${pad(built)}) →`,
} as const;

export const sayHello = {
  bigLink: "Say hello ↗",
  line: "Got an idea, a project, or just want to talk about building things? Email’s the best way to reach me.",
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
