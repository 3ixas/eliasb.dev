/*
 * The project catalogue behind Work (docs/specs/STRETCH-REDESIGN-SPEC.md,
 * "Content model"; copy approved in docs/content/redesign-copy.md).
 *
 * To add a project, add one entry to `projects`. To change what is featured,
 * edit `featuredSlugs`: it is the one ordered list, up to three slugs, and the
 * Project index is everything else. A featured project needs a case study, a
 * screenshot and its colours; `assertCatalogue` fails the build when it doesn't.
 *
 * This module has no runtime imports, so Node can load it directly (the
 * contract script) as well as Next.
 */

/** The single small prop on a card's edge (see the Fastener in GLOSSARY.md). */
export type Fastener = "tape" | "paperclip" | "pin";

/** What the /work filters group by: Products, Systems or Experiments. */
export const PROJECT_CATEGORIES = ["products", "systems", "experiments"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export type ProjectImage = { src: string; alt: string; width: number; height: number };

export type Project = {
  slug: string;
  name: string;
  /** One line, the thing the project does for someone. */
  outcome: string;
  /** Shown beside the year: "Product · Data visualisation". */
  type: string;
  year: number;
  /** Which /work filter it falls under. */
  category: ProjectCategory;
  links: {
    /** Its case study's path, `/work/<slug>`. Only projects that have one. */
    caseStudy?: string;
    live?: string;
    code?: string;
  };
  /** Needed to be featured; index rows without one ship with no preview. */
  screenshot?: ProjectImage;
  /** The project's own colours, carried by its tile. Needed to be featured. */
  colours?: { field: string; ink: string; swatch: string };
  fastener?: Fastener;
};

/*
 * Ties in `year` keep this order, so list the newer of two same-year projects
 * first. The colours and fasteners come from the chosen Stretch boards.
 */
export const projects: readonly Project[] = [
  {
    slug: "threshold",
    name: "Threshold",
    outcome: "A clearer view of what moving could cost.",
    type: "Product · Data visualisation",
    year: 2026,
    category: "products",
    links: {
      caseStudy: "/work/threshold",
      live: "https://threshold-beta.vercel.app",
      code: "https://github.com/3ixas/threshold",
    },
    screenshot: {
      src: "/work/threshold/landing.webp",
      alt: "Threshold landing page introducing the real cost of moving out",
      width: 2294,
      height: 1750,
    },
    colours: { field: "#1a1714", ink: "#f2efe9", swatch: "#c08a5a" },
    fastener: "tape",
  },
  {
    slug: "argus-risk",
    name: "Argus Risk",
    outcome: "Every number shows where it came from and how old it is.",
    type: "Event-driven systems",
    year: 2026,
    category: "systems",
    links: {
      caseStudy: "/work/argus-risk",
      code: "https://github.com/3ixas/argus-risk",
    },
    screenshot: {
      src: "/work/argus/overview.webp",
      alt: "Argus Risk dashboard showing portfolio value, profit and loss, exposure, and system status",
      width: 2854,
      height: 1716,
    },
    colours: { field: "#0a0a0a", ink: "#f2f2f2", swatch: "#4f86f7" },
    fastener: "paperclip",
  },
  {
    slug: "flowtime",
    name: "Flowtime",
    outcome: "Breaks that match how long you actually focused.",
    type: "Offline-first interaction",
    year: 2026,
    category: "products",
    links: {
      caseStudy: "/work/flowtime",
      live: "https://flowtime-focus-timer.vercel.app",
      code: "https://github.com/3ixas/flowtime-focus-timer",
    },
    screenshot: {
      src: "/work/flowtime/timer.jpg",
      alt: "Flowtime focus timer interface",
      width: 1280,
      height: 640,
    },
    colours: { field: "#1e1915", ink: "#ece4d8", swatch: "#c0876a" },
    fastener: "pin",
  },
  {
    slug: "home-secretary",
    name: "Home Secretary",
    outcome: "A household coordination prototype, built for my software engineering coursework.",
    type: "Prototype",
    year: 2026,
    category: "experiments",
    links: { code: "https://github.com/3ixas/home-secretary-prototype" },
    screenshot: {
      src: "/work/home-secretary/noticeboard.webp",
      alt: "Home Secretary noticeboard for a household, with a form to add an event and one upcoming birthday dinner",
      width: 1280,
      height: 800,
    },
  },
  {
    slug: "risk-event-tracker",
    name: "Risk Event Tracker",
    outcome: "A tested C# Web API for managing risk events.",
    type: "Systems · API",
    year: 2025,
    category: "systems",
    links: { code: "https://github.com/3ixas/risk-event-tracker" },
    screenshot: {
      src: "/work/risk-event-tracker/swagger.webp",
      alt: "Swagger documentation for the Risk Event Tracker API, listing its five risk event endpoints",
      width: 1600,
      height: 1000,
    },
  },
  {
    // Version 1 has no live link: askprofessorpast.com no longer serves it, and
    // the approved copy sends visitors to the code.
    slug: "ask-professor-past",
    name: "Ask Professor Past",
    outcome: "History you can talk to. Version 1; I’m rebuilding it.",
    type: "AI product",
    year: 2025,
    category: "products",
    links: { code: "https://github.com/3ixas/ask-professor-past" },
    screenshot: {
      src: "/work/ask-professor-past/chat.webp",
      alt: "Ask Professor Past chat, with the professor answering a question about ancient Egypt",
      width: 1600,
      height: 1000,
    },
  },
];

/** The featured projects, by slug, in the order they are shown. At most three. */
export const featuredSlugs: readonly string[] = ["threshold", "argus-risk", "flowtime"];

export const MAX_FEATURED = 3;

/** The homepage Project index stops here; the rest is on /work behind "All work". */
export const HOMEPAGE_INDEX_ROWS = 10;

/** The featured projects, in the order of `featured`. Slugs not in the catalogue are skipped. */
export function featuredProjects(catalogue: readonly Project[], featured: readonly string[]): Project[] {
  return featured.flatMap((slug) => catalogue.filter((project) => project.slug === slug));
}

/** Everything that isn't featured, newest year first; ties keep the catalogue's order. */
export function projectIndex(catalogue: readonly Project[], featured: readonly string[]): Project[] {
  return catalogue
    .filter((project) => !featured.includes(project.slug))
    .map((project, position) => ({ project, position }))
    .sort((a, b) => b.project.year - a.project.year || a.position - b.position)
    .map(({ project }) => project);
}

const hexColour = /^#[0-9a-f]{6}$/i;

/**
 * Everything wrong with the catalogue, one sentence each, or an empty list.
 * `caseStudySlugs` are the case studies that really exist.
 */
export function catalogueProblems(
  catalogue: readonly Project[],
  featured: readonly string[],
  caseStudySlugs: Iterable<string>,
): string[] {
  const problems: string[] = [];
  const caseStudies = new Set(caseStudySlugs);

  const seen = new Set<string>();
  for (const { slug } of catalogue) {
    if (seen.has(slug)) problems.push(`The catalogue lists "${slug}" more than once.`);
    seen.add(slug);
  }
  for (const project of catalogue) {
    if (!Number.isInteger(project.year)) problems.push(`"${project.slug}" needs a whole-number year.`);
    if (!PROJECT_CATEGORIES.includes(project.category)) {
      problems.push(`"${project.slug}" needs a category: ${PROJECT_CATEGORIES.join(", ")}.`);
    }
  }

  if (featured.length > MAX_FEATURED) {
    problems.push(`At most ${MAX_FEATURED} projects can be featured, but ${featured.length} are listed.`);
  }
  if (new Set(featured).size !== featured.length) problems.push("A project is featured more than once.");

  for (const slug of featured) {
    const project = catalogue.find((entry) => entry.slug === slug);
    if (!project) {
      problems.push(`Featured project "${slug}" is not in the catalogue.`);
      continue;
    }
    if (project.links.caseStudy !== `/work/${slug}` || !caseStudies.has(slug)) {
      problems.push(`Featured project "${slug}" needs a case study (a link to /work/${slug} and the case study itself).`);
    }
    if (!project.screenshot) problems.push(`Featured project "${slug}" needs a screenshot.`);
    const { colours } = project;
    if (!colours || !hexColour.test(colours.field) || !hexColour.test(colours.ink) || !hexColour.test(colours.swatch)) {
      problems.push(`Featured project "${slug}" needs its colours (field, ink and swatch, as #rrggbb).`);
    }
  }
  return problems;
}

/** Throws, naming every problem, when the catalogue breaks a rule; the build runs it. */
export function assertCatalogue(
  catalogue: readonly Project[],
  featured: readonly string[],
  caseStudySlugs: Iterable<string>,
): void {
  const problems = catalogueProblems(catalogue, featured, caseStudySlugs);
  if (problems.length) {
    throw new Error(`The project catalogue (src/content/projects.ts) is invalid:\n- ${problems.join("\n- ")}`);
  }
}
