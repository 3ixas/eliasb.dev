export const profile = {
  name: "Elias Bennett",
  shortName: "Elias",
  role: "Software engineer",
  location: "London",
  statement: "I build software that makes complex things easier to understand.",
  introduction:
    "I like getting under the skin of a product: how it works, what the data says, and how it feels to use.",
  about:
    "I’m in London, building high-performance pricing and risk systems. Away from work, I make my own products end to end: I start with the problem, shape the experience, write the code, and stay with the hard bits until they make sense.",
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
    thesis: "Making the cost of a decision visible.",
    description:
      "A rental calculator for London, Basel, and Zurich. It puts salary, moving costs, and local assumptions together so you can see what a move might take.",
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
      "A local simulator for a multi-currency risk platform. Follow simulated prices and trades through the system and see what they do to a portfolio.",
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
      "A focus timer that keeps time when your browser dozes off. It saves your history on your device and lets you choose what happens if you close the tab mid-session.",
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
      "A character-led way to ask questions of history, built around a witty and eccentric professor.",
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
      "Small experiments with rankings, matchups, predictions, and the weekly chaos of a redraft league.",
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
      "Components, interaction ideas, failed directions, and notes from learning how products should feel.",
    href: "/lab#lab-03",
    treatment: "interface",
    image: "/lab/flowtime-interface.jpg",
    imageAlt: "Flowtime focus timer interface showing an idle session",
  },
] as const;
