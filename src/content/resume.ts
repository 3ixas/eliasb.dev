/*
 * The Résumé (see Résumé in GLOSSARY.md): the sheet at /resume and the text its PDF must hold.
 * It owns only what the site does not already say, which is Education and grouped Skills. Roles,
 * dates and results come from the Role stories, the projects from the same featured list Work
 * uses, awards from the Staff pass's pins, and the summary and contact details from the opening
 * line and the profile, so the sheet cannot drift from them.
 *
 * Its runtime imports carry a .ts extension, so Node can load it directly (the PDF check) as well
 * as Next.
 */
import { featuredProjects, featuredSlugs, projects } from "./projects.ts";
import { profile } from "./site.ts";
import { opening } from "./stretch/opening.ts";
import { roleStories, roleStorySlugs } from "./stretch/role-stories.ts";
import { passRecords } from "./stretch/staff-pass.ts";

/** The public address the PDF's links point at; the page links to its own paths. */
export const resumeOrigin = "https://www.eliasb.dev";

/** Where the committed PDF is served, and the file the render script writes. */
export const resumePdf = { href: "/Elias-Bennett-Resume.pdf", file: "public/Elias-Bennett-Resume.pdf" } as const;

export const resumeCopy = {
  title: "Résumé",
  description: "Elias Bennett’s résumé on one page: his roles at BNP Paribas, Joveen and Optegra, three projects, awards, skills and education.",
  download: "Download PDF",
  sections: { experience: "Experience", projects: "Selected projects", awards: "Awards", skills: "Skills", education: "Education" },
} as const;

/** Education is not on the site anywhere else; Elias checks these on the pull request. */
const education = [
  { school: "University of Derby", course: "Computing and Information Technologies BSc (Hons)", dates: "Expected Jun 2027" },
  { school: "University of Essex", course: "Diploma of Higher Education, History", dates: "Jul 2021" },
] as const;

/** Grouped from the languages, frameworks and tools the Role stories and case studies already name. */
const skills = [
  { group: "Languages", items: "C#, Java, TypeScript, Python, SQL" },
  { group: "Frameworks", items: ".NET, Spring Boot, React, Next.js" },
  { group: "Data and messaging", items: "PostgreSQL, MySQL, Kafka" },
  { group: "Practice", items: "Docker, feature flags, CPU and GPU testing" },
] as const;

export type ResumeLink = { label: string; href: string };

export type ResumeSheet = {
  name: string;
  role: string;
  location: string;
  contacts: readonly ResumeLink[];
  summary: string;
  experience: readonly { role: string; employer: string; dates: string; results: readonly string[]; story: ResumeLink }[];
  projects: readonly { name: string; outcome: string; meta: string; study: ResumeLink }[];
  awards: readonly { label: string; detail: string }[];
  skills: readonly { group: string; items: string }[];
  education: readonly { school: string; course: string; dates: string }[];
};

const bare = (url: string) => url.replace(/^(mailto:|https?:\/\/)/, "").replace(/\/$/, "");
const siteHost = bare(resumeOrigin).replace(/^www\./, "");

export function resumeSheet(): ResumeSheet {
  return {
    name: profile.name,
    // The sheet's own role line, capitalised as on the PDF; the homepage no longer has one.
    role: "Software Engineer",
    location: profile.location,
    contacts: [
      { label: bare(profile.links.email), href: profile.links.email },
      { label: siteHost, href: "/" },
      { label: bare(profile.links.github), href: profile.links.github },
      { label: bare(profile.links.linkedin), href: profile.links.linkedin },
    ],
    summary: opening.headline,
    // Newest first: the Role stories are declared in that order, and each one's `next` follows it.
    experience: roleStorySlugs.map((slug) => {
      const story = roleStories[slug];
      return {
        role: story.role,
        employer: story.employer,
        dates: story.dates,
        results: story.resume,
        story: { label: `${siteHost}/work/${slug}`, href: `/work/${slug}` },
      };
    }),
    projects: featuredProjects(projects, featuredSlugs).map((project) => ({
      name: project.name,
      outcome: project.outcome,
      meta: `${project.type} · ${project.year}`,
      study: { label: `${siteHost}${project.links.caseStudy}`, href: project.links.caseStudy! },
    })),
    awards: passRecords["bnp-paribas"].pins?.map(({ label, detail }) => ({ label, detail })) ?? [],
    skills,
    education,
  };
}

/**
 * The sheet's text in reading order, one string for each thing a reader sees: what the PDF's text must
 * contain, in this order, and nothing else. It lists the same things in the same order as
 * src/components/site/resume.tsx, and e2e/resume.spec.ts fails when the rendered sheet's text differs
 * from it, so the page, this list and (through verify:resume) the PDF cannot drift apart unseen.
 */
export function resumeText(sheet: ResumeSheet): string[] {
  return [
    sheet.name,
    sheet.role,
    sheet.location,
    ...sheet.contacts.map(({ label }) => label),
    sheet.summary,
    resumeCopy.sections.experience,
    ...sheet.experience.flatMap(({ role, employer, dates, results, story }) => [role, employer, dates, ...results, story.label]),
    resumeCopy.sections.projects,
    ...sheet.projects.flatMap(({ name, outcome, meta, study }) => [name, outcome, meta, study.label]),
    resumeCopy.sections.awards,
    ...sheet.awards.flatMap(({ label, detail }) => [label, detail]),
    resumeCopy.sections.skills,
    ...sheet.skills.flatMap(({ group, items }) => [group, items]),
    resumeCopy.sections.education,
    ...sheet.education.flatMap(({ school, course, dates }) => [school, course, dates]),
  ];
}
