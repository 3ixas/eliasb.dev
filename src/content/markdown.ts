import { profile, siteName } from "@/content/site";
import { projects } from "@/content/projects";
import { howIWork } from "@/content/stretch/how-i-work";
import { offTheClock } from "@/content/stretch/off-the-clock";
import { opening } from "@/content/stretch/opening";
import { roleStories } from "@/content/stretch/role-stories";
import { siteCopy, thingsIMake } from "@/content/stretch/site-copy";
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
  const employers = work.employers.map(({ slug, pins }) => {
    const story = roleStories[slug];
    return [
      `- ${link(story.employer, `/work/${slug}`)}: ${story.role}, ${story.dates}.`,
      ...pins.map(({ label, detail }) => `  - ${label}${detail && detail !== label ? `: ${detail}` : ""}`),
    ].join("\n");
  });
  const strands = work.headed.bars.map(({ label, title, soFar }) => `- ${label}: ${title} ${soFar.text}`);
  const made = projects
    .filter((project) => project.links.caseStudy)
    .map((project) => `- ${link(project.name, project.links.caseStudy!)} (${project.year}): ${project.outcome}`);
  const others = projects.filter((project) => !project.links.caseStudy).map((project) => `- ${project.name} (${project.year}): ${project.outcome}`);
  const habits = howIWork.beats.map(({ habit, proof }, index) => `${index + 1}. **${habit}** ${proof}`);
  const week = offTheClock.training.days.map(({ long, session }) => `- ${long}: ${session}`);

  return [
    `# ${siteName}`,
    "",
    siteCopy.description,
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
    `### ${work.headed.heading}`,
    "",
    work.headed.line,
    "",
    ...strands,
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
    `## ${howIWork.heading}`,
    "",
    howIWork.note,
    "",
    ...habits,
    "",
    `## ${offTheClock.heading}`,
    "",
    `${offTheClock.note} The section opens with my GitHub year, then my training week:`,
    "",
    ...week,
    "",
    `The page also shows what I am reading, the last film I watched, an odd fact from this week in history and what I am making now, live from ${offTheClock.reading.sourceName}, ${offTheClock.watched.sourceName}, ${offTheClock.curiosity.sourceName} and GitHub.`,
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
    `This is ${profile.shortName}'s personal site. The homepage below is the whole of it in text; the pages under it go further into each part.`,
    "",
    "## The site",
    "",
    `- ${link("Homepage as Markdown", "/index.md")}: who I am, my work, what I make, how I work, and how to reach me`,
    `- ${link("Résumé", profile.links.resume)}: my career on one page`,
    `- ${link(thingsIMake.heading, "/things-i-make")}: everything I have built`,
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
