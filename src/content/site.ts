// Relative, with the extension, so Node can load this file directly (the résumé PDF check) as well as Next.
import { siteCopy } from "./stretch/site-copy.ts";

// Approved in docs/content/redesign-copy.md.
export const siteName = "Elias Bennett";

/** A route's title: "(page) · Elias Bennett". */
export const pageTitle = (page: string) => `${page} · ${siteName}`;

export const homeTitle = siteCopy.titleHome;

export const siteDescription = siteCopy.description;

export const profile = {
  name: "Elias Bennett",
  shortName: "Elias",
  role: "Software engineer",
  location: "London",
  links: {
    email: "mailto:eliasthebennett@gmail.com",
    github: "https://github.com/3ixas",
    linkedin: "https://linkedin.com/in/elias-t-bennett/",
    resume: "/resume",
  },
} as const;
