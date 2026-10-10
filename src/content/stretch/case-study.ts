/*
 * The case study shape (docs/specs/STRETCH-REDESIGN-SPEC.md, "Content model";
 * see Case study in GLOSSARY.md). A study holds its own prose; the opening's
 * name, outcome, metadata, links, hero screenshot and colours come from the
 * project catalogue, so they are kept in one place. `caseStudyOpening` joins
 * the two.
 */
import type { CaseStudySlug, Project, ProjectImage } from "../projects";

/** The six sections, in the order they are read. */
export const caseStudySectionKeys = [
  "where-it-started",
  "written-down-first",
  "decisions",
  "how-its-built",
  "where-it-stands",
  "whats-next",
] as const;

export type CaseStudySectionKey = (typeof caseStudySectionKeys)[number];

/** The section links and headings: "01 Where it started" and so on. */
export const caseStudySectionLabels: Record<CaseStudySectionKey, string> = {
  "where-it-started": "Where it started",
  "written-down-first": "What I wrote down first",
  decisions: "Decisions",
  "how-its-built": "How it’s built",
  "where-it-stands": "Where it stands",
  "whats-next": "What I’d do next",
};

/** The labels every case study shares. */
export const caseStudyCopy = {
  back: "← Work",
  live: "Live site ↗",
  code: "Code ↗",
  nextProject: "Next project",
} as const;

export type SectionPoint = { lead: string; text: string };

/** A screenshot placed in a section. Alt text and caption carry over from the Board's case files. */
export type SectionFigure = ProjectImage & { caption: string };

export type CaseStudySection = {
  /** The bold line that opens the section. Absent where the section label is the heading. */
  heading?: string;
  paragraphs?: readonly string[];
  /** Points that open with an italic lead, such as decisions. */
  points?: readonly SectionPoint[];
  /** A figure can attach to any section. */
  figure?: SectionFigure;
};

/** A line from the project's own spec, shown on the PRD card. */
export type PrdCard = {
  /** Text before the quote, when the section reads on from it. */
  lead?: string;
  quote: string;
  /** Text after the quote. */
  after?: string;
  /** "16 April 2026". */
  date?: string;
};

export type EvidenceItem = { value: string; label: string };

export type CaseStudy = {
  /** Matches the project's slug in the catalogue. */
  slug: CaseStudySlug;
  /** The number on the opening, "01". */
  number: string;
  stack: readonly string[];
  /** Said beside the links, for example why there is no live site. */
  note?: string;
  sections: Record<CaseStudySectionKey, CaseStudySection>;
  prd: PrdCard;
  /** At most four. */
  evidence: readonly EvidenceItem[];
  /** The slug of the case study that follows this one. */
  next: CaseStudySlug;
  /** The page's meta description. */
  description: string;
};

export const MAX_EVIDENCE = 4;

/** What the opening band shows: the study's own fields joined with its catalogue entry. */
export type CaseStudyOpening = {
  number: string;
  name: string;
  outcome: string;
  /** "Product · Data visualisation · 2026". */
  metadata: string;
  stack: string;
  note?: string;
  links: Project["links"];
  screenshot: ProjectImage;
  colours: { field: string; ink: string; swatch: string };
};

export function caseStudyOpening(study: CaseStudy, catalogue: readonly Project[]): CaseStudyOpening {
  const project = catalogue.find((entry) => entry.slug === study.slug);
  if (!project) throw new Error(`Case study "${study.slug}" has no project in the catalogue.`);
  if (!project.screenshot || !project.colours) {
    throw new Error(`Case study "${study.slug}" needs its project's screenshot and colours.`);
  }
  return {
    number: study.number,
    name: project.name,
    outcome: project.outcome,
    metadata: `${project.type} · ${project.year}`,
    stack: study.stack.join(", "),
    note: study.note,
    links: project.links,
    screenshot: project.screenshot,
    colours: project.colours,
  };
}

/** Problems with a set of case studies, as messages; empty when valid. */
export function caseStudyProblems(studies: readonly CaseStudy[], catalogue: readonly Project[]): string[] {
  const problems: string[] = [];
  const slugs = studies.map((study) => study.slug);
  for (const study of studies) {
    if (!catalogue.some((project) => project.slug === study.slug)) {
      problems.push(`Case study "${study.slug}" has no project in the catalogue.`);
    }
    if (study.evidence.length > MAX_EVIDENCE) {
      problems.push(`Case study "${study.slug}" has more than ${MAX_EVIDENCE} evidence items.`);
    }
    if (!slugs.includes(study.next) || study.next === study.slug) {
      problems.push(`Case study "${study.slug}" must end with a different case study, not "${study.next}".`);
    }
    for (const key of caseStudySectionKeys) {
      const section = study.sections[key];
      if (!section || !(section.heading || section.paragraphs?.length || section.points?.length)) {
        problems.push(`Case study "${study.slug}" has an empty "${key}" section.`);
      }
    }
  }
  return problems;
}
