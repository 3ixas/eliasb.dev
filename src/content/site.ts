import type { PinStock } from "@/components/board/pin";
// Approved in docs/content/copy/01-board-foundation.md.
export const hero = {
  kicker: "Elias Bennett · Software engineer · London",
  headline: {
    lead: "I build everyday software, and make complicated things",
    emphasis: "feel simple.",
  },
  supportingLine:
    "I take ideas all the way through: deciding what’s worth making, designing it, building it across the stack, and improving it after it ships.",
  portrait: {
    alt: "Elias in a white tuxedo, smiling",
    caption: "Elias · London",
  },
  links: {
    work: "See my work",
    workArrow: "↓",
    email: "Email me",
    emailArrow: "↗",
    emailHref: "mailto:eliasthebennett@gmail.com",
  },
} as const;

// Approved in docs/content/copy/02-work.md.
export const work = {
  kicker: "01 / Work",
  heading: { lead: "Things I’ve been", emphasis: "building." },
  openFolder: "Open the folder",
  /** The screenshot link's accessible name. */
  folderLabel: (name: string) => `Open the ${name} folder`,
  live: "Live",
  code: "Code",
  builtWith: "Built with",
  viewAll: "View all work",
} as const;

export const siteDescription =
  "I’m Elias, a software engineer in London. I take ideas through design, full-stack development, and iteration, aiming to make useful, enjoyable products.";

export const profile = {
  name: "Elias Bennett",
  shortName: "Elias",
  role: "Software engineer",
  location: "London",
  statement: `${hero.headline.lead} ${hero.headline.emphasis}`,
  links: {
    email: "mailto:eliasthebennett@gmail.com",
    github: "https://github.com/3ixas",
    linkedin: "https://linkedin.com/in/elias-t-bennett/",
    resume:
      "https://docs.google.com/document/d/1LhawgweUl1_f85CSVY_CpOkBtZ6NC-PXMrH4jSxSUio/edit?usp=drivesdk",
  },
} as const;

export type ProjectSlug = "threshold" | "argus-risk" | "flowtime";

export type HomepageProject = {
  slug: ProjectSlug;
  index: string;
  name: string;
  eyebrow: string;
  thesis?: string;
  description: string;
  image: string;
  imageAlt: string;
  codeUrl: string;
  liveUrl?: string;
  qualities?: readonly string[];
  /** Headline technologies on the Work note's label tape (approved in docs/content/copy/02-work.md). */
  labelTape: readonly string[];
  /** The colour of the project's sticky note. */
  noteStock: Extract<PinStock, "ochre" | "blueprint" | "sage">;
  imageWidth: number;
  imageHeight: number;
};

export const projects = [
  {
    slug: "threshold",
    index: "01",
    name: "Threshold",
    eyebrow: "Product engineering · Data visualisation · 2026",
    thesis: "A clearer view of what moving could cost.",
    description:
      "A rental calculator for London, Basel, and Zurich. It brings salary, moving costs, and local assumptions together so you can work out what a move might take.",
    qualities: [
      "Shareable URL state",
      "Typed city configuration",
      "Accessible visual reasoning",
    ],
    image: "/projects/threshold.webp",
    imageAlt:
      "Threshold landing page showing rental affordability choices for London, Basel, and Zurich",
    liveUrl: "https://threshold-beta.vercel.app",
    codeUrl: "https://github.com/3ixas/threshold",
    labelTape: ["React 19", "TypeScript", "MapLibre"],
    noteStock: "ochre",
    imageWidth: 1804,
    imageHeight: 1376,
  },
  {
    slug: "argus-risk",
    index: "02",
    name: "Argus Risk",
    eyebrow: "Event-driven systems",
    description:
      "A local simulator for a multi-currency risk platform. Follow simulated prices and trades through the system and into portfolio calculations.",
    image: "/work/argus/overview.webp",
    imageAlt: "Argus Risk interface showing event-driven risk positions",
    codeUrl: "https://github.com/3ixas/argus-risk",
    labelTape: [".NET 8", "Kafka", "PostgreSQL", "SignalR"],
    noteStock: "blueprint",
    imageWidth: 1280,
    imageHeight: 770,
  },
  {
    slug: "flowtime",
    index: "03",
    name: "Flowtime",
    eyebrow: "Offline-first interaction",
    description:
      "A focus timer that keeps accurate time when its browser tab is in the background. It saves your history on your device and asks what you want to do if you close the tab mid-session.",
    image: "/work/flowtime/timer.jpg",
    imageAlt: "Flowtime focus timer interface",
    liveUrl: "https://flowtime-focus-timer.vercel.app",
    codeUrl: "https://github.com/3ixas/flowtime-focus-timer",
    labelTape: ["Next.js", "TypeScript", "Service Worker"],
    noteStock: "sage",
    imageWidth: 1280,
    imageHeight: 640,
  },
] as const satisfies readonly HomepageProject[];

/** Edit this ordered list by hand when the homepage's editorial selection changes. */
export const featuredProjectSlugs = ["threshold", "argus-risk", "flowtime"] as const satisfies readonly ProjectSlug[];

export const featuredProjects = featuredProjectSlugs.map((slug): HomepageProject => {
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`Featured project is missing from the project catalogue: ${slug}`);
  return project;
});
