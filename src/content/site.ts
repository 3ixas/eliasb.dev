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
    work: "See my work ↓",
    email: "Email me ↗",
    emailHref: "mailto:eliasthebennett@gmail.com",
  },
} as const;

export const siteDescription =
  "I’m Elias, a software engineer in London. I take ideas through design, full-stack development, and iteration, aiming to make useful, enjoyable products.";

export const profile = {
  name: "Elias Bennett",
  shortName: "Elias",
  role: "Software engineer",
  location: "London",
  statement: `${hero.headline.lead} ${hero.headline.emphasis}`,
  about:
    "I’m in London, where I work on high-performance pricing and risk systems. Outside work, I take my own product ideas from the first sketch through design and code, then keep improving them after they ship.",
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

export const labNotes = [
  {
    index: "01",
    title: "Ask Professor Past",
    kind: "History experiment",
    description:
      "A small experiment in asking questions about history through an eccentric fictional professor.",
    href: "/lab#lab-01",
    treatment: "professor",
    image: "/lab/professor-past.webp",
    imageAlt: "Warm illustrated portrait of the eccentric Professor Past",
  },
  {
    index: "02",
    title: "Fantasy models",
    kind: "Football · Data",
    description:
      "Matchup views, rankings, and draft tools for a redraft league. I’m still working out where predictions fit.",
    href: "/lab#lab-02",
    treatment: "fantasy",
    image: "/signals/football-stadium.jpg",
    imageAlt: "Aerial view of a football stadium and marked field",
  },
  {
    index: "03",
    title: "Interface studies",
    kind: "Work in progress",
    description:
      "Small tests of controls and motion, with notes on what feels useful and what doesn’t.",
    href: "/lab#lab-03",
    treatment: "interface",
    image: "/lab/flowtime-interface.jpg",
    imageAlt: "Flowtime focus timer interface showing an idle session",
  },
] as const;
