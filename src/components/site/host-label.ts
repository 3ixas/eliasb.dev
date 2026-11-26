import { projects } from "../../content/projects.ts";

/** Hosts read aloud by name (a link's screen-reader suffix); the copy deck's "Machine surfaces" table lists each. */
export const KNOWN_HOSTS: Readonly<Record<string, string>> = {
  "github.com": "GitHub",
  "linkedin.com": "LinkedIn",
  "goodreads.com": "Goodreads",
  "letterboxd.com": "Letterboxd",
  "web.archive.org": "the Wayback Machine",
  ...Object.fromEntries(
    projects.flatMap((project) =>
      project.links.live ? [[new URL(project.links.live).hostname.replace(/^www\./, ""), project.name]] : [],
    ),
  ),
};

/** Where an external link goes, as a person would say it: a known name, else the host without "www.". */
export const hostLabel = (href: string) => {
  const host = new URL(href).hostname.replace(/^www\./, "");
  return KNOWN_HOSTS[host] ?? host;
};
