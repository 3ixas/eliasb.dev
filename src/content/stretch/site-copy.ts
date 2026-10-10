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
  titleHome: "Elias Bennett, software engineer in London",
  /** Other pages: "{Page} · Elias Bennett". */
  title: (page: string) => `${page} · Elias Bennett`,
  description:
    "I’m Elias, a software engineer in London. I build everyday software, and make complicated things feel simple. Here’s my work, how I work, and what I’m up to.",
  socialImage: {
    name: "ELIAS BENNETT",
    lead: "I build everyday software, and make complicated things",
    emphasis: "feel simple.",
  },
  /** The homepage's anchored sections after the hero, in order: each section's anchor with its label. */
  menu: [
    { id: "work", label: "Work" },
    { id: "how-i-work", label: "How I work" },
    { id: "where-ive-been", label: "Where I’ve been" },
    { id: "off-the-clock", label: "Off the clock" },
    { id: "say-hello", label: "Say hello" },
  ],
  header: {
    lightsOn: "Lights on",
    lightsOff: "Lights off",
    menu: "Menu",
    close: "Close",
    backToWork: "← Work",
  },
  clock: {
    label: (time: string) => `London ${time}`,
    /** Read aloud in place of the visible label. */
    spoken: (time: string) => `The time in London: ${time}`,
  },
  footer: "Made by Elias",
} as const;

export const notFound = {
  title: "Nothing here",
  heading: "This page doesn’t exist.",
  line: "It’s moved, or it never did. Everything else is where you left it.",
  button: "Back to the homepage →",
} as const;

export const hero = {
  name: { first: "Elias", last: "Bennett" },
  portraitLabel: "Software engineer",
  headline: { lead: "I build everyday software, and make complicated things", emphasis: "feel simple." },
  support:
    "I take ideas all the way through: deciding what’s worth making, designing it, building it across the stack, and finding out whether it actually works.",
  actions: { work: "See my work ↓", hello: "Say hello" },
} as const;

export const workSection = {
  heading: "Work",
  /** "06 things I’ve built · 03 I’m proudest of", from the catalogue's counts. */
  note: (built: number, proudest: number) => `${pad(built)} things I’ve built · ${pad(proudest)} I’m proudest of`,
  allWork: (built: number) => `All work (${pad(built)}) →`,
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

/** The archive at /work. */
export const workArchive = {
  heading: "Work",
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
  description: "Projects I’ve built, from a rental calculator to a risk simulator, with the thinking behind the main ones.",
} as const;
