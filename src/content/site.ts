import { siteCopy } from "@/content/stretch/site-copy";

// Approved in docs/content/redesign-copy.md.
export const siteName = "Elias Bennett";

/** A route's title: "(page) · Elias Bennett". */
export const pageTitle = (page: string) => `${page} · ${siteName}`;

export const homeTitle = `${siteName}, software engineer in London`;

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
    resume:
      "https://docs.google.com/document/d/1LhawgweUl1_f85CSVY_CpOkBtZ6NC-PXMrH4jSxSUio/edit?usp=drivesdk",
  },
} as const;
