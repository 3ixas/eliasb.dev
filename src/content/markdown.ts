import { profile, siteName } from "@/content/site";
import { projects } from "@/content/projects";
import { howIWork } from "@/content/stretch/how-i-work";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { opening } from "@/content/stretch/opening";
import { roleStories } from "@/content/stretch/role-stories";
import { thingsIMake } from "@/content/stretch/site-copy";
import { work } from "@/content/stretch/work";

/**
 * The site as Markdown, for people and agents who would rather read text than a page: `/index.md` is the homepage, and
 * `/llms.txt` is the short index that points at it and the pages under it (the llms.txt convention, https://llmstxt.org).
 * Both are built from the same typed content the pages are, so they cannot drift from them. Only what is authored goes in:
 * the live signals (the GitHub year, the book, the film, the history row, Now making) are on the page, which says where
 * they come from.
 */
export const siteUrl = "https://www.eliasb.dev";

const absolute = (path: string) => (path.startsWith("/") ? `${siteUrl}${path}` : path);
const link = (label: string, path: string) => `[${label}](${absolute(path)})`;
const email = profile.links.email.replace(/^mailto:/, "");

/** The homepage, section by section in the order the page shows them. */
export function homepageMarkdown(): string {
  const employers = work.employers.map(({ slug }) => {
    const story = roleStories[slug];
    return [
      `- ${link(story.employer, `/work/${slug}`)}: ${story.role}, ${story.dates}.`,
      ...story.resume.map((line) => `  - ${line}`),
    ].join("\n");
  });
  const strands = work.headed.bars.map(({ label, title, soFar }) => `- ${label}: ${title} ${soFar.text}`);
  const made = projects
    .filter((project) => project.links.caseStudy)
    .map((project) => `- ${link(project.name, project.links.caseStudy!)} (${project.year}): ${project.outcome}`);
  const others = projects
    .filter((project) => !project.links.caseStudy)
    .map((project) => {
      const name = project.links.code ? link(project.name, project.links.code) : project.name;
      return `- ${name} (${project.year}): ${project.outcome}`;
    });
  const habits = howIWork.beats.map(({ habit, proof }, index) => `${index + 1}. **${habit}** ${proof}`);
  const week = offTheClock.training.days.map(({ long, session }) => `- ${long}: ${session}`);

  return [
    `# ${siteName}`,
    "",
    `I’m ${profile.shortName}, a ${profile.role.toLowerCase()} in ${profile.location}.`,
    "",
    `> ${opening.headline}`,
    "",
    opening.support,
    "",
    `## ${work.heading}`,
    "",
    work.note,
    "",
    ...employers,
    "",
    `## ${thingsIMake.heading}`,
    "",
    thingsIMake.note,
    "",
    ...made,
    ...others,
    "",
    `The full list is at ${link(thingsIMake.heading, "/things-i-make")}.`,
    "",
    `## ${work.headed.heading}`,
    "",
    work.headed.line,
    "",
    ...strands,
    "",
    `## ${howIWork.heading}`,
    "",
    howIWork.note,
    "",
    ...habits,
    "",
    `## ${offTheClock.heading}`,
    "",
    `${offTheClock.note} My usual training week:`,
    "",
    ...week,
    "",
    `The page also shows what I’m reading, the last film I watched, an odd fact from this week in history, what I’m building now and my GitHub year, live from ${offTheClock.reading.sourceName}, ${offTheClock.watched.sourceName}, ${offTheClock.curiosity.sourceName} and GitHub.`,
    "",
    "## Say hello",
    "",
    `- Email: ${email}`,
    `- ${link("Résumé", profile.links.resume)}`,
    `- ${link("GitHub", profile.links.github)}`,
    `- ${link("LinkedIn", profile.links.linkedin)}`,
    "",
  ].join("\n");
}

/** The short index: who this is, and where each part of the site is in text. */
export function llmsTxt(): string {
  const stories = Object.values(roleStories).map((story) => `- ${link(`${story.role} at ${story.employer}`, `/work/${story.slug}`)}: ${story.dates}`);
  const caseStudies = projects.filter((project) => project.links.caseStudy).map((project) => `- ${link(project.name, project.links.caseStudy!)}: ${project.outcome}`);
  return [
    `# ${siteName}`,
    "",
    `> ${profile.role} in ${profile.location}. ${opening.headline}`,
    "",
    "My personal site. The Markdown homepage below covers the whole site in plain text; the pages under it go deeper into each role and project.",
    "",
    "## The site",
    "",
    `- ${link("Homepage as Markdown", "/index.md")}: who I am, my work, what I make, how I work, off the clock and how to reach me`,
    `- ${link("Résumé", profile.links.resume)}: my career on one page`,
    `- ${link(thingsIMake.heading, "/things-i-make")}: everything I’ve built that I’d happily talk through`,
    "",
    "## Work",
    "",
    ...stories,
    "",
    "## Case studies",
    "",
    ...caseStudies,
    "",
    "## Contact",
    "",
    `- Email: ${email}`,
    `- ${link("GitHub", profile.links.github)}`,
    `- ${link("LinkedIn", profile.links.linkedin)}`,
    "",
  ].join("\n");
}
